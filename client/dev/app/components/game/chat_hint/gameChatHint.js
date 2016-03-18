'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickChatHint', chatHintDirectiveFactory);

  chatHintDirectiveFactory.$inject = ['$rootScope'];
  function chatHintDirectiveFactory($rootScope) {
    return {
      restrict: 'A',
      scope: { type: '@clickChatHint',
        state: '@hintState' },
      link: link
    };

    function link(scope, element) {
      var tab = element[0];
      $rootScope.onStateChangeEvent(s.capitalize(scope.type) + '.chat', onChat, scope);
      $rootScope.$on('$stateChangeSuccess', onStateChange);

      function onChat(_event_, chat) {
        if (R.isNil(chat) || R.isNil(chat.from) || chat.from === $rootScope.state.user.state.stamp || chat.from === $rootScope.state.user.state.name) return;

        var hint = !$rootScope.stateIs(scope.state);
        if (hint) {
          tab.classList.add('go-to-hint');
        } else {
          tab.classList.remove('go-to-hint');
        }
      }
      function onStateChange(_event_, toState) {
        if (toState.name === scope.state) {
          tab.classList.remove('go-to-hint');
        }
      }
    }
  }
})();
//# sourceMappingURL=gameChatHint.js.map
