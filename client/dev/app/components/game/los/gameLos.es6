(function() {
  angular.module('clickApp.directives')
    .directive('clickGameLos', gameLosDirectiveFactory)
    .directive('clickGameLosClip', gameLosClipDirectiveFactory)
    .directive('clickGameLosDarkness', gameLosDarknessDirectiveFactory)
    .directive('clickGameLosRefresh', gameLosRefreshDirectiveFactory);

  gameLosDirectiveFactory.$inject = [
    'modes',
    'gameLos',
    'gameModels',
    'gameFactions',
  ];
  function gameLosDirectiveFactory(modesModel,
                                   gameLosModel,
                                   gameModelsModel,
                                   gameFactionsModel) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, element) {
      const container = element[0];
      const map = document.getElementById('map');
      const under_models_container = document.getElementById('game-under-models');
      const svgNS = map.namespaceURI;

      const state = scope.state;
      const local_element = createLosElement(svgNS, under_models_container, container);
      const remote_element = createLosElement(svgNS, under_models_container, container);

      scope.onStateChangeEvent('Game.los.local.change', updateLocalLos, scope);
      scope.onStateChangeEvent('Game.los.remote.change', updateRemoteLos, scope);

      function updateLocalLos() {
        updateLine(state.game.los.local, local_element.line);
      }
      function updateRemoteLos() {
        updateLine(state.game.los.remote, remote_element.line);

        const display = ( gameLosModel.isDisplayed(state.game.los) ||
                          'LoS' === modesModel.currentModeName(state.modes)
                        );
        updateEnvelope(state.game.los, display, remote_element.envelope);
        updateOriginTarget(state.factions, state.game.models,
                           gameLosModel.origin(state.game.los), display,
                           remote_element.origin);
        updateOriginTarget(state.factions, state.game.models,
                           gameLosModel.target(state.game.los), display,
                           remote_element.target);
      }
    }
    function createLosElement(svgNS, under_models_container, parent) {
      const group = document.createElementNS(svgNS, 'g');
      parent.appendChild(group);

      const line = document.createElementNS(svgNS, 'line');
      line.style['marker-start'] = 'url(#los-start)';
      line.style['marker-end'] = 'url(#los-end)';
      group.appendChild(line);

      const origin = document.createElementNS(svgNS, 'circle');
      origin.classList.add('los-origin');
      origin.setAttribute('cx', '0');
      origin.setAttribute('cy', '0');
      origin.setAttribute('r', '0');
      origin.style.visibility = 'hidden';
      parent.appendChild(origin);

      const target = document.createElementNS(svgNS, 'circle');
      target.classList.add('los-target');
      target.setAttribute('cx', '0');
      target.setAttribute('cy', '0');
      target.setAttribute('r', '0');
      target.style.visibility = 'hidden';
      parent.appendChild(target);

      const envelope = document.createElementNS(svgNS, 'polygon');
      envelope.classList.add('los-envelope');
      envelope.setAttribute('points', '0,0 0,0 0,0');
      envelope.style.visibility = 'hidden';
      under_models_container.insertBefore(envelope, under_models_container.firstChild);

      return { container: group,
               line: line,
               origin: origin,
               target: target,
               envelope: envelope
             };
    }
    function updateLine(los, line) {
      line.style['visibility'] = los.display ? 'visible' : 'hidden';
      line.setAttribute('x1', los.start.x+'');
      line.setAttribute('y1', los.start.y+'');
      line.setAttribute('x2', los.end.x+'');
      line.setAttribute('y2', los.end.y+'');
    }
    function updateEnvelope(los, display, envelope) {
      const {
        left:  { start: { x: x1 = 0, y: y1 = 0 } = {},
                 end:   { x: x2 = 0, y: y2 = 0 } = {}
               } = {},
        right: { start: { x: x4 = 0, y: y4 = 0 } = {},
                 end:   { x: x3 = 0, y: y3 = 0 } = {}
               } = {}
      } = R.pathOr({}, ['computed', 'envelope'], los);
      const points = [
        [ x1, y1 ].join(','),
        [ x2, y2 ].join(','),
        [ x3, y3 ].join(','),
        [ x4, y4 ].join(','),
      ].join(' ');
      // console.log('gameLos envelope points', points);
      envelope.setAttribute('points', points);
      envelope.style['visibility'] = display ? 'visible' : 'hidden';
    }
    function updateOriginTarget(factions, models, stamp, display, element) {
      element.style.visibility = 'hidden';
      R.threadP(stamp)(
        (stamp) => {
          if(R.exists(stamp)) {
            return gameModelsModel.findStampP(stamp, models);
          }
          return R.rejectP();
        },
        (model) => {
          if( !display ||
              R.isNil(model) ) {
            return null;
          }
          return R.threadP(factions)(
            gameFactionsModel.getModelInfoP$(model.state.info),
            (info) => {
              element.setAttribute('cx', model.state.x+'');
              element.setAttribute('cy', model.state.y+'');
              element.setAttribute('r', info.base_radius+'');
              element.style.visibility = 'visible';
            }
          );
        }
      ).catch(R.always(null));
    }
  }

  gameLosClipDirectiveFactory.$inject = [];
  function gameLosClipDirectiveFactory() {
    return {
      restrict: 'A',
      link: link
    };
    function link(scope, element) {
      const state = scope.state;

      // scope.onStateChangeEvent('Game.loaded', () => {
      //   updateEnvelope(state.game.los, element[0]);
      // }, scope);

      scope.onStateChangeEvent('Game.los.remote.change', () => {
        updateEnvelope(state.game.los, element[0]);
      }, scope);
    }
    function updateEnvelope(los, envelope) {
      const {
        left:  { start: { x: x1 = 0, y: y1 = 0 } = {},
                 end:   { x: x2 = 0, y: y2 = 0 } = {}
               } = {},
        right: { start: { x: x4 = 0, y: y4 = 0 } = {},
                 end:   { x: x3 = 0, y: y3 = 0 } = {}
               } = {}
      } = R.pathOr({}, ['computed', 'envelope'], los);
      const points = [
        [ x1, y1 ].join(','),
        [ x2, y2 ].join(','),
        [ x3, y3 ].join(','),
        [ x4, y4 ].join(','),
      ].join(' ');
      // console.log('gameLos clip points', points, los);
      envelope.setAttribute('points', points);
    }
  }
  gameLosDarknessDirectiveFactory.$inject = [
    'gameLos',
    'modes',
  ];
  function gameLosDarknessDirectiveFactory(gameLosModel,
                                           modesModel) {
    return {
      restrict: 'A',
      link: link
    };
    function link(scope, element) {
      const state = scope.state;
      updatePolygon(scope, state, element[0]);

      scope.onStateChangeEvent('Game.remote.los.change', () => {
        updatePolygon(scope, state, state.game.los, element[0]);
      }, scope);
    }
    function updatePolygon(scope, state, polygon) {
      const {
        left:  { start: { x: x1 = 0, y: y1 = 0 } = {},
                 end:   { x: x2 = 0, y: y2 = 0 } = {}
               } = {},
        right: { start: { x: x4 = 0, y: y4 = 0 } = {},
                 end:   { x: x3 = 0, y: y3 = 0 } = {}
               } = {}
      } = R.propOr({}, 'envelope', scope);
      const points = [
        [ x1, y1 ].join(','),
        [ x2, y2 ].join(','),
        [ x3, y3 ].join(','),
        [ x4, y4 ].join(','),
      ].join(' ');
      // console.log('gameLosDarkness envelope points', points);
      polygon.setAttribute('points', points);

      const display = ( gameLosModel.isDisplayed(state.game.los) ||
                        'LoS' === modesModel.currentModeName(state.modes)
                      );
      polygon.style['visibility'] = display ? 'visible' : 'hidden';
    }
  }

  gameLosRefreshDirectiveFactory.$inject = [];
  function gameLosRefreshDirectiveFactory() {
    return {
      restrict: 'A',
      scope: true,
      link: link
    };
    function link(scope) {
      // console.log('gameLosRefresh', scope);
      scope.digestOnStateChangeEvent('Game.los.remote.change', scope);
    }
  }
})();
