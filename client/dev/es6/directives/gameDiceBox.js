angular.module('clickApp.directives')
  .controller('gameDiceBoxCtrl', [
    '$scope',
    function userConnectionCtrl($scope) {
      console.log('gameDiceBoxCtrl');
      $scope.doRollDice = function doRoll(sides, nb_dice) {
        $scope.doExecuteCommand('rollDice', sides, nb_dice);
      };
    }
  ])
  .directive('clickGameDiceBox', [
    function() {
      return {
        restrict: 'E',
        controller: 'gameDiceBoxCtrl',
        templateUrl: 'partials/directives/game_dice_box.html',
        scope: true,
        link: function(/*scope, element, attrs*/) {
        }
      };
    }
  ]);
