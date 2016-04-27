'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
      function updateDragbox(_event_, _ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var start = _ref2[0];
        var end = _ref2[1];

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
