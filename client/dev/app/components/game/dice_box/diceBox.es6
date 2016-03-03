(function() {
  angular.module('clickApp.directives')
    .controller('gameDiceBoxCtrl', diceBoxCtrl)
    .directive('clickGameDiceBox', gameDiceBoxDirectiveFactory);

  diceBoxCtrl.$inject = [
    '$scope',
  ];
  function diceBoxCtrl($scope) {
    const vm = this;
    console.log('gameDiceBoxCtrl');

    vm.doRollDice = doRollDice;
    $scope.onStateChangeEvent('Game.dice.roll', updateList, $scope);
    self.requestAnimationFrame(updateList);

    function updateList() {
      vm.dice = R.clone(R.path(['state','game','dice'], $scope));
      $scope.$digest();
    }
    function doRollDice(sides, nb_dice) {
      $scope.stateEvent('Game.command.execute',
                        'rollDice', [sides, nb_dice]);
    }
  }

  gameDiceBoxDirectiveFactory.$inject = [];
  function gameDiceBoxDirectiveFactory() {
    return {
      restrict: 'E',
      controller: 'gameDiceBoxCtrl',
      controllerAs: 'dice_box',
      templateUrl: 'app/components/game/dice_box/dice_box.html',
      scope: true,
      link: () => {}
    };
  }
})();
