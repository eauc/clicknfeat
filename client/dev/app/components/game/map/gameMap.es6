(function() {
  angular.module('clickApp.directives')
    .directive('clickGameMap', clickGameMapDirectiveFactory);

  clickGameMapDirectiveFactory.$inject = [
    'appAction',
    'appGame',
    // 'appState',
    'gameMap',
    'terrain',
    'commonMode',
  ];
  function clickGameMapDirectiveFactory(appActionService,
                                        appGameService,
                                        // appStateService,
                                        gameMapService,
                                        terrainModel,
                                        commonModeModel
  ) {
    const log = true // eslint-disable-line
            ? R.bind(console.log, console)
            : function() {};
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      const viewport = document.querySelector('#viewport');
      const map = element[0];

      const mouseEvents = buildMouseEvents();
      const moveEvents = buildMoveEvents();
      const flipMap = buildFlipMap();
      const zoomEvents = buildZoomEvents();
      const scrollEvents = buildScrollEvents();

      map.addEventListener('mouseup', mouseEvents.click);
      map.addEventListener('mousedown', mouseEvents.down);
      map.addEventListener('mouseleave', mouseEvents.leave);
      map.addEventListener('dragstart', (event) => {
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
        let drag = {
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
          log('mouseDownMap', event, map.getBoundingClientRect());
          blurInputs();
          event.preventDefault();
          if(event.which !== 1) return;

          const game = appGameService.game.sample();
          const start = gameMapService.eventToMapCoordinates(map, event);
          const target = gameMapService.findEventTarget(game, event);
          dragStart(start, target);
          map.addEventListener('mousemove', dragMap);
        }

        function mouseLeaveMap(event) {
          log('mouseLeaveMap', event);
          event.preventDefault();

          map.removeEventListener('mousemove', dragMap);
          if(drag.active) dragEnd(event);
        }

        function clickMap(event) {
          log('clickMap', event);
          event.preventDefault();
          if(event.which !== 1) return;

          map.removeEventListener('mousemove', dragMap);

          const game = appGameService.game.sample();
          const now = gameMapService.eventToMapCoordinates(map, event);
          if(drag.active) {
            drag.now = now;
            dragEnd(event);
          }
          else {
            const target = gameMapService
                    .findEventTarget(game, event);
            emitClickEvent('click', event, now, target);
          }
        }

        function rightClickMap(event) {
          log('rightClickMap', event);
          event.preventDefault();

          const game = appGameService.game.sample();
          const now = gameMapService.eventToMapCoordinates(map, event);
          const target = gameMapService.findEventTarget(game, event);
          emitClickEvent('rightClick', event, now, target);
        }

        function moveMap(event) {
          log('moveMap', event);
          event.preventDefault();

          const now = gameMapService.eventToMapCoordinates(map, event);
          appActionService.do('Modes.current.action',
                              'moveMap', [now, event]);
        }

        function blurInputs() {
          const inputs = [
              ...document.querySelectorAll('input'),
              ...document.querySelectorAll('select'),
              ...document.querySelectorAll('textarea'),
          ];
          R.forEach((e) => { e.blur(); }, inputs);
        }

        function emitClickEvent(type, event, now, target) {
          const event_name = R.thread(event)(
            _eventModifiers,
            R.append(type + target.type),
            R.join('+')
          );
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
          log('dragMap', event);
          event.preventDefault();
          if(event.which !== 1) return;

          drag.now = gameMapService.eventToMapCoordinates(map, event);
          if(!drag.active &&
             currentDragIsBellowThreshold()) {
            return;
          }
          const emit = drag.active ? 'drag' : 'dragStart';
          drag.active = true;

          if('Terrain' === drag.target.type &&
             terrainModel.isLocked(drag.target.target)) {
            drag.target = { type: 'Map',
                            target: null
                          };
          }
          appActionService.do('Modes.current.action',
                              emit+drag.target.type,
                              [ { target: drag.target.target,
                                  start: drag.start,
                                  now: drag.now
                                },
                                event
                              ]);

        }
        function dragEnd(event) {
          appActionService.do('Modes.current.action',
                              'dragEnd'+drag.target.type,
                              [ { target: drag.target.target,
                                  start: drag.start,
                                  now: drag.now
                                },
                                event
                              ]);
          drag = {
            active: false,
            start: null,
            target: null,
            now: null
          };
        }
        function currentDragIsBellowThreshold() {
          const epsilon = commonModeModel.settings().DragEpsilon;
          return ( Math.abs(drag.now.x - drag.start.x) < epsilon &&
                   Math.abs(drag.now.y - drag.start.y) < epsilon
                 );
        }
      }

      function buildMoveEvents() {
        let move_enabled = false;
        return {
          enable: onEnableMove
        };

        function onEnableMove(enable) {
          if(enable && !move_enabled) {
            map.addEventListener('mousemove', mouseEvents.move);
            move_enabled = true;
          }
          if(!enable && move_enabled) {
            map.removeEventListener('mousemove', mouseEvents.move);
            move_enabled = false;
          }
        }
      }

      function buildFlipMap() {
        let deploiement_labels;
        init();
        return onFlipMap;

        function init() {
          map.classList.remove('flipped');
        }

        function onFlipMap(flipped) {
          deploiement_labels = document.querySelector('#deploiement-labels');
          if(R.isNil(deploiement_labels)) return;
          if(flipped) {
            map.classList.add('flipped');
            deploiement_labels
              .setAttribute('transform','rotate(180,240,240)');
          }
          else {
            map.classList.remove('flipped');
            deploiement_labels
              .setAttribute('transform','');
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
          const rect = viewport.getBoundingClientRect();
          const hw = Math.min(rect.width, rect.height);
          setMapDimensions(hw-15);
        }
        function zoomIn() {
          const zoom_factor = commonModeModel.settings().ZoomFactor;
          let [[cx,cy],[vw,vh]] = findViewportCenter();

          const rect = map.getBoundingClientRect();
          cx = (vw > rect.width) ? rect.width / zoom_factor : cx;
          cy = (vh > rect.height) ? rect.height / zoom_factor : cy;

          setMapDimensions(rect.width * zoom_factor);
          setViewportCenter(cx * zoom_factor, cy * zoom_factor, vw, vh);
        }
        function zoomOut() {
          const zoom_factor = commonModeModel.settings().ZoomFactor;
          const [[cx,cy],[vw,vh]] = findViewportCenter();
          const hw = Math.min(vw, vh);

          const rect = map.getBoundingClientRect();

          setMapDimensions(Math.max(hw-15, rect.width / zoom_factor));
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
          const scroll_step = commonModeModel.settings().ScrollStep;
          const left = viewport.scrollLeft;
          self.window.requestAnimationFrame(() => {
            viewport.scrollLeft = left - scroll_step;
          });
        }
        function scrollRight() {
          const scroll_step = commonModeModel.settings().ScrollStep;
          const left = viewport.scrollLeft;
          self.window.requestAnimationFrame(() => {
            viewport.scrollLeft = left + scroll_step;
          });
        }
        function scrollUp() {
          const scroll_step = commonModeModel.settings().ScrollStep;
          const top = viewport.scrollTop;
          self.window.requestAnimationFrame(() => {
            viewport.scrollTop = top - scroll_step;
          });
        }
        function scrollDown() {
          const scroll_step = commonModeModel.settings().ScrollStep;
          const top = viewport.scrollTop;
          self.window.requestAnimationFrame(() => {
            viewport.scrollTop = top + scroll_step;
          });
        }
      }

      function setMapDimensions(dim) {
        map.style.width = dim+'px';
        map.style.height = dim+'px';
      }
      function findViewportCenter() {
        const rect = viewport.getBoundingClientRect();
        const vw = rect.width;
        const vh = rect.height;

        const cx = viewport.scrollLeft + vw/2;
        const cy = viewport.scrollTop + vh/2;

        return [[cx, cy], [vw, vh]];
      }
      function setViewportCenter(cx, cy, vw, vh) {
        viewport.scrollLeft = cx - vw/2;
        viewport.scrollTop = cy - vh/2;
      }
    }
  }
  function _eventModifiers(e) {
    const modifiers = [];

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
