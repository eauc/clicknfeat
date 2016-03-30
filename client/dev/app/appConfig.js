'use strict';

(function () {
  angular.module('clickApp').config(defaultRoute).config(allowBlobUrls);

  defaultRoute.$inject = ['$urlRouterProvider'];
  function defaultRoute($urlRouterProvider) {
    $urlRouterProvider.otherwise('/lounge');
  }
  allowBlobUrls.$inject = ['$compileProvider'];
  function allowBlobUrls($compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
  }
})();
//# sourceMappingURL=appConfig.js.map
