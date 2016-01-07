angular.module('clickApp.directives')
  .directive('clickGameMap', [
    '$window',
    'gameMap',
    'terrain',
    'defaultMode',
    function($window,
             gameMapService,
             terrainService,
             defaultModeService) {
      function _eventModifiers(e) {
        let modifiers = [];

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
        link: function(scope, element) {
          let log = true ? R.bind(console.log, console) : function() {}; // eslint-disable-line

          let viewport = document.querySelector('#viewport');
          let map = element[0];
          let state = scope.state;

          let mouseEvents = (function() {
            let drag = {
              active: false,
              start: null,
              target: null,
              now: null
            };
            function blurInputs() {
              let inputs = [
                ...document.querySelectorAll('input'),
                ...document.querySelectorAll('select'),
                ...document.querySelectorAll('textarea'),
              ];
              R.forEach((e) => { e.blur(); }, inputs);
            }
            function mouseDownMap(event) {
              log('mouseDownMap', event, map.getBoundingClientRect());
              blurInputs();
              event.preventDefault();
              if(event.which !== 1) return;

              map.addEventListener('mousemove', dragMap);
              let start = gameMapService.eventToMapCoordinates(map, event);
              gameMapService.findEventTarget(state.game, event)
                .then((target) => {
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
              if(event.which !== 1) return;

              drag.now = gameMapService.eventToMapCoordinates(map, event);
              if(!drag.active &&
                 Math.abs(drag.now.x - drag.start.x) < defaultModeService.moves().DragEpsilon &&
                 Math.abs(drag.now.y - drag.start.y) < defaultModeService.moves().DragEpsilon) {
                return;
              }
              let emit = drag.active ? 'drag' : 'dragStart';
              drag.active = true;

              if('Terrain' === drag.target.type &&
                 terrainService.isLocked(drag.target.target)) {
                drag.target = { type: 'Map',
                                target: null
                              };
              }
              scope.stateEvent('Modes.current.action',
                               emit+drag.target.type,
                               [ { target: drag.target.target,
                                   start: drag.start,
                                   now: drag.now
                                 },
                                 event
                               ]);
            }
            function mouseLeaveMap(event) {
              log('mouseLeaveMap', event);
              event.preventDefault();

              map.removeEventListener('mousemove', dragMap);
              if(drag.active) {
                drag.active = false;
                scope.stateEvent('Modes.current.action',
                                 'dragEnd'+drag.target.type,
                                 [ { target: drag.target.target,
                                     start: drag.start,
                                     now: drag.now
                                   },
                                   event
                                 ]);
              }
            }
            function clickMap(event) {
              log('clickMap', event);
              event.preventDefault();
              if(event.which !== 1) return;

              map.removeEventListener('mousemove', dragMap);

              let now = gameMapService.eventToMapCoordinates(map, event);
              if(drag.active) {
                drag.active = false;
                scope.stateEvent('Modes.current.action',
                                 'dragEnd'+drag.target.type,
                                 [ { target: drag.target.target,
                                     start: drag.start,
                                     now: now
                                   },
                                   event
                                 ]);
              }
              else {
                gameMapService.findEventTarget(state.game, event)
                  .then((target) => {
                    let event_name = R.pipe(
                      R.append('click'+target.type),
                      R.join('+')
                    )(_eventModifiers(event));
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

              let now = gameMapService.eventToMapCoordinates(map, event);
              gameMapService.findEventTarget(state.game, event)
                .then((target) => {
                  let event_name = R.pipe(
                    R.append('rightClick'+target.type),
                    R.join('+')
                  )(_eventModifiers(event));
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

              let now = gameMapService.eventToMapCoordinates(map, event);
              scope.stateEvent('Modes.current.action',
                               'moveMap', [now, event]);
            }
            return {
              down: mouseDownMap,
              drag: dragMap,
              leave: mouseLeaveMap,
              click: clickMap,
              rightClick: rightClickMap,
              move: moveMap
            };
          })();

          let moveEvents = (function() {
            let move_enabled = false;
            function onEnableMove() {
              if(move_enabled) return;
              map.addEventListener('mousemove', mouseEvents.move);
              move_enabled = true;
            }
            function onDisableMove() {
              if(!move_enabled) return;
              map.removeEventListener('mousemove', mouseEvents.move);
              move_enabled = false;
            }
            return {
              enable: onEnableMove,
              disable: onDisableMove
            };
          })();

          let flipMap = (function() {
            let deploiement_labels;
            state.ui_state = R.assoc('flip_map', false, R.propOr({}, 'ui_state', state));
            map.classList.remove('flipped');
            return function onFlipMap() {
              deploiement_labels = document.querySelector('#deploiement-labels');
              state.ui_state.flip_map = !map.classList.contains('flipped');
              map.classList.toggle('flipped');
              if(state.ui_state.flip_map) {
                deploiement_labels
                  .setAttribute('transform','rotate(180,240,240)');
              }
              else {
                deploiement_labels
                  .setAttribute('transform','');
              }
              state.changeEvent('Game.map.flipped');
            };
          })();

          let zoomEvents = (function() {
            function zoomReset() {
              let rect = viewport.getBoundingClientRect();
              let hw = Math.min(rect.width, rect.height);
              setMapDimensions(hw-15);
            }
            function zoomIn() {
              let [[cx,cy],[vw,vh]] = findViewportCenter();

              let rect = map.getBoundingClientRect();
              cx = (vw > rect.width) ? rect.width / 2 : cx;
              cy = (vh > rect.height) ? rect.height / 2 : cy;

              setMapDimensions(rect.width*2);
              setViewportCenter(cx*2, cy*2, vw, vh);
            }
            function zoomOut() {
              let [[cx,cy],[vw,vh]] = findViewportCenter();
              let hw = Math.min(vw, vh);

              let rect = map.getBoundingClientRect();

              setMapDimensions(Math.max(hw-15, rect.width/2));
              setViewportCenter(cx/2, cy/2, vw, vh);
            }
            return {
              in: zoomIn,
              out: zoomOut,
              reset: zoomReset
            };
          })();

          let scrollEvents = (function() {
            let scroll_indent = 30;
            function scrollLeft() {
              let left = viewport.scrollLeft;
              $window.requestAnimationFrame(() => {
                viewport.scrollLeft = left - scroll_indent;
              });
            }
            function scrollRight() {
              let left = viewport.scrollLeft;
              $window.requestAnimationFrame(() => {
                viewport.scrollLeft = left + scroll_indent;
              });
            }
            function scrollUp() {
              let top = viewport.scrollTop;
              $window.requestAnimationFrame(() => {
                viewport.scrollTop = top - scroll_indent;
              });
            }
            function scrollDown() {
              let top = viewport.scrollTop;
              $window.requestAnimationFrame(() => {
                viewport.scrollTop = top + scroll_indent;
              });
            }
            return {
              left: scrollLeft,
              right: scrollRight,
              up: scrollUp,
              down: scrollDown
            };
          })();

          function setMapDimensions(dim) {
            map.style.width = dim+'px';
            map.style.height = dim+'px';
          }

          function findViewportCenter() {
            let rect = viewport.getBoundingClientRect();
            let vw = rect.width;
            let vh = rect.height;

            let cx = viewport.scrollLeft + vw/2;
            let cy = viewport.scrollTop + vh/2;

            return [[cx, cy], [vw, vh]];
          }

          function setViewportCenter(cx, cy, vw, vh) {
            viewport.scrollLeft = cx - vw/2;
            viewport.scrollTop = cy - vh/2;
          }

          map.addEventListener('mouseup', mouseEvents.click);
          map.addEventListener('mousedown', mouseEvents.down);
          map.addEventListener('mouseleave', mouseEvents.leave);
          map.addEventListener('dragstart', (event) => {
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
    }
  ]);
