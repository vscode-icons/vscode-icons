import { readFileSync, statSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';
import { URL, fileURLToPath } from 'node:url';

import { Resvg } from '@resvg/resvg-js';
import { load } from 'cheerio';

function walk(ast, check) {
  const visit = node => {
    check(node);
    node.children?.forEach(visit);
  };
  ast.forEach(visit);
}

const graphics =
  'path, rect, circle, ellipse, line, polyline, polygon, text, use, image';
const nonArtwork = 'defs, clipPath, mask, pattern, marker, symbol';
const folderOverlaySizeLimits = { width: 28, height: 23 };
const folderOverlayMargins = { top: 6, right: 2, bottom: 2 };
const folderOverlayScale = 16;
const folderIconPattern =
  /^(?:folder_type_.+|default_(?:root_)?folder(?:_opened)?)\.svg$/;
const viewBoxSize = 32;

function artworks(document) {
  return document(graphics).filter(
    (_, node) => !document(node).parents(nonArtwork).length,
  );
}

function defaultFolder(opened) {
  const name = opened ? 'default_folder_opened.svg' : 'default_folder.svg';
  return readFileSync(
    fileURLToPath(new URL(`./icons/${name}`, import.meta.url)),
    'utf8',
  );
}

function normalizePath(data) {
  const document = load(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${viewBoxSize} ${viewBoxSize}"><path/></svg>`,
    { xmlMode: true },
  );
  document('path').attr('d', data);
  const normalized = new Resvg(document.xml()).toString();
  return load(normalized, { xmlMode: true })('path').attr('d');
}

function folderOverlay(filepath, source = readFileSync(filepath, 'utf8')) {
  const opened = basename(filepath).includes('opened');
  const document = load(source, { xmlMode: true });
  const template = load(defaultFolder(opened), { xmlMode: true });
  const folderLength = artworks(template).length;
  const elements = artworks(document).toArray();
  const hasOverlay = elements.length > folderLength;
  elements.slice(0, folderLength).forEach(node => document(node).remove());
  const overlay = new Resvg(document.xml(), {
    font: { loadSystemFonts: false },
  });
  const bounds = overlay.getBBox();
  return {
    hasOverlay,
    visible: Boolean(bounds),
    bounds,
    geometry: overlay.toString(),
  };
}

function folderPair(filepath) {
  const name = basename(filepath);
  if (!folderIconPattern.test(name)) {
    return;
  }
  const closedName = name.replace(/_opened\.svg$/, '.svg');
  const openedName = closedName.replace(/\.svg$/, '_opened.svg');
  const paths = [closedName, openedName].map(file =>
    join(dirname(filepath), file),
  );
  const sources = [];
  for (const path of paths) {
    try {
      sources.push(readFileSync(path, 'utf8'));
    } catch (error) {
      if (error.code === 'ENOENT' && resolve(path) !== resolve(filepath)) {
        return;
      }
      throw error;
    }
  }
  return paths.map((path, index) => folderOverlay(path, sources[index]));
}

function renderedOverlayBounds(geometry) {
  const { width, height, pixels } = new Resvg(geometry, {
    fitTo: { mode: 'width', value: viewBoxSize * folderOverlayScale },
    font: { loadSystemFonts: false },
  }).render();
  let left = width;
  let right = -1;
  let top = height;
  let bottom = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] !== 0) {
        left = Math.min(left, x);
        right = Math.max(right, x);
        top = Math.min(top, y);
        bottom = Math.max(bottom, y);
      }
    }
  }
  if (right < 0) {
    return;
  }
  return {
    x: left / folderOverlayScale,
    y: top / folderOverlayScale,
    width: (right - left + 1) / folderOverlayScale,
    height: (bottom - top + 1) / folderOverlayScale,
  };
}

function disallowComments(reporter, _cheerio, ast) {
  reporter.name = 'no-comments';
  walk(ast, node => {
    if (node.type === 'comment') {
      reporter.error('Comments are not allowed');
    }
  });
}

function disallowEmptyElements(elementName) {
  return function (reporter, _cheerio, ast) {
    reporter.name = `non-empty-${elementName}`;
    walk(ast, node => {
      if (
        node.type === 'tag' &&
        node.name === elementName &&
        !node.children?.some(child => child.type === 'tag')
      ) {
        reporter.error(`Empty <${elementName}> is not allowed`);
      }
    });
  };
}

function disallowAttributes(ruleName, rule) {
  return function (reporter, _cheerio, ast) {
    reporter.name = `no-${ruleName}-attributes`;
    walk(ast, node => {
      if (node.type !== 'tag') {
        return;
      }

      for (const name of Object.keys(node.attribs ?? {})) {
        if (rule(name, node)) {
          reporter.error(`Disallowed SVG attribute: '${name}'`);
        }
      }
    });
  };
}

