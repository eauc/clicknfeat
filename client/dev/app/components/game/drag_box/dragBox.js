'use strict';

angular.module('clickApp.directives').directive('clickGameDragbox', [function () {
  return {
    restrict: 'A',
    link: function link(scope, element) {
      console.log('gameDragbox');

      var box = element[0];
      box.style.visibility = 'hidden';
      function updateDragbox(event, start, end) {
        var x = Math.min(start.x, end.x);
        var y = Math.min(start.y, end.y);
        var width = Math.abs(start.x - end.x);
        var height = Math.abs(start.y - end.y);

        box.style.visibility = 'visible';
        box.setAttribute('x', x + '');
        box.setAttribute('y', y + '');
        box.setAttribute('width', width + '');
        box.setAttribute('height', height + '');
      }
      scope.onStateChangeEvent('Game.dragBox.enable', updateDragbox, scope);
      scope.onStateChangeEvent('Game.dragBox.disable', function () {
        box.style.visibility = 'hidden';
      }, scope);
    }
  };
}]);
//# sourceMappingURL=dragBox.js.map
