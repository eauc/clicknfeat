'use strict';

(function () {
  angular.module('clickApp').config(debugRoute);

  debugRoute.$inject = ['$stateProvider'];
  function debugRoute($stateProvider) {
    $stateProvider.state('debug', {
      url: '/debug',
      templateUrl: 'app/views/debug/debug.html',
      controller: 'debugCtrl',
      controllerAs: 'debug'
    });
  }
})();
//# sourceMappingURL=debugConfig.js.map
