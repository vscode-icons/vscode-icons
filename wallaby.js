module.exports = {
  files: [
    'src/**/*.ts',
    'test/fixtures/**/*.ts',
    'lang.nls.bundle.json',
    'package.json',
    'locale/**',
    'icons/*.*',
  ],
  tests: ['test/**/*.test.ts'],
  filesWithNoCoverageCalculated: [],
  preprocessors: {
    '**/*.json': (file, done) => done(file.rename(`../${file.path}`).content),
    'icons/*.*': (file, done) => done(file.rename(`../${file.path}`).content),
  },
  hints: {
    ignoreCoverage: /\/* wallaby ignore next\/*/,
  },
  testFramework: 'mocha',
  env: {
    type: 'node',
    runner:
      process.platform === 'win32'
        ? `${process.env.APPDATA}\\nvm\\v10.2.0\\node`
        : `${require('os').homedir()}/.nvm/versions/node/v10.2.0/bin/node`,
  },
  delays: {
    run: 500,
  },
  debug: true,
  reportConsoleErrorAsError: true,
  setup: (wallaby) => wallaby.testFramework.ui('bdd'),
};
