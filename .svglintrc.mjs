import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

function walk(ast, check) {
  const visit = node => {
    check(node);
    node.children?.forEach(visit);
  };
  ast.forEach(visit);
}

function disallowSvgComments(reporter, _cheerio, ast) {
  reporter.name = 'no-svg-comments';
  walk(ast, node => {
    if (node.type === 'comment') {
      reporter.error('SVG comments are not allowed');
    }
  });
}

function disallowEmptyDefs(reporter, _cheerio, ast) {
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
}

function disallowEditorAttributes(reporter, _cheerio, ast) {
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
}

function enforceNumericPrecision(reporter, _cheerio, ast) {
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
}

function disallowTitle(reporter, _cheerio, ast) {
  reporter.name = 'no-title';
  walk(ast, node => {
    if (node.type === 'tag' && node.name === 'title') {
      reporter.error('SVG <title> elements are not allowed');
    }
  });
}

function disallowMetadata(reporter, _cheerio, ast) {
  reporter.name = 'no-metadata';
  walk(ast, node => {
    if (node.type === 'tag' && node.name === 'metadata') {
      reporter.error('SVG <metadata> elements are not allowed');
    }
  });
}

function disallowEmbeddedImages(reporter, _cheerio, ast) {
  reporter.name = 'no-embedded-images';
  const disallowedElements = new Set(['image', 'feimage', 'foreignobject']);
  walk(ast, node => {
    if (
      node.type === 'tag' &&
      disallowedElements.has(node.name.toLowerCase())
    ) {
      reporter.error(`Disallowed embedded-image element: <${node.name}>`);
    }
  });
}

function disallowRaster(reporter, _cheerio, ast) {
  reporter.name = 'no-raster-images';
  const rasterDataUriPattern = /\bdata:image\/(?!svg\+xml(?:[;,]|$))/i;
  const urlPattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)]*))\s*\)/gi;
  const rasterFilePattern =
    /\.(?:apng|avif|bmp|gif|heic|heif|ico|jpe?g|jxl|png|tiff?|webp)(?:[?#].*)?$/i;
  const containsRasterReference = value =>
    rasterDataUriPattern.test(value) ||
    [...value.matchAll(urlPattern)].some(
      ([, doubleQuoted, singleQuoted, unquoted]) =>
        rasterFilePattern.test(
          (doubleQuoted ?? singleQuoted ?? unquoted).trim(),
        ),
    );

  walk(ast, node => {
    const values =
      node.type === 'tag'
        ? Object.values(node.attribs ?? {})
        : node.type === 'text'
          ? [node.data ?? '']
          : [];

    if (values.some(containsRasterReference)) {
      reporter.error('Raster image references are not allowed');
    }
  });
}

function disallowDescElement(reporter, _cheerio, ast) {
  reporter.name = 'no-desc-element';
  walk(ast, node => {
    if (node.type === 'tag' && node.name === 'desc') {
      reporter.error('SVG <desc> elements are not allowed');
    }
  });
}

function enforceTrailingNewline(reporter, _cheerio, _ast, { filepath }) {
  reporter.name = 'trailing-newline';
  if (readFileSync(filepath).at(-1) !== 0x0a) {
    reporter.error('SVG file must end with a newline');
  }
}

function enforceFileSize(reporter, _cheerio, _ast, { filepath }) {
  // recommended SVG size targets
  // Under 1 KiB	-> Excellent for simple icons
  // 1–3 KiB	-> Ideal for most icons
  // 3–5 KiB	-> Reasonable for more detailed icons
  reporter.name = 'file-size';
  const maxFileSize = 5 * 1024;

  if (statSync(filepath).size > maxFileSize) {
    reporter.error('SVG file must not exceed 5 KiB');
  }
}

function enforceViewBox(reporter, _cheerio, ast, { filepath }) {
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
}

function disallowSvgAttributes(reporter, _cheerio, ast) {
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
}

const customRuleSettings = {
  disallowTitle: true,
  disallowEmptyDefs: true,
  disallowSvgComments: true,
  disallowEditorAttributes: true,
  disallowSvgAttributes: true,
  disallowMetadata: true,
  disallowEmbeddedImages: true,
  disallowRaster: true,
  disallowDescElement: true,
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
  disallowMetadata,
  disallowEmbeddedImages,
  disallowRaster,
  disallowDescElement,
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
