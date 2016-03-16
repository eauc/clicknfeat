(function() {
  angular.module('clickApp.controllers')
    .controller('debugCtrl', debugCtrl);

  debugCtrl.$inject = [
    '$scope',
  ];
  function debugCtrl($scope) {
    const vm = this;
    console.log('init debugCtrl');

    $scope.onStateChangeEvent('State.loadDumpFile', onLoadDumpFile, $scope);
    $scope.onStateChangeEvent('Games.local.load', onLocalLoad, $scope);
    vm.doLoadDumpFile = doLoadDumpFile;

    function onLoadDumpFile(_event_, result) {
      vm.result = result;
      $scope.$digest();
    }
    function onLocalLoad(_event_, id) {
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
