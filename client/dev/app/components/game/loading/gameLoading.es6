(function() {
  angular.module('clickApp.directives')
    .directive('clickGameLoading', gameLoadingDirectiveFactory);

  gameLoadingDirectiveFactory.$inject = [];
  function gameLoadingDirectiveFactory() {
    return {
      restrict: 'A',
      link: link
    };
  }
  function link(scope, element) {
    console.log('gameLoading');
    scope.onStateChangeEvent('Game.loading', () => {
      element[0].style.display = 'block';
    }, scope);
    scope.onStateChangeEvent('Game.loaded', () => {
      element[0].style.display = 'none';
    }, scope);
  }
})();
