angular.module('clickApp.directives')
  .directive('clickGameLos', [
    'modes',
    'gameLos',
    'gameModels',
    'gameFactions',
    function(modesService,
             gameLosService,
             gameModelsService,
             gameFactionsService) {
      return {
        restrict: 'A',
        link: (scope, parent) => {
          let map = document.getElementById('map');
          let under_models_container = document.getElementById('game-under-models');
          let svgNS = map.namespaceURI;

          let state = scope.state;
          let local_element = createLosElement(svgNS, under_models_container, parent[0]);
          let remote_element = createLosElement(svgNS, under_models_container, parent[0]);

          scope.onStateChangeEvent('Game.los.local.change', () => {
            updateLine(state.game.los.local, local_element.line);
          }, scope);
          scope.onStateChangeEvent('Game.los.remote.change', () => {
            updateLine(state.game.los.remote, remote_element.line);

            let display = ( gameLosService.isDisplayed(state.game.los) ||
                            'LoS' === modesService.currentModeName(state.modes)
                          );
            updateEnvelope(state.game.los, display, remote_element.envelope);
            updateOriginTarget(state.factions, state.game.models,
                               gameLosService.origin(state.game.los), display,
                               remote_element.origin);
            updateOriginTarget(state.factions, state.game.models,
                               gameLosService.target(state.game.los), display,
                               remote_element.target);
          }, scope);
        }
      };
      function createLosElement(svgNS, under_models_container, parent) {
        let group = document.createElementNS(svgNS, 'g');
        parent.appendChild(group);

        let line = document.createElementNS(svgNS, 'line');
        line.style['marker-start'] = 'url(#los-start)';
        line.style['marker-end'] = 'url(#los-end)';
        group.appendChild(line);

        let origin = document.createElementNS(svgNS, 'circle');
        origin.classList.add('los-origin');
        origin.setAttribute('cx', '0');
        origin.setAttribute('cy', '0');
        origin.setAttribute('r', '0');
        origin.style.visibility = 'hidden';
        parent.appendChild(origin);

        let target = document.createElementNS(svgNS, 'circle');
        target.classList.add('los-target');
        target.setAttribute('cx', '0');
        target.setAttribute('cy', '0');
        target.setAttribute('r', '0');
        target.style.visibility = 'hidden';
        parent.appendChild(target);

        let envelope = document.createElementNS(svgNS, 'polygon');
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
        let {
          left:  { start: { x: x1 = 0, y: y1 = 0 } = {},
                   end:   { x: x2 = 0, y: y2 = 0 } = {}
                 } = {},
          right: { start: { x: x4 = 0, y: y4 = 0 } = {},
                   end:   { x: x3 = 0, y: y3 = 0 } = {}
                 } = {}
        } = R.pathOr({}, ['computed', 'envelope'], los);
        let points = [
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
        R.pipeP(
          (stamp) => {
            if(R.exists(stamp)) {
              return gameModelsService.findStamp(stamp, models);
            }
            return self.Promise.reject();
          },
          (model) => {
            if( !display ||
                R.isNil(model) ) {
              element.style.visibility = 'hidden';
              return self.Promise.reject();
            }
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                element.setAttribute('cx', model.state.x+'');
                element.setAttribute('cy', model.state.y+'');
                element.setAttribute('r', info.base_radius+'');
                element.style.visibility = 'visible';
              }
            )(factions);
          }
        )(stamp).catch(R.always(null));
      }
    }
  ])
  .directive('clickGameLosClip', [
    function() {
      return {
        restrict: 'A',
        link: (scope, element) => {
          let state = scope.state;

          scope.onStateChangeEvent('Game.loaded', () => {
            updateEnvelope(state.game.los, element[0]);
          }, scope);

          scope.onStateChangeEvent('Game.los.remote.change', () => {
            updateEnvelope(state.game.los, element[0]);
          }, scope);
        }
      };
      function updateEnvelope(los, envelope) {
        let {
          left:  { start: { x: x1 = 0, y: y1 = 0 } = {},
                   end:   { x: x2 = 0, y: y2 = 0 } = {}
                 } = {},
          right: { start: { x: x4 = 0, y: y4 = 0 } = {},
                   end:   { x: x3 = 0, y: y3 = 0 } = {}
                 } = {}
        } = R.pathOr({}, ['computed', 'envelope'], los);
        let points = [
          [ x1, y1 ].join(','),
          [ x2, y2 ].join(','),
          [ x3, y3 ].join(','),
          [ x4, y4 ].join(','),
        ].join(' ');
        // console.log('gameLos clip points', points, los);
        envelope.setAttribute('points', points);
      }
    }
  ])
  .directive('clickGameLosDarkness', [
    'gameLos',
    'modes',
    function(gameLosService,
             modesService) {
      return {
        restrict: 'A',
        link: (scope, element) => {
          let state = scope.state;
          updatePolygon(scope, state, element[0]);

          scope.onStateChangeEvent('Game.remote.los.change', () => {
            updatePolygon(scope, state, state.game.los, element[0]);
          }, scope);
        }
      };
      function updatePolygon(scope, state, polygon) {
        let {
          left:  { start: { x: x1 = 0, y: y1 = 0 } = {},
                   end:   { x: x2 = 0, y: y2 = 0 } = {}
                 } = {},
          right: { start: { x: x4 = 0, y: y4 = 0 } = {},
                   end:   { x: x3 = 0, y: y3 = 0 } = {}
                 } = {}
        } = R.propOr({}, 'envelope', scope);
        let points = [
          [ x1, y1 ].join(','),
          [ x2, y2 ].join(','),
          [ x3, y3 ].join(','),
          [ x4, y4 ].join(','),
        ].join(' ');
        // console.log('gameLosDarkness envelope points', points);
        polygon.setAttribute('points', points);

        let display = ( gameLosService.isDisplayed(state.game.los) ||
                        'LoS' === modesService.currentModeName(state.modes)
                      );
        polygon.style['visibility'] = display ? 'visible' : 'hidden';
      }
    }
  ])
  .directive('clickGameLosRefresh', [
    function() {
      return {
        restrict: 'A',
        scope: true,
        link: (scope) => {
          // console.log('gameLosRefresh', scope);

          scope.digestOnStateChangeEvent('Game.los.remote.change', scope);
        }
      };
    }
  ]);
