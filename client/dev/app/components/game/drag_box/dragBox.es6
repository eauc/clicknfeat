(function() {
  angular.module('clickApp.directives')
    .directive('clickGameDragbox', gameDragboxDirectiveFactory);

  gameDragboxDirectiveFactory.$inject = [
    'appGame',
  ];
  function gameDragboxDirectiveFactory(appGameService) {
    return {
      restrict: 'A',
      scope: true,
      link: link
    };

    function link(scope) {
      console.log('gameDragbox');

      scope.render = { x: 0, y: 0,
                       width: 0, height: 0
                     };

      scope.listenSignal(updateDragbox, appGameService.view.drag_box, scope);

      function updateDragbox(drag_box) {
        if(R.isNil(drag_box.top_left)) {
          scope.render = { x: 0, y: 0,
                           width: 0, height: 0
                         };
          return;
        }

        const { top_left, bottom_right } = drag_box;
        const width = Math.abs(bottom_right.x - top_left.x);
        const height = Math.abs(bottom_right.y - top_left.y);

        scope.render.x = top_left.x;
        scope.render.y = top_left.y;
        scope.render.width = width;
        scope.render.height = height;
        console.warn('RENDER DRAG_BOX', arguments, scope.render);
      }
    }
  }
})();
