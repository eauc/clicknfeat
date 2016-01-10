'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

angular.module('clickApp.directives').directive('clickGameMap', ['$window', 'gameMap', 'terrain', 'defaultMode', function ($window, gameMapService, terrainService, defaultModeService) {
  function _eventModifiers(e) {
    var modifiers = [];

    if (e.shiftKey) {
      modifiers.push('shift');
    }

    if (e.altKey) {
      modifiers.push('alt');
    }

    if (e.ctrlKey) {
      modifiers.push('ctrl');
    }

    if (e.metaKey) {
      modifiers.push('meta');
    }

    return modifiers.sort();
  }
  return {
    restrict: 'A',
    link: function link(scope, element) {
      var log = true ? R.bind(console.log, console) : function () {}; // eslint-disable-line

      var viewport = document.querySelector('#viewport');
      var map = element[0];
      var state = scope.state;

      var mouseEvents = function () {
        var drag = {
          active: false,
          start: null,
          target: null,
          now: null
        };
        function blurInputs() {
          var inputs = [].concat(_toConsumableArray(document.querySelectorAll('input')), _toConsumableArray(document.querySelectorAll('select')), _toConsumableArray(document.querySelectorAll('textarea')));
          R.forEach(function (e) {
            e.blur();
          }, inputs);
        }
        function mouseDownMap(event) {
          log('mouseDownMap', event, map.getBoundingClientRect());
          blurInputs();
          event.preventDefault();
          if (event.which !== 1) return;

          map.addEventListener('mousemove', dragMap);
          var start = gameMapService.eventToMapCoordinates(map, event);
          gameMapService.findEventTarget(state.game, event).then(function (target) {
            drag = {
              active: false,
              start: start,
              target: target,
              now: null
            };
          });
        }
        function dragMap(event) {
          log('dragMap', event);
          event.preventDefault();
          if (event.which !== 1) return;

          drag.now = gameMapService.eventToMapCoordinates(map, event);
          if (!drag.active && Math.abs(drag.now.x - drag.start.x) < defaultModeService.moves().DragEpsilon && Math.abs(drag.now.y - drag.start.y) < defaultModeService.moves().DragEpsilon) {
            return;
          }
          var emit = drag.active ? 'drag' : 'dragStart';
          drag.active = true;

          if ('Terrain' === drag.target.type && terrainService.isLocked(drag.target.target)) {
            drag.target = { type: 'Map',
              target: null
            };
          }
          scope.stateEvent('Modes.current.action', emit + drag.target.type, [{ target: drag.target.target,
            start: drag.start,
            now: drag.now
          }, event]);
        }
        function mouseLeaveMap(event) {
          log('mouseLeaveMap', event);
          event.preventDefault();

          map.removeEventListener('mousemove', dragMap);
          if (drag.active) {
            drag.active = false;
            scope.stateEvent('Modes.current.action', 'dragEnd' + drag.target.type, [{ target: drag.target.target,
              start: drag.start,
              now: drag.now
            }, event]);
          }
        }
        function clickMap(event) {
          log('clickMap', event);
          event.preventDefault();
          if (event.which !== 1) return;

          map.removeEventListener('mousemove', dragMap);

          var now = gameMapService.eventToMapCoordinates(map, event);
          if (drag.active) {
            drag.active = false;
            scope.stateEvent('Modes.current.action', 'dragEnd' + drag.target.type, [{ target: drag.target.target,
              start: drag.start,
              now: now
            }, event]);
          } else {
            gameMapService.findEventTarget(state.game, event).then(function (target) {
              var event_name = R.pipe(R.append('click' + target.type), R.join('+'))(_eventModifiers(event));
              event['click#'] = {
                target: target.target,
                x: now.x,
                y: now.y
              };
              state.changeEvent('Game.selectionDetail.close');
              state.changeEvent('Game.editLabel.close');
              state.changeEvent('Game.editDamage.close');
              Mousetrap.trigger(event_name, undefined, event);
            });
          }
        }
        function rightClickMap(event) {
          log('rightClickMap', event);
          event.preventDefault();

          var now = gameMapService.eventToMapCoordinates(map, event);
          gameMapService.findEventTarget(state.game, event).then(function (target) {
            var event_name = R.pipe(R.append('rightClick' + target.type), R.join('+'))(_eventModifiers(event));
            event['click#'] = {
              target: target.target,
              x: now.x,
              y: now.y
            };
            state.changeEvent('Game.selectionDetail.close');
            state.changeEvent('Game.editLabel.close');
            state.changeEvent('Game.editDamage.close');
            Mousetrap.trigger(event_name, undefined, event);
          });
        }
        function moveMap(event) {
          log('moveMap', event);
          event.preventDefault();

          var now = gameMapService.eventToMapCoordinates(map, event);
          scope.stateEvent('Modes.current.action', 'moveMap', [now, event]);
        }
        return {
          down: mouseDownMap,
          drag: dragMap,
          leave: mouseLeaveMap,
          click: clickMap,
          rightClick: rightClickMap,
          move: moveMap
        };
      }();

      var moveEvents = function () {
        var move_enabled = false;
        function onEnableMove() {
          if (move_enabled) return;
          map.addEventListener('mousemove', mouseEvents.move);
          move_enabled = true;
        }
        function onDisableMove() {
          if (!move_enabled) return;
          map.removeEventListener('mousemove', mouseEvents.move);
          move_enabled = false;
        }
        return {
          enable: onEnableMove,
          disable: onDisableMove
        };
      }();

      var flipMap = function () {
        var deploiement_labels = undefined;
        state.ui_state = R.assoc('flip_map', false, R.propOr({}, 'ui_state', state));
        map.classList.remove('flipped');
        return function onFlipMap() {
          deploiement_labels = document.querySelector('#deploiement-labels');
          state.ui_state.flip_map = !map.classList.contains('flipped');
          map.classList.toggle('flipped');
          if (state.ui_state.flip_map) {
            deploiement_labels.setAttribute('transform', 'rotate(180,240,240)');
          } else {
            deploiement_labels.setAttribute('transform', '');
          }
          state.changeEvent('Game.map.flipped');
        };
      }();

      var zoomEvents = function () {
        function zoomReset() {
          var rect = viewport.getBoundingClientRect();
          var hw = Math.min(rect.width, rect.height);
          setMapDimensions(hw - 15);
        }
        function zoomIn() {
          var _findViewportCenter = findViewportCenter();

          var _findViewportCenter2 = _slicedToArray(_findViewportCenter, 2);

          var _findViewportCenter2$ = _slicedToArray(_findViewportCenter2[0], 2);

          var cx = _findViewportCenter2$[0];
          var cy = _findViewportCenter2$[1];

          var _findViewportCenter2$2 = _slicedToArray(_findViewportCenter2[1], 2);

          var vw = _findViewportCenter2$2[0];
          var vh = _findViewportCenter2$2[1];

          var rect = map.getBoundingClientRect();
          cx = vw > rect.width ? rect.width / 2 : cx;
          cy = vh > rect.height ? rect.height / 2 : cy;

          setMapDimensions(rect.width * 2);
          setViewportCenter(cx * 2, cy * 2, vw, vh);
        }
        function zoomOut() {
          var _findViewportCenter3 = findViewportCenter();

          var _findViewportCenter4 = _slicedToArray(_findViewportCenter3, 2);

          var _findViewportCenter4$ = _slicedToArray(_findViewportCenter4[0], 2);

          var cx = _findViewportCenter4$[0];
          var cy = _findViewportCenter4$[1];

          var _findViewportCenter4$2 = _slicedToArray(_findViewportCenter4[1], 2);

          var vw = _findViewportCenter4$2[0];
          var vh = _findViewportCenter4$2[1];

          var hw = Math.min(vw, vh);

          var rect = map.getBoundingClientRect();

          setMapDimensions(Math.max(hw - 15, rect.width / 2));
          setViewportCenter(cx / 2, cy / 2, vw, vh);
        }
        return {
          in: zoomIn,
          out: zoomOut,
          reset: zoomReset
        };
      }();

      var scrollEvents = function () {
        var scroll_indent = 30;
        function scrollLeft() {
          var left = viewport.scrollLeft;
          $window.requestAnimationFrame(function () {
            viewport.scrollLeft = left - scroll_indent;
          });
        }
        function scrollRight() {
          var left = viewport.scrollLeft;
          $window.requestAnimationFrame(function () {
            viewport.scrollLeft = left + scroll_indent;
          });
        }
        function scrollUp() {
          var top = viewport.scrollTop;
          $window.requestAnimationFrame(function () {
            viewport.scrollTop = top - scroll_indent;
          });
        }
        function scrollDown() {
          var top = viewport.scrollTop;
          $window.requestAnimationFrame(function () {
            viewport.scrollTop = top + scroll_indent;
          });
        }
        return {
          left: scrollLeft,
          right: scrollRight,
          up: scrollUp,
          down: scrollDown
        };
      }();

      function setMapDimensions(dim) {
        map.style.width = dim + 'px';
        map.style.height = dim + 'px';
      }

      function findViewportCenter() {
        var rect = viewport.getBoundingClientRect();
        var vw = rect.width;
        var vh = rect.height;

        var cx = viewport.scrollLeft + vw / 2;
        var cy = viewport.scrollTop + vh / 2;

        return [[cx, cy], [vw, vh]];
      }

      function setViewportCenter(cx, cy, vw, vh) {
        viewport.scrollLeft = cx - vw / 2;
        viewport.scrollTop = cy - vh / 2;
      }

      map.addEventListener('mouseup', mouseEvents.click);
      map.addEventListener('mousedown', mouseEvents.down);
      map.addEventListener('mouseleave', mouseEvents.leave);
      map.addEventListener('dragstart', function (event) {
        event.preventDefault();
      });
      map.addEventListener('contextmenu', mouseEvents.rightClick);

      scope.onStateChangeEvent('Game.view.flipMap', flipMap, scope);
      scope.onStateChangeEvent('Game.moveMap.enable', moveEvents.enable, scope);
      scope.onStateChangeEvent('Game.moveMap.disable', moveEvents.disable, scope);
      scope.onStateChangeEvent('Game.view.zoomIn', zoomEvents.in, scope);
      scope.onStateChangeEvent('Game.view.zoomOut', zoomEvents.out, scope);
      scope.onStateChangeEvent('Game.view.zoomReset', zoomEvents.reset, scope);
      scope.onStateChangeEvent('Game.view.scrollLeft', scrollEvents.left, scope);
      scope.onStateChangeEvent('Game.view.scrollRight', scrollEvents.right, scope);
      scope.onStateChangeEvent('Game.view.scrollUp', scrollEvents.up, scope);
      scope.onStateChangeEvent('Game.view.scrollDown', scrollEvents.down, scope);

      $window.requestAnimationFrame(zoomEvents.reset);
    }
  };
}]);
//# sourceMappingURL=gameMap.js.map
