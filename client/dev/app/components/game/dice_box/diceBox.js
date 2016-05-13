'use strict';

(function () {
  angular.module('clickApp.directives').controller('gameDiceBoxCtrl', diceBoxCtrl).directive('clickGameDiceBox', gameDiceBoxDirectiveFactory);

  diceBoxCtrl.$inject = ['$scope'];
  function diceBoxCtrl($scope) {
    var vm = this;
    console.log('gameDiceBoxCtrl');

    vm.doRollDice = doRollDice;

    function doRollDice(sides, nb_dice) {
      $scope.sendAction('Game.command.execute', 'rollDice', [sides, nb_dice]);
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
      link: function link() {}
    };
  }
})();
//# sourceMappingURL=diceBox.js.map
