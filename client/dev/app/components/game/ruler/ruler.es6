angular.module('clickApp.directives')
  .directive('clickGameRuler', [
    'gameMap',
    'labelElement',
    'gameRuler',
    'gameModels',
    'gameFactions',
    'modes',
    function(gameMapService,
             labelElementService,
             gameRulerService,
             gameModelsService,
             gameFactionsService,
             modesService) {
      return {
        restrict: 'A',
        link: function(scope, parent) {
          let map = document.getElementById('map');
          let svgNS = map.namespaceURI;

          let state = scope.state;
          let local_element = createRulerElement(svgNS, parent[0]);
          let remote_element = createRulerElement(svgNS, parent[0]);

          scope.onStateChangeEvent('Game.ruler.local.change', () => {
            updateRuler(map, state.game.ruler.local, local_element);
          }, scope);
          scope.onStateChangeEvent('Game.ruler.remote.change', () => {
            updateRuler(map, state.game.ruler.remote, remote_element);

            let display = ( gameRulerService.isDisplayed(state.game.ruler) ||
                            'Ruler' === modesService.currentModeName(state.modes)
                          );
            updateOrigin(state.factions, state.game.models,
                         state.game.ruler, display,
                         remote_element.origin);
            updateTarget(state.factions, state.game.models,
                         state.game.ruler, display,
                         remote_element.target);
          }, scope);
          scope.onStateChangeEvent('Game.map.flipped', () => {
            updateRulerOnMapFlipped(map, state.game.ruler.local, local_element);
            updateRulerOnMapFlipped(map, state.game.ruler.remote, remote_element);
          }, scope);
        }
      };
      function createRulerElement(svgNS, parent) {
        let group = document.createElementNS(svgNS, 'g');
        parent.appendChild(group);

        let line = document.createElementNS(svgNS, 'line');
        line.style['marker-start'] = 'url(#ruler-start)';
        line.style['marker-end'] = 'url(#ruler-end)';
        group.appendChild(line);

        let label = labelElementService.create(svgNS, group);

        let origin = document.createElementNS(svgNS, 'circle');
        origin.classList.add('ruler-origin');
        origin.setAttribute('cx', '0');
        origin.setAttribute('cy', '0');
        origin.setAttribute('r', '0');
        origin.style.visibility = 'hidden';
        parent.appendChild(origin);

        let target = document.createElementNS(svgNS, 'circle');
        target.classList.add('ruler-target');
        target.setAttribute('cx', '0');
        target.setAttribute('cy', '0');
        target.setAttribute('r', '0');
        target.style.visibility = 'hidden';
        parent.appendChild(target);

        return { container: group,
                 line: line,
                 label: label,
                 origin: origin,
                 target: target
               };
      }
      function updateRuler(map, ruler, element) {
        let map_flipped = gameMapService.isFlipped(map);
        let zoom_factor = gameMapService.zoomFactor(map);
        let label_flip_center = {
          x: (ruler.end.x - ruler.start.x) / 2 + ruler.start.x,
          y: (ruler.end.y - ruler.start.y) / 2 + ruler.start.y
        };
        let label_text = ruler.display ? ruler.length : '';
        updateLine(ruler.display, ruler, element.line);
        labelElementService.update(map_flipped,
                                   zoom_factor,
                                   label_flip_center,
                                   label_flip_center,
                                   label_text,
                                   element.label);
      }
      function updateRulerOnMapFlipped(map, ruler, element) {
        let label_flip_center = {
          x: (ruler.end.x - ruler.start.x) / 2 + ruler.start.x,
          y: (ruler.end.y - ruler.start.y) / 2 + ruler.start.y
        };
        labelElementService.updateOnFlipMap(map, label_flip_center, element.label);
      }
      function updateLine(visible, ruler, line) {
        line.style['visibility'] = visible ? 'visible' : 'hidden';
        line.setAttribute('x1', ruler.start.x+'');
        line.setAttribute('y1', ruler.start.y+'');
        line.setAttribute('x2', ruler.end.x+'');
        line.setAttribute('y2', ruler.end.y+'');
      }
      function updateOrigin(factions, models, ruler, display, element) {
        let origin = gameRulerService.origin(ruler);
        R.pipeP(
          function(origin) {
            if(R.isNil(origin)) {
              return self.Promise.reject();
            }
            return gameModelsService.findStamp(origin, models);
          },
          function(origin_model) {
            if(!display ||
               R.isNil(origin_model)) {
              element.style.visibility = 'hidden';
              return self.Promise.reject();
            }
            return R.pipeP(
              gameFactionsService.getModelInfo$(origin_model.state.info),
              (info) => {
                element.setAttribute('cx', origin_model.state.x+'');
                element.setAttribute('cy', origin_model.state.y+'');
                element.setAttribute('r', info.base_radius+'');
                element.style.visibility = 'visible';
              }
            )(factions);
          }
        )(origin).catch(R.always(null));
      }
      function updateTarget(factions, models, ruler, display, element) {
        let target = gameRulerService.target(ruler);
        R.pipeP(
          function(target) {
            if(R.isNil(target)) {
              return self.Promise.reject();
            }
            return gameModelsService.findStamp(target, models);
          },
          function(target_model) {
            if(!display ||
               R.isNil(target_model)) {
              element.style.visibility = 'hidden';
              return self.Promise.reject();
            }

            if(gameRulerService.targetReached(ruler)) {
              element.classList.add('reached');
            }
            else {
              element.classList.remove('reached');
            }

            return R.pipeP(
              gameFactionsService.getModelInfo$(target_model.state.info),
              (info) => {
                element.setAttribute('cx', target_model.state.x+'');
                element.setAttribute('cy', target_model.state.y+'');
                element.setAttribute('r', info.base_radius+'');
                element.style.visibility = 'visible';
              }
            )(factions);
          }
        )(target).catch(R.always(null));
      }
    }
  ]);