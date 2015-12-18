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
          gameService.sendChat$(R.path(['user', 'state', 'name'], $scope),
                                msg),
          function() {
            $scope.chat.msg = '';
            $scope.$digest();
          }
        )($scope.game);
      };
      $scope.digestOnGameEvent('chat', $scope);
    }
  ])
  .directive('clickGameChatBox', [
    function() {
      return {
        restrict: 'E',
        controller: 'gameChatBoxCtrl',
        templateUrl: 'partials/directives/game_chat_box.html',
        scope: true,
        link: function(/*scope, element, attrs*/) {
        }
      };
    }
  ]);