function restrictStyleAttribute(allowedProperties) {
  return function (reporter, _cheerio, ast) {
    reporter.name = 'restrict-style-attribute';
    walk(ast, node => {
      if (node.type !== 'tag') {
        return;
      }

      const style = Object.entries(node.attribs ?? {}).find(
        ([name]) => name.toLowerCase() === 'style',
      )?.[1];

      if (style === undefined) {
        return;
      }

      // only CSS properties without a presentation attribute equivalent are allowed
      const disallowedProperties = style
        .split(';')
        .map(declaration => declaration.split(':')[0].trim().toLowerCase())
        .filter(property => property && !allowedProperties.has(property));

      if (disallowedProperties.length) {
        reporter.error(
          `Disallowed properties in 'style' attribute: '${disallowedProperties.join("', '")}' (use presentation attributes instead)`,
        );
      }
    });
  };
}

function disallowElement(elementName) {
  return function (reporter, _cheerio, ast) {
    reporter.name = `no-${elementName}-element`;
    walk(ast, node => {
      if (node.type === 'tag' && node.name === elementName) {
        reporter.error(`SVG <${elementName}> elements are not allowed`);
      }
    });
  };
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

function disallowRasterImages(reporter, _cheerio, ast) {
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
    reporter.error('File must not exceed 5 KiB');
  }
}

function enforceViewBox(reporter, _cheerio, ast, { filepath }) {
  reporter.name = 'svg-viewbox';
  const expectedViewBox =
    resolve(filepath) === resolve('images/logo.svg')
      ? '0 0 128 128'
      : `0 0 ${viewBoxSize} ${viewBoxSize}`;

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

function enforceIconMargin(reporter, _cheerio, _ast, { filepath }) {
  reporter.name = 'icon-margin';
  const margin = 2;
  const isFolderIcon =
    /^(?:folder_type_|default_(?:root_)?folder(?:_opened)?\.svg$)/.test(
      basename(filepath),
    );
  const rendered = new Resvg(readFileSync(filepath), {
    font: { loadSystemFonts: false },
  }).render();
  const { height, pixels, width } = rendered;
  const edges = new Set();

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] === 0) {
        continue;
      }

      if (!isFolderIcon && x < margin) {
        edges.add('left');
      }
      if (x >= width - margin) {
        edges.add('right');
      }
      if (y < margin) {
        edges.add('top');
      }
      if (y >= height - margin) {
        edges.add('bottom');
      }
    }
  }

  if (edges.size) {
    reporter.error(
      `Insufficient ${margin}px artwork margin from: ${[...edges].join(', ')}`,
    );
  }
}

function enforceFolderShape(reporter, _cheerio, _ast, { filepath }) {
  reporter.name = 'folder-shape';
  if (!folderIconPattern.test(basename(filepath))) {
    return;
  }

  const opened = filepath.includes('opened');
  const document = load(readFileSync(filepath, 'utf8'), { xmlMode: true });
  const template = load(defaultFolder(opened), { xmlMode: true });
  const expected = artworks(template).toArray();
  const folder = artworks(document).toArray().slice(0, expected.length);
  if (
    folder.length !== expected.length ||
    folder.some(
      (node, i) =>
        node.name !== expected[i].name ||
        !node.attribs?.d ||
        normalizePath(node.attribs.d) !== normalizePath(expected[i].attribs.d),
    )
  ) {
    reporter.error(
      `Folder must have the same shape as its default (${opened ? 'default_folder_opened.svg' : 'default_folder.svg'})`,
    );
  }
}

function enforceFolderMargins(reporter, _cheerio, _ast, { filepath }) {
  reporter.name = 'folder-margins';
  if (!folderIconPattern.test(basename(filepath))) {
    return;
  }
  const opened = basename(filepath).includes('opened');
  const template = defaultFolder(opened);
  const folderLength = artworks(load(template, { xmlMode: true })).length;
  const document = load(readFileSync(filepath, 'utf8'), { xmlMode: true });
  artworks(document)
    .toArray()
    .slice(folderLength)
    .forEach(node => document(node).remove());
  const options = { font: { loadSystemFonts: false } };
  const folder = new Resvg(document.xml(), options).getBBox();
  const expected = new Resvg(template, options).getBBox();
  if (!folder || !expected) {
    reporter.error('Folder shape must be visible in the icon and its default');
    return;
  }
  const edges = box => ({
    top: box.y,
    right: box.x + box.width,
    bottom: box.y + box.height,
  });
  const expectedEdges = edges(expected);
  const mismatches = Object.entries(edges(folder))
    .filter(([edge, value]) => Math.abs(value - expectedEdges[edge]) > 0.00001)
    .map(([edge]) => edge);
  if (mismatches.length) {
    reporter.error(
      `Folder shape margins differ from its default (${opened ? 'default_folder_opened.svg' : 'default_folder.svg'}): ${mismatches.join(', ')}`,
    );
  }
}

function enforceFolderIconOverlay(reporter, _cheerio, _ast, { filepath }) {
  reporter.name = 'folder-icon-overlay';
  const pair = folderPair(filepath);
  if (!pair || pair.some(icon => !icon)) {
    return;
  }
  const [closed, opened] = pair;
  if (
    closed.hasOverlay !== opened.hasOverlay ||
    (closed.hasOverlay && (!closed.visible || !opened.visible))
  ) {
    reporter.error('Folder overlay must be visible in both variants');
    return;
  }
  if (closed.hasOverlay && closed.geometry !== opened.geometry) {
    reporter.error('Overlay icon in both folder variants must be identical');
  }
}

