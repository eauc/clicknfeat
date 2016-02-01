angular.module('clickApp.controllers')
  .controller('gameLogCtrl', [
    '$scope',
    function($scope) {
      console.log('init gameLogCtrl');

      function updateLists() {
        $scope.undo = R.path(['state','game','undo'], $scope);
        $scope.undo_log = R.path(['state','game','undo_log'], $scope);
        $scope.commands_log = R.path(['state','game','commands_log'], $scope);
        $scope.commands = R.path(['state','game','commands'], $scope);
        $scope.$digest();
      }
      $scope.onStateChangeEvent('Game.command.execute', updateLists, $scope);
      $scope.onStateChangeEvent('Game.command.replay', updateLists, $scope);
      $scope.onStateChangeEvent('Game.command.undo', updateLists, $scope);
      $scope.onStateChangeEvent('Game.loaded', updateLists, $scope);
      self.requestAnimationFrame(updateLists);
    }
  ]);
