import { spawnSync } from 'node:child_process';
import { error, info } from 'node:console';
import {
  existsSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { resolve } from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';

function readOption(name, defaultValue) {
  const index = process.argv.indexOf(name);
  return index === -1 ? defaultValue : process.argv[index + 1];
}

const projectDirectory = resolve(process.cwd(), readOption('--project', '.'));
const outputFile = readOption('--output', undefined);
const runCount = Number.parseInt(readOption('--runs', '5'), 10);

if (!Number.isInteger(runCount) || runCount < 1) {
  throw new Error('--runs must be a positive integer.');
}

const bundleDirectory = resolve(projectDirectory, 'dist/src');
const isWindows = process.platform === 'win32';
const command = isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
const commandArguments = isWindows
  ? ['/d', '/s', '/c', 'npm.cmd run --ignore-scripts dist:dev']
  : ['run', '--ignore-scripts', 'dist:dev'];
const measurements = [];
let bundleSizes;

for (let run = 0; run <= runCount; run += 1) {
  if (existsSync(bundleDirectory)) {
    for (const filename of readdirSync(bundleDirectory).filter(
      filename =>
        filename.endsWith('.bundle.js') || filename.endsWith('.bundle.js.map'),
    )) {
      rmSync(resolve(bundleDirectory, filename), { force: true });
    }
  }

  const start = performance.now();
  const result = spawnSync(command, commandArguments, {
    cwd: projectDirectory,
    encoding: 'utf8',
  });
  const durationMs = performance.now() - start;

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    error(result.stdout);
    error(result.stderr);
    throw new Error(`Bundler command failed with exit code ${result.status}.`);
  }

  const bundles = readdirSync(bundleDirectory)
    .filter(filename => filename.endsWith('.bundle.js'))
    .map(filename => ({
      filename,
      bytes: statSync(resolve(bundleDirectory, filename)).size,
    }))
    .sort((left, right) => left.filename.localeCompare(right.filename));

  if (bundles.length === 0) {
    throw new Error(
      `No JavaScript bundles were written to ${bundleDirectory}.`,
    );
  }

  if (run === 0) {
    bundleSizes = bundles;
  } else {
    measurements.push(durationMs);
  }
}

const sortedMeasurements = [...measurements].sort(
  (left, right) => left - right,
);
const middle = Math.floor(sortedMeasurements.length / 2);
const medianMs =
  sortedMeasurements.length % 2 === 0
    ? (sortedMeasurements[middle - 1] + sortedMeasurements[middle]) / 2
    : sortedMeasurements[middle];
const report = {
  projectDirectory,
  command: 'npm run --ignore-scripts dist:dev',
  warmupRuns: 1,
  measurementsMs: measurements.map(value => Number(value.toFixed(2))),
  medianMs: Number(medianMs.toFixed(2)),
  bundles: bundleSizes,
  totalBundleBytes: bundleSizes.reduce(
    (total, bundle) => total + bundle.bytes,
    0,
  ),
};

info(JSON.stringify(report, null, 2));

if (outputFile) {
  writeFileSync(
    resolve(process.cwd(), outputFile),
    `${JSON.stringify(report, null, 2)}\n`,
  );
}
