module.exports = {
  files: [
    'src/**/*.ts',
    'test/fixtures/**/*.ts',
    'locale/*.json',
    'package.json',
    'package.nls.json',
    'package.nls.template.json',
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
        ? `${process.env.APPDATA}\\nvm\\v8.9.3\\node`
        : `${require('os').homedir()}/.nvm/versions/node/v8.9.3/bin/node`,
  },
  delays: {
    run: 500,
  },
  debug: true,
  reportConsoleErrorAsError: true,
  setup: (wallaby) => wallaby.testFramework.ui('bdd'),
};