function enforceFolderIconOverlaySize(reporter, _cheerio, _ast, { filepath }) {
  reporter.name = 'folder-icon-overlay-size';
  if (!folderIconPattern.test(basename(filepath))) {
    return;
  }
  const { hasOverlay, geometry } = folderOverlay(filepath);
  if (!hasOverlay) {
    return;
  }
  const bounds = renderedOverlayBounds(geometry);
  if (!bounds) {
    return;
  }
  // Rasterization can expand the measured bounds by up to one sample pixel.
  const tolerance = 1 / folderOverlayScale;
  if (bounds.width > folderOverlaySizeLimits.width + tolerance) {
    reporter.error(
      `Overlay icon width exceeds limit (actual ${bounds.width}px, expected ${folderOverlaySizeLimits.width}px)`,
    );
  }
  if (bounds.height > folderOverlaySizeLimits.height + tolerance) {
    reporter.error(
      `Overlay icon height exceeds limit (actual ${bounds.height}px, expected ${folderOverlaySizeLimits.height}px)`,
    );
  }
}

function enforceFolderIconOverlayPosition(
  reporter,
  _cheerio,
  _ast,
  { filepath },
) {
  reporter.name = 'folder-icon-overlay-position';
  if (!folderIconPattern.test(basename(filepath))) {
    return;
  }
  const { hasOverlay, geometry } = folderOverlay(filepath);
  if (!hasOverlay) {
    return;
  }
  const bounds = renderedOverlayBounds(geometry);
  if (!bounds) {
    return;
  }
  const tolerance = { top: 14, right: 2, bottom: 4 };
  const topMargin = bounds.y;
  const rightMargin = viewBoxSize - bounds.x - bounds.width;
  const bottomMargin = viewBoxSize - bounds.y - bounds.height;
  const violations = [];
  if (Math.abs(topMargin - folderOverlayMargins.top) > tolerance.top) {
    violations.push(
      `top (target: ${folderOverlayMargins.top}{+${tolerance.top}}px, actual: ${topMargin.toFixed(2)}px)`,
    );
  }
  if (Math.abs(rightMargin - folderOverlayMargins.right) > tolerance.right) {
    violations.push(
      `right (target: ${folderOverlayMargins.right}{+${tolerance.right}}px, actual: ${rightMargin.toFixed(2)}px)`,
    );
  }
  if (Math.abs(bottomMargin - folderOverlayMargins.bottom) > tolerance.bottom) {
    violations.push(
      `bottom (target: ${folderOverlayMargins.bottom}{+${tolerance.bottom}}px), actual: ${bottomMargin.toFixed(2)}px)`,
    );
  }
  if (violations.length) {
    reporter.error(`Overlay icon position violation: ${violations.join(', ')}`);
  }
}

const customRuleSettings = {
  disallowComments: true,
  disallowRasterImages: true,
  disallowEmbeddedImages: true,
  disallowDescElement: true,
  disallowTitleElement: true,
  disallowScriptElement: true,
  disallowMetadataElement: true,
  disallowEmptyDefsElements: true,
  disallowSvgAttributes: true,
  restrictStyleAttribute: true,
  disallowEditorAttributes: true,
  enforceViewBox: true,
  enforceFileSize: false,
  enforceTrailingNewline: true,
  enforceNumericPrecision: true,
  enforceIconMargin: true,
  enforceFolderShape: true,
  enforceFolderMargins: true,
  enforceFolderIconOverlay: true,
  enforceFolderIconOverlaySize: true,
  enforceFolderIconOverlayPosition: true,
};

const customRuleImplementations = {
  disallowComments,
  disallowEmptyDefsElements: disallowEmptyElements('defs'),
  disallowEditorAttributes: disallowAttributes('editor', name =>
    /^(?:xmlns:)?(?:inkscape|sodipodi|illustrator|sketch)(?::|$)/i.test(name),
  ),
  restrictStyleAttribute: restrictStyleAttribute(
    new Set(['isolation', 'mix-blend-mode']),
  ),
  disallowSvgAttributes: disallowAttributes(
    'svg',
    (name, node) =>
      node.name === 'svg' &&
      !new Set(['xmlns', 'viewbox']).has(name.toLowerCase()),
  ),
  disallowRasterImages,
  disallowEmbeddedImages,
  disallowTitleElement: disallowElement('title'),
  disallowScriptElement: disallowElement('script'),
  disallowDescElement: disallowElement('desc'),
  disallowMetadataElement: disallowElement('metadata'),
  enforceViewBox,
  enforceFileSize,
  enforceTrailingNewline,
  enforceNumericPrecision,
  enforceIconMargin,
  enforceFolderShape,
  enforceFolderMargins,
  enforceFolderIconOverlay,
  enforceFolderIconOverlaySize,
  enforceFolderIconOverlayPosition,
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
