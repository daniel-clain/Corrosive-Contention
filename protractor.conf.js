
exports.config = {
  allScriptsTimeout: 11000,
  seleniumAddress: 'http://127.0.0.1:4444/wd/hub',
  specs: [
    './cucumber/features/*.feature'
  ],
  capabilities: {
    'browserName': 'chrome'
  },
  directConnect: true,
  baseUrl: 'http://localhost:4200/',
  framework: 'custom',
  frameworkPath: require.resolve('protractor-cucumber-framework'),
  cucumberOpts: {
      compiler: "ts:ts-node/register",
      strict: true,
      require: ['./cucumber/stepDefinitions/*.ts'],
      tags: ''
  }
};
