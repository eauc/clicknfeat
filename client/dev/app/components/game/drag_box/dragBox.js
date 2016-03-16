'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameDragbox', gameDragboxDirectiveFactory);

  gameDragboxDirectiveFactory.$inject = [];
  function gameDragboxDirectiveFactory() {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      console.log('gameDragbox');

      var box = element[0];
      hideDragbox();

      scope.onStateChangeEvent('Game.dragBox.enable', updateDragbox, scope);
      scope.onStateChangeEvent('Game.dragBox.disable', hideDragbox, scope);

      function hideDragbox() {
        box.style.visibility = 'hidden';
      }
      function updateDragbox(_event_, start, end) {
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
    }
  }
})();
//# sourceMappingURL=dragBox.js.map
