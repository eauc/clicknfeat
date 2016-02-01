angular.module('clickApp.controllers')
  .controller('debugCtrl', [
    '$scope',
    function($scope) {
      console.log('init debugCtrl');

      $scope.onStateChangeEvent('State.loadDumpFile', (event, result) => {
        $scope.result = result;
        $scope.$digest();
      }, $scope);
      $scope.onStateChangeEvent('Games.local.load', (event, id) => {
        $scope.goToState('game', {
          where: 'offline',
          id: id
        });
      }, $scope);
      
      $scope.doLoadDumpFile = function doLoadDumpFile(files) {
        $scope.stateEvent('State.loadDumpFile', files[0]);
      };
    }
  ]);
