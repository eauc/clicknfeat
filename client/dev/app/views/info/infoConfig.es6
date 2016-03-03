(function() {
  angular.module('clickApp')
    .config(infoRoute);

  infoRoute.$inject = [
    '$stateProvider',
  ];
  function infoRoute($stateProvider) {
    $stateProvider
      .state('info', {
        url: '/info',
        templateUrl: 'app/views/info/info.html',
        controller: 'infoCtrl',
        controllerAs: 'info',
        data: {}
      });
  }
  allowBlobUrls.$inject = [ '$compileProvider' ];
  function allowBlobUrls($compileProvider) {   
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|blob):/);
  }
})();
