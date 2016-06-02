(function() {
  angular.module('clickApp.directives')
    .controller('gameDiceBoxCtrl', diceBoxCtrl)
    .directive('clickGameDiceBox', gameDiceBoxDirectiveFactory);

  diceBoxCtrl.$inject = [
    '$scope',
    'appGame',
  ];
  function diceBoxCtrl($scope,
                       appGameService) {
    const vm = this;
    console.log('gameDiceBoxCtrl');

    vm.doRollDice = doRollDice;

    activate();

    function activate() {
      $scope.bindCell((dice) => {
        vm.dice = R.clone(dice).slice(-10).reverse();
      }, appGameService.dice, $scope);
    }
    function doRollDice(sides, nb_dice) {
      $scope.sendAction('Game.command.execute',
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
