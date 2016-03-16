(function() {
  angular.module('clickApp.directives')
    .directive('clickGameRuler', gameRulerDirectiveFactory);

  gameRulerDirectiveFactory.$inject = [
    'gameMap',
    'labelElement',
    'gameRuler',
    'gameModels',
    'gameFactions',
    'modes',
  ];
  function gameRulerDirectiveFactory(gameMapModel,
                                     labelElementModel,
                                     gameRulerModel,
                                     gameModelsModel,
                                     gameFactionsModel,
                                     modesModel) {
    return {
      restrict: 'A',
      link: link
    };
    function link(scope, parent) {
      const map = document.getElementById('map');
      const svgNS = map.namespaceURI;

      const state = scope.state;
      const local_element = createRulerElement(svgNS, parent[0]);
      const remote_element = createRulerElement(svgNS, parent[0]);

      scope.onStateChangeEvent('Game.ruler.local.change', updateLocalRuler, scope);
      scope.onStateChangeEvent('Game.ruler.remote.change', updateRemoteRuler, scope);
      scope.onStateChangeEvent('Game.map.flipped', updateOnMapFlipped, scope);

      function updateLocalRuler() {
        updateRuler(map, state.game.ruler.local, local_element);
      }
      function updateRemoteRuler() {
        updateRuler(map, state.game.ruler.remote, remote_element);

        const display = ( gameRulerModel.isDisplayed(state.game.ruler) ||
                          'Ruler' === modesModel.currentModeName(state.modes)
                        );
        updateOrigin(state.factions, state.game.models,
                     state.game.ruler, display,
                     remote_element.origin);
        updateTarget(state.factions, state.game.models,
                     state.game.ruler, display,
                     remote_element.target);
      }
      function updateOnMapFlipped() {
        updateRulerOnMapFlipped(map, state.game.ruler.local, local_element);
        updateRulerOnMapFlipped(map, state.game.ruler.remote, remote_element);
      }
    }
    function createRulerElement(svgNS, parent) {
      const group = document.createElementNS(svgNS, 'g');
      parent.appendChild(group);

      const line = document.createElementNS(svgNS, 'line');
      line.style['marker-start'] = 'url(#ruler-start)';
      line.style['marker-end'] = 'url(#ruler-end)';
      group.appendChild(line);

      const label = labelElementModel.create(svgNS, group);

      const origin = document.createElementNS(svgNS, 'circle');
      origin.classList.add('ruler-origin');
      origin.setAttribute('cx', '0');
      origin.setAttribute('cy', '0');
      origin.setAttribute('r', '0');
      origin.style.visibility = 'hidden';
      parent.appendChild(origin);

      const target = document.createElementNS(svgNS, 'circle');
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
      const map_flipped = gameMapModel.isFlipped(map);
      const zoom_factor = gameMapModel.zoomFactor(map);
      const label_flip_center = {
        x: (ruler.end.x - ruler.start.x) / 2 + ruler.start.x,
        y: (ruler.end.y - ruler.start.y) / 2 + ruler.start.y
      };
      const label_text = ruler.display ? ruler.length : '';
      updateLine(ruler.display, ruler, element.line);
      labelElementModel.update(map_flipped,
                               zoom_factor,
                               label_flip_center,
                               label_flip_center,
                               label_text,
                               element.label);
    }
    function updateRulerOnMapFlipped(map, ruler, element) {
      const label_flip_center = {
        x: (ruler.end.x - ruler.start.x) / 2 + ruler.start.x,
        y: (ruler.end.y - ruler.start.y) / 2 + ruler.start.y
      };
      labelElementModel.updateOnFlipMap(map, label_flip_center, element.label);
    }
    function updateLine(visible, ruler, line) {
      line.style['visibility'] = visible ? 'visible' : 'hidden';
      line.setAttribute('x1', ruler.start.x+'');
      line.setAttribute('y1', ruler.start.y+'');
      line.setAttribute('x2', ruler.end.x+'');
      line.setAttribute('y2', ruler.end.y+'');
    }
    function updateOrigin(factions, models, ruler, display, element) {
      const origin = gameRulerModel.origin(ruler);
      element.style.visibility = 'hidden';
      R.threadP(origin)(
        findOriginModelP,
        R.rejectIf(checkOriginDisplay, 'no display'),
        (origin_model) => R.threadP(factions)(
          gameFactionsModel.getModelInfoP$(origin_model.state.info),
          (info) => {
            element.setAttribute('cx', origin_model.state.x+'');
            element.setAttribute('cy', origin_model.state.y+'');
            element.setAttribute('r', info.base_radius+'');
            element.style.visibility = 'visible';
          }
        )
      ).catch(R.always(null));

      function findOriginModelP(origin) {
        return R.threadP(origin)(
          R.rejectIf(R.isNil, 'no origin'),
          (origin) => gameModelsModel
            .findStampP(origin, models)
        );
      }
      function checkOriginDisplay(origin_model) {
        return ( !display ||
                 R.isNil(origin_model)
               );
      }
    }
    function updateTarget(factions, models, ruler, display, element) {
      const target = gameRulerModel.target(ruler);
      element.style.visibility = 'hidden';
      R.threadP(target)(
        findTargetModelP,
        R.rejectIf(checkTargetDisplay, 'no display'),
        (target_model) => R.threadP(factions)(
          gameFactionsModel.getModelInfoP$(target_model.state.info),
          (info) => {
            element.setAttribute('cx', target_model.state.x+'');
            element.setAttribute('cy', target_model.state.y+'');
            element.setAttribute('r', info.base_radius+'');
            element.style.visibility = 'visible';
          }
        ),
        checkTargetReached
      ).catch(R.always(null));

      function findTargetModelP(target) {
        return R.threadP(target)(
          R.rejectIf(R.isNil, 'no target'),
          (target) => gameModelsModel
            .findStampP(target, models)
        );
      }
      function checkTargetDisplay(target_model) {
        return ( !display ||
                 R.isNil(target_model)
               );
      }
      function checkTargetReached() {
        if(gameRulerModel.targetReached(ruler)) {
          element.classList.add('reached');
        }
        else {
          element.classList.remove('reached');
        }
      }
    }
  }
})();
