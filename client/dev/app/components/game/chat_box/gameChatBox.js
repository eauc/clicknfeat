'use strict';

(function () {
  angular.module('clickApp.directives').controller('gameChatBoxCtrl', gameChatBoxCtrl).directive('clickGameChatBox', gameChatBoxDirectiveFactory);

  gameChatBoxCtrl.$inject = ['$scope', 'appGame'];
  function gameChatBoxCtrl($scope, appGameService) {
    var vm = this;
    console.log('gameChatBoxCtrl');

    vm.doSendChatMessage = doSendChatMessage;

    activate();

    function activate() {
      vm.msg = '';
      $scope.bindCell(updateChat, appGameService.chat.chat, $scope);
    }
    function updateChat(chat) {
      vm.chat = R.clone(chat).slice(-10).reverse();
    }
    function doSendChatMessage() {
      var msg = s.trim(vm.msg);
      if (R.isEmpty(msg)) return;

      $scope.sendAction('Game.connection.sendChat', msg);
      vm.msg = '';
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
