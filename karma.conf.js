// Karma configuration
// Generated on Sun Jan 10 2016 14:20:49 GMT+0100 (CET)

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-jasmine-diff-reporter',
      'karma-jasmine-html-reporter'
    ],
    frameworks: ['jasmine'],


    // list of files / patterns to load in the browser
    files: [
      'client/dev/lib/babel-polyfill/browser-polyfill.js',
      'client/dev/lib/xregexp/src/xregexp.js',
      'client/dev/lib/ramda/dist/ramda.js',
      'client/dev/lib/underscore.string/dist/underscore.string.js',
      'client/dev/lib/angular/angular.js',
      'client/dev/lib/angular-ui-router/release/angular-ui-router.min.js',
      'client/dev/lib/angular-mocks/angular-mocks.js',
      'client/dev/lib/mousetrap/mousetrap.js',
      'client/dev/app/mixins/**/*.js',
      'client/dev/app/specs/helpers/*.js',
      'client/dev/app/specs/env.js',
      'client/dev/app/app.js',
      'client/dev/app/models/**/*.js',
      'client/dev/app/services/**/*.js',
      {
        pattern: '**/*.js.map',
        included: false
      }
    ],


    // list of files to exclude
    // exclude: [ 'client/dev/app/app.js' ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: { },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: [
      'html',
      'jasmine-diff',
      'progress'
    ],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,
    restartOnFileChange: true,

    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: [],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: false,

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity
  });
};
