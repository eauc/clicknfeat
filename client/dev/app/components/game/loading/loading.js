'use strict';

angular.module('clickApp.directives').directive('clickGameLoading', [function () {
  return {
    restrict: 'A',
    link: function link(scope, element) {
      console.log('gameLoading');
      scope.onStateChangeEvent('Game.loading', function () {
        element[0].style.display = 'block';
      }, scope);
      scope.onStateChangeEvent('Game.loaded', function () {
        element[0].style.display = 'none';
      }, scope);
    }
  };
}]);
//# sourceMappingURL=loading.js.map
