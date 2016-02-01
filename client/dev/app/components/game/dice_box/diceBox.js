'use strict';

angular.module('clickApp.directives').controller('gameDiceBoxCtrl', ['$scope', function userConnectionCtrl($scope) {
  console.log('gameDiceBoxCtrl');

  function updateList() {
    $scope.dice = R.clone(R.path(['state', 'game', 'dice'], $scope));
    $scope.$digest();
  }
  $scope.onStateChangeEvent('Game.dice.roll', updateList, $scope);
  self.requestAnimationFrame(updateList);

  $scope.doRollDice = function doRoll(sides, nb_dice) {
    $scope.stateEvent('Game.command.execute', 'rollDice', [sides, nb_dice]);
  };
}]).directive('clickGameDiceBox', [function () {
  return {
    restrict: 'E',
    controller: 'gameDiceBoxCtrl',
    templateUrl: 'partials/directives/game_dice_box.html',
    scope: true,
    link: function link() {}
  };
}]);
//# sourceMappingURL=diceBox.js.map
