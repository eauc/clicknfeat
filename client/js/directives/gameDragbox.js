'use strict';

angular.module('clickApp.directives')
  .directive('clickGameDragbox', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          console.log('gameDragbox');
          var viewport = document.getElementById('viewport');
          var map = document.getElementById('map');

          var box = element[0];
          box.style.visibility = 'hidden';
          function updateDragbox(event, start, end) {
            var x = Math.min(start.x, end.x);
            var y = Math.min(start.y, end.y);
            var width = Math.abs(start.x - end.x);
            var height = Math.abs(start.y - end.y);
            self.requestAnimationFrame(function _updateDragbox() {
              box.style.visibility = 'visible';
              box.setAttribute('x', x+'');
              box.setAttribute('y', y+'');
              box.setAttribute('width', width+'');
              box.setAttribute('height', height+'');
            });
          }
          scope.onGameEvent('enableDragbox', updateDragbox, scope);
          scope.onGameEvent('disableDragbox', function disableDragbox() {
            self.requestAnimationFrame(function _disableDragbox() {
              box.style.visibility = 'hidden';
            });
          }, scope);
        }
      };
    }
  ]);
