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
        link: (scope, el/*, attrs*/) => {
          var map = document.getElementById('map');
          var under_models_container = document.getElementById('game-under-models');
          var svgNS = map.namespaceURI;

          var local_element = createLosElement(svgNS, under_models_container, el[0]);
          var remote_element = createLosElement(svgNS, under_models_container, el[0]);
          
          scope.onGameEvent('changeLocalLos', () => {
            updateLine(scope.game.los.local, local_element.line);
          }, scope);
          scope.onGameEvent('changeRemoteLos', (event, los) => {
            if(R.isNil(los)) return;
            
            updateLine(scope.game.los.remote, remote_element.line);

            var display = ( gameLosService.isDisplayed(los) ||
                            'LoS' === modesService.currentModeName(scope.modes)
                          );
            updateEnvelope(scope.game.los, display, remote_element.envelope);
            updateOriginTarget(scope.factions, scope.game.models,
                               gameLosService.origin(los), display,
                               remote_element.origin);
            updateOriginTarget(scope.factions, scope.game.models,
                               gameLosService.target(los), display,
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
                 envelope: envelope,
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
            return self.Promise.resolve(null);
          },
          (model) => {
            if( !display ||
                R.isNil(model) ) {
              element.style.visibility = 'hidden';
              return;
            }
            R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                element.setAttribute('cx', model.state.x+'');
                element.setAttribute('cy', model.state.y+'');
                element.setAttribute('r', info.base_radius+'');
                element.style.visibility = 'visible';
              }
            )(factions);
          }
        )(stamp);
      }
    }
  ])
  .directive('clickGameLosClip', [
    function() {
      return {
        restrict: 'A',
        link: (scope, el/*, attrs*/) => {
          scope.onGameLoad
            .then(() => {
              updateEnvelope(scope.game.los, el[0]);
            });
          
          scope.onGameEvent('changeRemoteLos', (event, los) => {
            updateEnvelope(los, el[0]);
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
        link: (scope, el) => {
          // console.log('gameLosDarkness', scope, el);

          updatePolygon(scope, scope.game.los, el[0]);
          scope.onGameEvent('changeRemoteLos', (event, los) => {
            updatePolygon(scope, los, el[0]);
          }, scope);
        }
      };
      function updatePolygon(scope, los, polygon) {
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

        let display = ( gameLosService.isDisplayed(los) ||
                        'LoS' === modesService.currentModeName(scope.modes)
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

          scope.digestOnGameEvent('changeRemoteLos', scope);
        }
      };
    }
  ]);
