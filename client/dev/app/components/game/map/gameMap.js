'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.directives').directive('clickGameMap', clickGameMapDirectiveFactory);

  clickGameMapDirectiveFactory.$inject = ['appAction', 'appGame', 'gameMap', 'terrain', 'commonMode'];
  function clickGameMapDirectiveFactory(appActionService, appGameService, gameMapService, terrainModel, commonModeModel) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      var viewport = document.querySelector('#viewport');
      var map = element[0];

      var mouseEvents = buildMouseEvents();
      var moveEvents = buildMoveEvents();
      var flipMap = buildFlipMap();
      var zoomEvents = buildZoomEvents();
      var scrollEvents = buildScrollEvents();

      map.addEventListener('mouseup', mouseEvents.click);
      map.addEventListener('mousedown', mouseEvents.down);
      map.addEventListener('mouseleave', mouseEvents.leave);
      map.addEventListener('dragstart', function (event) {
        event.preventDefault();
      });
      map.addEventListener('contextmenu', mouseEvents.rightClick);

      scope.listenSignal(scrollEvents.left, appGameService.view.scroll_left, scope);
      scope.listenSignal(scrollEvents.right, appGameService.view.scroll_right, scope);
      scope.listenSignal(scrollEvents.up, appGameService.view.scroll_up, scope);
      scope.listenSignal(scrollEvents.down, appGameService.view.scroll_down, scope);
      scope.listenSignal(zoomEvents.in, appGameService.view.zoom_in, scope);
      scope.listenSignal(zoomEvents.out, appGameService.view.zoom_out, scope);
      scope.listenSignal(zoomEvents.reset, appGameService.view.zoom_reset, scope);
      scope.listenSignal(flipMap, appGameService.view.flip_map, scope);
      scope.listenSignal(moveEvents.enable, appGameService.view.move_map, scope);

      self.window.requestAnimationFrame(zoomEvents.reset);

      function buildMouseEvents() {
        var drag = {
          active: false,
          start: null,
          target: null,
          now: null
        };
        return {
          down: mouseDownMap,
          leave: mouseLeaveMap,
          click: clickMap,
          rightClick: rightClickMap,
          move: moveMap
        };

        function mouseDownMap(event) {
          console.log('mouseDownMap', event, map.getBoundingClientRect());
          blurInputs();
          event.preventDefault();
          if (event.which !== 1) return;

          var game = appGameService.game.sample();
          var start = gameMapService.eventToMapCoordinates(map, event);
          var target = gameMapService.findEventTarget(game, event);
          dragStart(start, target);
          map.addEventListener('mousemove', dragMap);
        }

        function mouseLeaveMap(event) {
          console.log('mouseLeaveMap', event);
          event.preventDefault();

          map.removeEventListener('mousemove', dragMap);
          if (drag.active) dragEnd(event);
        }

        function clickMap(event) {
          console.log('clickMap', event);
          event.preventDefault();
          if (event.which !== 1) return;

          map.removeEventListener('mousemove', dragMap);

          var game = appGameService.game.sample();
          var now = gameMapService.eventToMapCoordinates(map, event);
          if (drag.active) {
            drag.now = now;
            dragEnd(event);
          } else {
            var target = gameMapService.findEventTarget(game, event);
            emitClickEvent('click', event, now, target);
          }
        }

        function rightClickMap(event) {
          console.log('rightClickMap', event);
          event.preventDefault();

          var game = appGameService.game.sample();
          var now = gameMapService.eventToMapCoordinates(map, event);
          var target = gameMapService.findEventTarget(game, event);
          emitClickEvent('rightClick', event, now, target);
        }

        function moveMap(event) {
          console.log('moveMap', event);
          event.preventDefault();

          var now = gameMapService.eventToMapCoordinates(map, event);
          appActionService.do('Modes.current.action', 'moveMap', [now, event]);
        }

        function blurInputs() {
          var inputs = [].concat(_toConsumableArray(document.querySelectorAll('input')), _toConsumableArray(document.querySelectorAll('select')), _toConsumableArray(document.querySelectorAll('textarea')));
          R.forEach(function (e) {
            e.blur();
          }, inputs);
        }

        function emitClickEvent(type, event, now, target) {
          var event_name = R.thread(event)(_eventModifiers, R.append(type + target.type), R.join('+'));
          event['click#'] = {
            target: target.target,
            x: now.x,
            y: now.y
          };
          Mousetrap.trigger(event_name, undefined, event);
        }

        function dragStart(start, target) {
          drag = {
            active: false,
            start: start,
            target: target,
            now: null
          };
        }
        function dragMap(event) {
          console.log('dragMap', event);
          event.preventDefault();
          if (event.which !== 1) return;

          drag.now = gameMapService.eventToMapCoordinates(map, event);
          if (!drag.active && currentDragIsBellowThreshold()) {
            return;
          }
          var emit = drag.active ? 'drag' : 'dragStart';
          drag.active = true;

          if ('Terrain' === drag.target.type && terrainModel.isLocked(drag.target.target)) {
            drag.target = { type: 'Map',
              target: null
            };
          }
          appActionService.do('Modes.current.action', emit + drag.target.type, [{ target: drag.target.target,
            start: drag.start,
            now: drag.now
          }, event]);
        }
        function dragEnd(event) {
          appActionService.do('Modes.current.action', 'dragEnd' + drag.target.type, [{ target: drag.target.target,
            start: drag.start,
            now: drag.now
          }, event]);
          drag = {
            active: false,
            start: null,
            target: null,
            now: null
          };
        }
        function currentDragIsBellowThreshold() {
          var epsilon = commonModeModel.settings().DragEpsilon;
          return Math.abs(drag.now.x - drag.start.x) < epsilon && Math.abs(drag.now.y - drag.start.y) < epsilon;
        }
      }

      function buildMoveEvents() {
        var move_enabled = false;
        return {
          enable: onEnableMove
        };

        function onEnableMove(enable) {
          if (enable && !move_enabled) {
            map.addEventListener('mousemove', mouseEvents.move);
            move_enabled = true;
          }
          if (!enable && move_enabled) {
            map.removeEventListener('mousemove', mouseEvents.move);
            move_enabled = false;
          }
        }
      }

      function buildFlipMap() {
        var deploiement_labels = undefined;
        init();
        return onFlipMap;

        function init() {
          map.classList.remove('flipped');
        }

        function onFlipMap(flipped) {
          deploiement_labels = document.querySelector('#deploiement-labels');
          if (R.isNil(deploiement_labels)) return;
          if (flipped) {
            map.classList.add('flipped');
            deploiement_labels.setAttribute('transform', 'rotate(180,240,240)');
          } else {
            map.classList.remove('flipped');
            deploiement_labels.setAttribute('transform', '');
          }
        }
      }

      function buildZoomEvents() {
        return {
          'in': zoomIn,
          out: zoomOut,
          reset: zoomReset
        };

        function zoomReset() {
          var rect = viewport.getBoundingClientRect();
          var hw = Math.min(rect.width, rect.height);
          setMapDimensions(hw - 15);
        }
        function zoomIn() {
          var zoom_factor = commonModeModel.settings().ZoomFactor;

          var _findViewportCenter = findViewportCenter();

          var _findViewportCenter2 = _slicedToArray(_findViewportCenter, 2);

          var _findViewportCenter2$ = _slicedToArray(_findViewportCenter2[0], 2);

          var cx = _findViewportCenter2$[0];
          var cy = _findViewportCenter2$[1];

          var _findViewportCenter2$2 = _slicedToArray(_findViewportCenter2[1], 2);

          var vw = _findViewportCenter2$2[0];
          var vh = _findViewportCenter2$2[1];

          var rect = map.getBoundingClientRect();
          cx = vw > rect.width ? rect.width / zoom_factor : cx;
          cy = vh > rect.height ? rect.height / zoom_factor : cy;

          setMapDimensions(rect.width * zoom_factor);
          setViewportCenter(cx * zoom_factor, cy * zoom_factor, vw, vh);
        }
        function zoomOut() {
          var zoom_factor = commonModeModel.settings().ZoomFactor;

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

          setMapDimensions(Math.max(hw - 15, rect.width / zoom_factor));
          setViewportCenter(cx / zoom_factor, cy / zoom_factor, vw, vh);
        }
      }

      function buildScrollEvents() {
        return {
          left: scrollLeft,
          right: scrollRight,
          up: scrollUp,
          down: scrollDown
        };

        function scrollLeft() {
          var scroll_step = commonModeModel.settings().ScrollStep;
          var left = viewport.scrollLeft;
          self.window.requestAnimationFrame(function () {
            viewport.scrollLeft = left - scroll_step;
          });
        }
        function scrollRight() {
          var scroll_step = commonModeModel.settings().ScrollStep;
          var left = viewport.scrollLeft;
          self.window.requestAnimationFrame(function () {
            viewport.scrollLeft = left + scroll_step;
          });
        }
        function scrollUp() {
          var scroll_step = commonModeModel.settings().ScrollStep;
          var top = viewport.scrollTop;
          self.window.requestAnimationFrame(function () {
            viewport.scrollTop = top - scroll_step;
          });
        }
        function scrollDown() {
          var scroll_step = commonModeModel.settings().ScrollStep;
          var top = viewport.scrollTop;
          self.window.requestAnimationFrame(function () {
            viewport.scrollTop = top + scroll_step;
          });
        }
      }

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
    }
  }
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
})();
//# sourceMappingURL=gameMap.js.map
