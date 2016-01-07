angular.module('clickApp.directives')
  .directive('clickGameLoading', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, element) {
          console.log('gameLoading');
          scope.onStateChangeEvent('Game.loading', () => {
            element[0].style.display = 'block';
          }, scope);
          scope.onStateChangeEvent('Game.loaded', () => {
            element[0].style.display = 'none';
          }, scope);
        }
      };
    }
  ]);
