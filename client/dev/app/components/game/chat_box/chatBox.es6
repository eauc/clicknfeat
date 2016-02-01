angular.module('clickApp.directives')
  .controller('gameChatBoxCtrl', [
    '$scope',
    'game',
    function userConnectionCtrl($scope,
                                gameService) {
      console.log('gameChatBoxCtrl');

      $scope.chat = { msg: '' };
      $scope.doSendChatMessage = function() {
        var msg = s.trim($scope.chat.msg);
        if(R.isEmpty(msg)) return;

        R.pipeP(
          gameService.sendChat$(R.path(['user', 'state', 'name'], $scope.state),
                                msg),
          () => {
            $scope.chat.msg = '';
            $scope.$digest();
          }
        )($scope.state.game);
      };
      $scope.digestOnStateChangeEvent('Game.chat', $scope);
    }
  ])
  .directive('clickGameChatBox', [
    function() {
      return {
        restrict: 'E',
        controller: 'gameChatBoxCtrl',
        templateUrl: 'partials/directives/game_chat_box.html',
        scope: true,
        link: () => { }
      };
    }
  ]);
