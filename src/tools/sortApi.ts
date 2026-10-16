import { readFileSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';

import { ErrorHandler } from '../common/errorHandler';

interface ITarget {
  file: string;
  start: RegExp;
  key: RegExp;
}

interface IItem {
  key: string;
  raw: string;
  index: number;
}

const API_DIR = resolve('./src/iconsManifest');

const ICON_KEY_RE = /\bicon:\s*'([^']+)'/;
const LEADING_COMMENTS_RE = /^(\s*\/\/[^\n]*\n|\s*\/\*[\s\S]*?\*\/)*\s*/;
// Jumps straight to strings, comments, brackets and commas; strings/comments are skipped whole.
const TOKEN_RE =
  /'(?:\\[\s\S]|[^'\\])*'|"(?:\\[\s\S]|[^"\\])*"|`(?:\\[\s\S]|[^`\\])*`|\/\/[^\n]*|\/\*[\s\S]*?\*\/|[[\]{}(),]/g;

const TARGETS: ITarget[] = [
  {
    file: 'supportedExtensions.ts',
    start: /\n {2}supported: \[/,
    key: ICON_KEY_RE,
  },
  {
    file: 'supportedFolders.ts',
    start: /\n {2}supported: \[/,
    key: ICON_KEY_RE,
  },
  {
    file: 'languages.ts',
    start: /\nexport const languages = \{/,
    key: /^['"]?([\w$-]+)/,
  },
];

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

const inspect = ({ file, start, key }: ITarget, check: boolean): number => {
  const filePath = join(API_DIR, file);
  const text = readFileSync(filePath, 'utf8');

  const match = start.exec(text);
  if (!match) {
    throw new Error(`${file}: start marker not found`);
  }
  const open = match.index + match[0].length - 1;
  const { entries, close } = splitEntries(text, open);

  const items = entries.map((raw, index): IItem => {
    const m = raw.replace(LEADING_COMMENTS_RE, '').match(key);
    if (!m) {
      throw new Error(`${file}: cannot find sort key in entry:\n${raw}`);
    }
    return { key: m[1].toLowerCase(), raw, index };
  });
  const inOrder = findInOrder(items);
  const misplaced = items.filter(item => !inOrder.has(item.index));

  if (!misplaced.length) {
    console.info(`${file}: OK`);
    return 0;
  }

  if (check) {
    const keys = misplaced.map(item => item.key).join(', ');
    console.info(`${file}: ${misplaced.length} misplaced entries: ${keys}`);
    return misplaced.length;
  }

  const indent = text.slice(open + 1).match(/\n([ \t]*)\S/)[1];
  const closeIndent = text.slice(text.lastIndexOf('\n', close) + 1, close);
  const body = [...items]
    .sort(compare)
    .map(item => `\n${indent}${item.raw},`)
    .join('');
  writeFileSync(
    filePath,
    text.slice(0, open + 1) + body + '\n' + closeIndent + text.slice(close),
  );
  console.info(`${file}: sorted ${misplaced.length} misplaced entries`);
  return 0;
};

// Pass `--check` to only report misplaced entries instead of rewriting the files.
// Exit code: 0 all good, 1 misplaced entries found (with `--check`), 2 error.
const sortApi = (argv: string[]): void => {
  try {
    const check = argv.includes('--check');
    let issues = 0;
    for (const target of TARGETS) {
      issues += inspect(target, check);
    }
    if (issues) {
      console.info('Run `npm run sort:api` to fix.');
    }
    process.exitCode = issues ? 1 : 0;
  } catch (error: unknown) {
    ErrorHandler.logError(error);
    process.exitCode = 2;
  }
};

sortApi(process.argv);
