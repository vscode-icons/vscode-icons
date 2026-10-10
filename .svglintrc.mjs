import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const walk = (ast, check) => {
  const visit = node => {
    check(node);
    node.children?.forEach(visit);
  };
  ast.forEach(visit);
};

const disallowSvgComments = (reporter, _cheerio, ast) => {
  reporter.name = 'no-svg-comments';
  walk(ast, node => {
    if (node.type === 'comment') {
      reporter.error('SVG comments are not allowed');
    }
  });
};

const disallowEmptyDefs = (reporter, _cheerio, ast) => {
  reporter.name = 'non-empty-defs';
  walk(ast, node => {
    if (
      node.type === 'tag' &&
      node.name === 'defs' &&
      !node.children?.some(child => child.type === 'tag')
    ) {
      reporter.error('Empty <defs> is not allowed');
    }
  });
};

const disallowEditorAttributes = (reporter, _cheerio, ast) => {
  reporter.name = 'no-editor-attributes';
  walk(ast, node => {
    if (node.type !== 'tag') {
      return;
    }

    for (const name of Object.keys(node.attribs ?? {})) {
      if (
        /^(?:xmlns:)?(?:inkscape|sodipodi|illustrator|sketch)(?::|$)/i.test(
          name,
        )
      ) {
        reporter.error(`Disallowed SVG attribute: '${name}'`);
      }
    }
  });
};

const enforceNumericPrecision = (reporter, _cheerio, ast) => {
  reporter.name = 'numeric-precision';
  const floatPrecision = 3;
  const transformPrecision = 5;
  const numericAttributes = new Set([
    'd',
    'dx',
    'dy',
    'enable-background',
    'points',
    'stroke-dasharray',
    'x',
    'y',
  ]);
  const transformAttributes = new Set([
    'gradienttransform',
    'patterntransform',
    'transform',
  ]);
  // extracts each number inside a larger value, so it can check every token’s precision
  const numericPattern = /[-+]?(?:\d+\.\d*|\.\d+|\d+)(?:[eE][-+]?\d+)?/g;
  // tests whether the entire attribute value is one number, optionally with a unit
  const numericValuePattern =
    /^[-+]?(?:\d*\.?\d+)(?:[eE][-+]?\d+)?(?:px|pt|pc|mm|cm|m|in|ft|em|ex|%)?$/i;
  const checkNumericPrecision = (value, precision, reporter) => {
    const [mantissa, exponent = '0'] = value.split(/[eE]/);
    const decimalPlaces = Math.max(
      0,
      (mantissa.split('.')[1]?.length ?? 0) - Number(exponent),
    );
    if (decimalPlaces > precision) {
      reporter.error(
        `Numeric value '${value}' has more than ${precision} decimal places`,
      );
    }
  };
  const checkTransformPrecision = (value, reporter) => {
    const transformPattern = /([a-z]+)\s*\(([^)]*)\)/gi;
    for (const [, name, arguments_] of value.matchAll(transformPattern)) {
      const normalizedTransform = name.toLowerCase();
      const isMatrix = normalizedTransform === 'matrix';
      const isScale = normalizedTransform === 'scale';
      const numbers = [...arguments_.matchAll(numericPattern)];
      for (const [index, [numericToken]] of numbers.entries()) {
        const precision =
          isScale || (isMatrix && index < 4)
            ? transformPrecision
            : floatPrecision;
        checkNumericPrecision(numericToken, precision, reporter);
      }
    }
  };

  walk(ast, node => {
    if (node.type !== 'tag') {
      return;
    }

    for (const [name, value] of Object.entries(node.attribs ?? {})) {
      const normalizedName = name.toLowerCase();

      if (transformAttributes.has(normalizedName)) {
        checkTransformPrecision(value, reporter);
        continue;
      }

      if (
        numericAttributes.has(normalizedName) ||
        numericValuePattern.test(value)
      ) {
        for (const match of value.matchAll(numericPattern)) {
          checkNumericPrecision(match[0], floatPrecision, reporter);
        }
      }
    }
  });
};

const disallowTitle = (reporter, _cheerio, ast) => {
  reporter.name = 'no-title';
  walk(ast, node => {
    if (node.type === 'tag' && node.name === 'title') {
      reporter.error('SVG <title> elements are not allowed');
    }
  });
};

const enforceTrailingNewline = (reporter, _cheerio, _ast, { filepath }) => {
  reporter.name = 'trailing-newline';
  if (readFileSync(filepath).at(-1) !== 0x0a) {
    reporter.error('SVG file must end with a newline');
  }
};

const enforceFileSize = (reporter, _cheerio, _ast, { filepath }) => {
  // recommended SVG size targets
  // Under 1 KB	-> Excellent for simple icons
  // 1–3 KB	-> Ideal for most icons
  // 3–5 KB	-> Reasonable for more detailed icons
  reporter.name = 'file-size';
  const maxFileSize = 5 * 1024;

  if (statSync(filepath).size > maxFileSize) {
    reporter.error('SVG file must not exceed 5 KiB');
  }
};

const enforceViewBox = (reporter, _cheerio, ast, { filepath }) => {
  reporter.name = 'svg-viewbox';
  const expectedViewBox =
    resolve(filepath) === resolve('images/logo.svg')
      ? '0 0 128 128'
      : '0 0 32 32';

  walk(ast, node => {
    if (node.type !== 'tag' || node.name !== 'svg') {
      return;
    }

    const viewBox = Object.entries(node.attribs ?? {}).find(
      ([name]) => name.toLowerCase() === 'viewbox',
    )?.[1];

    if (viewBox !== expectedViewBox) {
      reporter.error(
        `SVG root element must have a 'viewBox' of '${expectedViewBox}'`,
      );
    }
  });
};

const disallowSvgAttributes = (reporter, _cheerio, ast) => {
  reporter.name = 'svg-attributes';
  const allowedAttributes = new Set(['xmlns', 'viewbox']);

  walk(ast, node => {
    if (node.type !== 'tag' || node.name !== 'svg') {
      return;
    }

    for (const name of Object.keys(node.attribs ?? {})) {
      if (!allowedAttributes.has(name.toLowerCase())) {
        reporter.error(`Disallowed SVG root attribute: '${name}'`);
      }
    }
  });
};

const customRuleSettings = {
  disallowTitle: true,
  disallowEmptyDefs: true,
  disallowSvgComments: true,
  disallowEditorAttributes: true,
  disallowSvgAttributes: true,
  enforceViewBox: true,
  enforceFileSize: false,
  enforceTrailingNewline: true,
  enforceNumericPrecision: true,
};

const customRuleImplementations = {
  disallowEmptyDefs,
  disallowSvgComments,
  disallowEditorAttributes,
  disallowSvgAttributes,
  enforceNumericPrecision,
  disallowTitle,
  enforceViewBox,
  enforceFileSize,
  enforceTrailingNewline,
};

const customRules = Object.entries(customRuleSettings)
  .filter(([, enabled]) => enabled)
  .map(([name]) => customRuleImplementations[name]);

export default {
  rules: {
    elm: {
      svg: true,
      image: false,
      metadata: false,
    },
    attr: [
      {
        // Ensure that the svg element includes the standard namespace.
        xmlns: 'http://www.w3.org/2000/svg',
        'rule::selector': 'svg',
      },
    ],
    valid: true,
    custom: customRules,
  },
};
