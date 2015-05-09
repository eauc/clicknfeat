'use strict';

angular.module('clickApp.controllers')
  .controller('gameSetupCtrl', [
    '$scope',
    'gameBoard',
    'game',
    function($scope,
             gameBoardService,
             gameService) {
      console.log('init gameSetupCtrl');
      $scope.board_name = gameBoardService.name($scope.game.board);
      $scope.$on('changeBoard', function() {
        $scope.board_name = gameBoardService.name($scope.game.board);
        $scope.$digest();
      });
      $scope.doSetBoard = function doSetBoard() {
        gameService.executeCommand('setBoard',
                                   gameBoardService.forName($scope.board_name,
                                                            $scope.boards),
                                   $scope,
                                   $scope.game);
      };
    }
  ]);
