'use strict';

(function () {
  angular.module('clickApp.controllers').controller('gameLogCtrl', gameLogCtrl);

  gameLogCtrl.$inject = ['$scope'];
  function gameLogCtrl($scope) {
    var vm = this;
    console.log('init gameLogCtrl');

    activate();

    function activate() {
      $scope.onStateChangeEvent('Game.command.change', updateLists, $scope);
      self.requestAnimationFrame(updateLists);
    }

    function updateLists() {
      vm.undo = R.path(['state', 'game', 'undo'], $scope);
      vm.undo_log = R.path(['state', 'game', 'undo_log'], $scope);
      vm.commands_log = R.path(['state', 'game', 'commands_log'], $scope);
      vm.commands = R.path(['state', 'game', 'commands'], $scope);
      $scope.$digest();
    }
  }
})();
//# sourceMappingURL=gameLogCtrl.js.map
