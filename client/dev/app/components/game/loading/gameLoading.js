'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameLoading', gameLoadingDirectiveFactory);

  gameLoadingDirectiveFactory.$inject = ['appGame'];
  function gameLoadingDirectiveFactory(appGameService) {
    return {
      restrict: 'A',
      link: link
    };
    function link(scope, element) {
      console.log('gameLoading');
      scope.listenSignal(function (is_loading) {
        // console.warn('Loading UI', is_loading);
        element[0].style.display = is_loading ? 'block' : 'none';
      }, appGameService.loading, scope);
    }
  }
})();
//# sourceMappingURL=gameLoading.js.map
