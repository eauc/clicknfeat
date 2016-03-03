'use strict';

(function () {
  angular.module('clickApp.controllers').controller('debugCtrl', debugCtrl);

  debugCtrl.$inject = ['$scope'];
  function debugCtrl($scope) {
    var vm = this;
    console.log('init debugCtrl');

    $scope.onStateChangeEvent('State.loadDumpFile', onLoadDumpFile, $scope);
    $scope.onStateChangeEvent('Games.local.load', onLocalLoad, $scope);
    vm.doLoadDumpFile = doLoadDumpFile;

    function onLoadDumpFile(event, result) {
      vm.result = result;
      $scope.$digest();
    }
    function onLocalLoad(event, id) {
      $scope.app.goToState('game.main', {
        online: 'offline',
        private: 'private',
        id: id
      });
    }
    function doLoadDumpFile(files) {
      $scope.stateEvent('State.loadDumpFile', files[0]);
    }
  }
})();
//# sourceMappingURL=debugCtrl.js.map
