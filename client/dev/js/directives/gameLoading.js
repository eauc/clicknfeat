'use strict';

angular.module('clickApp.directives').directive('clickGameLoading', [function () {
  return {
    restrict: 'A',
    link: function link(scope, element /*, attrs*/) {
      console.log('gameLoading');
      scope.onGameEvent('gameLoading', function () {
        element[0].style.display = 'block';
      }, scope);
      scope.onGameEvent('gameLoaded', function () {
        element[0].style.display = 'none';
      }, scope);
    }
  };
}]);
//# sourceMappingURL=gameLoading.js.map
