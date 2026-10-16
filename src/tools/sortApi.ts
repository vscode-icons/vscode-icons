import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

import { ErrorHandler } from '../common/errorHandler';

interface ITarget {
  file: string;
  start: RegExp;
  key: (entry: string) => RegExpMatchArray | null;
}

interface IItem {
  key: string;
  raw: string;
  index: number;
}

interface IGroup {
  target: string;
  entries: IItem[];
}

const API_DIR = resolve('./src/iconsManifest');

const ICON_KEY_RE = /\bicon:\s*'([^']+)'/;
const LANGUAGE_KEY_RE = /^['"]?([\w$-]+)/;
const LEADING_COMMENTS_RE = /^(\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/)*\s*/;
// Jumps straight to strings, comments, brackets and commas; strings/comments are skipped whole.
const TOKEN_RE =
  /'(?:\\[\s\S]|[^'\\])*'|"(?:\\[\s\S]|[^"\\])*"|`(?:\\[\s\S]|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/|[[\]{}(),]/g;

const TARGETS: ITarget[] = [
  {
    file: 'supportedExtensions.ts',
    start: /\n {2}supported: \[/,
    key: entry => entry.match(ICON_KEY_RE),
  },
  {
    file: 'supportedFolders.ts',
    start: /\n {2}supported: \[/,
    key: entry => entry.match(ICON_KEY_RE),
  },
  {
    file: 'languages.ts',
    start: /\nexport const languages = \{/,
    key: entry => entry.replace(LEADING_COMMENTS_RE, '').match(LANGUAGE_KEY_RE),
  },
];

const useColor = process.stdout.isTTY && !process.env.NO_COLOR;
const paint =
  (code: string) =>
  (text: string): string =>
    useColor ? `\x1b[${code}m${text}\x1b[0m` : text;
const bold = paint('1');
const dim = paint('2');
const red = paint('31');
const green = paint('32');
const cyan = paint('36');
const count = (n: number, text: string = String(n)): string =>
  n ? red(text) : green(text);

const compare = (a: IItem, b: IItem): number =>
  a.key < b.key ? -1 : a.key > b.key ? 1 : 0;

// Splits the top-level entries of the array/object whose opening bracket is at `open`.
const splitEntries = (
  src: string,
  open: number,
): { entries: string[]; close: number } => {
  const entries: string[] = [];
  let depth = 0;
  let from = open + 1;
  TOKEN_RE.lastIndex = open;
  for (let m = TOKEN_RE.exec(src); m; m = TOKEN_RE.exec(src)) {
    const c = m[0];
    if (c.length > 1) {
      continue;
    }
    if (c === '[' || c === '{' || c === '(') {
      depth++;
    } else if (c === ']' || c === '}' || c === ')') {
      if (--depth === 0) {
        const last = src.slice(from, m.index).trim();
        if (last) {
          entries.push(last);
        }
        return { entries, close: m.index };
      }
    } else if (depth === 1) {
      entries.push(src.slice(from, m.index).trim());
      from = m.index + 1;
    }
  }
  throw new Error('Unbalanced brackets');
};

// Longest run of entries already in order; everything outside it is what actually needs to move.
const findInOrder = (items: IItem[]): Set<number> => {
  const tails: number[] = [];
  const prev = new Array<number>(items.length);
  for (let i = 0; i < items.length; i++) {
    let lo = 0;
    let hi = tails.length;
    while (lo < hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (compare(items[tails[mid]], items[i]) <= 0) {
        lo = mid + 1;
      } else {
        hi = mid;
      }
    }
    prev[i] = lo > 0 ? tails[lo - 1] : -1;
    tails[lo] = i;
  }
  const inOrder = new Set<number>();
  for (
    let i = tails.length ? tails[tails.length - 1] : -1;
    i !== -1;
    i = prev[i]
  ) {
    inOrder.add(i);
  }
  return inOrder;
};

const targetOf = (item: IItem, anchors: IItem[]): string => {
  const at = anchors.findIndex(a => compare(a, item) > 0);
  const before = at === -1 ? anchors[anchors.length - 1] : anchors[at - 1];
  const after = at === -1 ? undefined : anchors[at];
  return before && after
    ? `between ${green(before.key)} and ${green(after.key)}`
    : after
      ? `before ${green(after.key)}`
      : `after ${green(before.key)}`;
};

// Collapses neighbouring misplaced entries that belong in the same spot into one line.
const describeAll = (
  misplaced: IItem[],
  items: IItem[],
  anchors: IItem[],
): string[] => {
  const groups: IGroup[] = [];
  for (const item of misplaced) {
    const target = targetOf(item, anchors);
    const last = groups[groups.length - 1];
    if (
      last &&
      last.target === target &&
      last.entries[last.entries.length - 1].index === item.index - 1
    ) {
      last.entries.push(item);
    } else {
      groups.push({ target, entries: [item] });
    }
  }
  return groups.map(({ target, entries }) => {
    const first = entries[0];
    const names =
      entries.length <= 3
        ? entries.map(e => cyan(e.key)).join(', ')
        : `${cyan(first.key)} .. ${cyan(entries[entries.length - 1].key)} ${dim(`(${entries.length} entries)`)}`;
    const now =
      first.index > 0 ? `now after ${items[first.index - 1].key}` : 'now first';
    return `${names} should be ${target}  ${dim(`(${now})`)}`;
  });
};

const inspect = (
  { file, start, key }: ITarget,
  check: boolean,
  out: string[],
): number => {
  const filePath = join(API_DIR, file);
  const src = readFileSync(filePath, 'utf8');
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const text = src.replace(/\r\n/g, '\n');

  const match = start.exec(text);
  if (!match) {
    throw new Error(`${file}: start marker not found`);
  }
  const open = match.index + match[0].length - 1;
  const { entries, close } = splitEntries(text, open);

  const items = entries.map((raw, index): IItem => {
    const m = key(raw);
    if (!m) {
      throw new Error(`${file}: cannot find sort key in entry:\n${raw}`);
    }
    return { key: m[1].toLowerCase(), raw, index };
  });
  const inOrder = findInOrder(items);
  const misplaced = items.filter(item => !inOrder.has(item.index));

  if (!misplaced.length) {
    out.push(
      `${bold(file)}: ${count(0, 'OK')}  ${dim(`(${items.length} entries)`)}`,
    );
    return 0;
  }

  if (check) {
    const anchors = items.filter(item => inOrder.has(item.index));
    const lines = describeAll(misplaced, items, anchors);
    out.push(
      '',
      `${bold(file)}: ${count(misplaced.length)} misplaced entries in ${lines.length} spots`,
    );
    for (const line of lines) {
      out.push(`  - ${line}`);
    }
    return misplaced.length;
  }

  const sorted = [...items].sort(compare);
  const indent = text.slice(open + 1).match(/\n([ \t]*)\S/)[1];
  const closeIndent = text.slice(text.lastIndexOf('\n', close) + 1, close);
  const body = sorted.map(item => `\n${indent}${item.raw},`).join('');
  const result =
    text.slice(0, open + 1) + body + '\n' + closeIndent + text.slice(close);
  writeFileSync(filePath, result.replace(/\n/g, eol));
  out.push(
    `${bold(file)}: ${green('sorted')}  ${dim(`(${misplaced.length} misplaced entries fixed)`)}`,
  );
  return 0;
};

// Sorts the icon API entries alphabetically.
// Pass `--check` to only report misplaced entries instead of rewriting the files.
// Exit code: 0 all good, 1 misplaced entries found (with `--check`), 2 error.
const sortApi = (argv: string[]): void => {
  try {
    const check = argv.includes('--check');
    const out: string[] = [];
    let issues = 0;
    for (const target of TARGETS) {
      issues += inspect(target, check, out);
    }

    if (issues) {
      out.push('', `Run ${bold('npm run sort:api')} to fix.`);
    }
    console.info(out.join('\n'));

    process.exitCode = issues ? 1 : 0;
  } catch (error: unknown) {
    ErrorHandler.logError(error);
    process.exitCode = 2;
  }
};

sortApi(process.argv);
