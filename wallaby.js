module.exports = (wallaby) => ({
  files: [
    "src/**/*.ts",
    "test/support/*.ts",
    "locale/lang.*.json",
    "package.json",
    "package.nls.json",
    "package.nls.template.json",
    "icons/*.*"
  ],
  tests: [
    "test/**/*.test.ts"
  ],
  filesWithNoCoverageCalculated: [
  ],
  preprocessors: {
    '**/*.json': (file, done) => {
      done(file.rename(`../${file.path}`).content)
    },
    "icons/*.*": (file, done) => {
      done(file.rename(`../${file.path}`).content)
    }
  },
  hints: {
    ignoreCoverage: /\/* wallaby ignore next\/*/
  },
  testFramework: "mocha",
  env: {
    type: "node",
    runner: `${require('os').homedir()}/.nvm/versions/node/v7.9.0/bin/node`
  },
  delays: {
    run: 500
  },
  debug: true,
  reportConsoleErrorAsError: true,
  setup: (wallaby) => wallaby.testFramework.ui('bdd')
});
