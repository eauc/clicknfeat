'use strict';

(function () {
  angular.module('clickApp.directives').controller('gameChatBoxCtrl', gameChatBoxCtrl).directive('clickGameChatBox', gameChatBoxDirectiveFactory);

  gameChatBoxCtrl.$inject = ['$scope', 'game'];
  function gameChatBoxCtrl($scope, gameModel) {
    var vm = this;
    console.log('gameChatBoxCtrl');

    vm.doSendChatMessage = doSendChatMessage;

    activate();

    function activate() {
      vm.msg = '';
      $scope.onStateChangeEvent('Game.chat', updateChat, $scope);
      $scope.onStateChangeEvent('Game.loaded', updateChat, $scope);
      self.window.requestAnimationFrame(updateChat);
    }
    function updateChat() {
      vm.chat = R.clone(R.path(['game', 'chat'], $scope.state));
      $scope.$digest();
    }
    function doSendChatMessage() {
      var msg = s.trim(vm.msg);
      if (R.isEmpty(msg)) return;

      R.threadP($scope.state.game)(gameModel.sendChatP$(R.path(['user', 'state', 'name'], $scope.state), msg), function () {
        vm.msg = '';
        $scope.$digest();
      });
    }
  }

  gameChatBoxDirectiveFactory.$inject = [];
  function gameChatBoxDirectiveFactory() {
    return {
      restrict: 'E',
      templateUrl: 'app/components/game/chat_box/game_chat_box.html',
      scope: true,
      controller: 'gameChatBoxCtrl',
      controllerAs: 'game_chat',
      link: function link() {}
    };
  }
})();
//# sourceMappingURL=gameChatBox.js.map
