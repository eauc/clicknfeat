'use strict';

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
        link: function(scope, el, attrs) {
          var map = document.getElementById('map');
          var svgNS = map.namespaceURI;

          var local_element = createRulerElement(svgNS, el[0]);
          var remote_element = createRulerElement(svgNS, el[0]);
          
          scope.onGameEvent('changeLocalRuler', function onChangeLocalRuler() {
            self.requestAnimationFrame(function _onChangeLocalRuler() {
              updateRuler(map, scope.game.ruler.local, local_element);
            });
          }, scope);
          scope.onGameEvent('changeRemoteRuler', function onChangeRemoteRuler() {
            self.requestAnimationFrame(function _onChangeRemoteRuler() {
              updateRuler(map, scope.game.ruler.remote, remote_element);

              var display = ( gameRulerService.isDisplayed(scope.game.ruler) ||
                              'Ruler' === modesService.currentModeName(scope.modes)
                            );
              updateOrigin(scope.factions, scope.game.models,
                           scope.game.ruler, display,
                           remote_element.origin);
              updateTarget(scope.factions, scope.game.models,
                           scope.game.ruler, display,
                           remote_element.target);
            });
          }, scope);
          scope.onGameEvent('mapFlipped', function onMapFlippedRuler(event) {
            self.requestAnimationFrame(function _onMapFlippedRuler() {
              updateRulerOnMapFlipped(map, scope.game.ruler.local, local_element);
              updateRulerOnMapFlipped(map, scope.game.ruler.remote, remote_element);
            });
          }, scope);
        }
      };
      function createRulerElement(svgNS, parent) {
        var group = document.createElementNS(svgNS, 'g');
        parent.appendChild(group);

        var line = document.createElementNS(svgNS, 'line');
        line.style['marker-start'] = 'url(#ruler-start)';
        line.style['marker-end'] = 'url(#ruler-end)';
        group.appendChild(line);

        var label = labelElementService.create(svgNS, group);

        var origin = document.createElementNS(svgNS, 'circle');
        origin.classList.add('ruler-origin');
        origin.setAttribute('cx', '0');
        origin.setAttribute('cy', '0');
        origin.setAttribute('r', '0');
        origin.style.visibility = 'hidden';
        parent.appendChild(origin);

        var target = document.createElementNS(svgNS, 'circle');
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
                 target: target,
               };
      }
      function updateRuler(map, ruler, element) {
        var map_flipped = gameMapService.isFlipped(map);
        var zoom_factor = gameMapService.zoomFactor(map);
        var label_flip_center = {
          x: (ruler.end.x - ruler.start.x) / 2 + ruler.start.x,
          y: (ruler.end.y - ruler.start.y) / 2 + ruler.start.y,
        };
        var label_text = ruler.display ? ruler.length : '';
        self.requestAnimationFrame(function _updateRuler() {
          updateLine(ruler.display, ruler, element.line);
          labelElementService.update(map_flipped,
                                     zoom_factor,
                                     label_flip_center,
                                     label_flip_center,
                                     label_text,
                                     element.label);
        });
      }
      function updateRulerOnMapFlipped(map, ruler, element) {
        var label_flip_center = {
          x: (ruler.end.x - ruler.start.x) / 2 + ruler.start.x,
          y: (ruler.end.y - ruler.start.y) / 2 + ruler.start.y,
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
        var origin = gameRulerService.origin(ruler);
        var origin_model;
        if(R.exists(origin)) {
          origin_model = gameModelsService.findStamp(origin, models);
        }
        if(!display ||
           R.isNil(origin_model)) {
          element.style.visibility = 'hidden';
          return;
        }
        var info = gameFactionsService.getModelInfo(origin_model.state.info, factions);
        element.setAttribute('cx', origin_model.state.x+'');
        element.setAttribute('cy', origin_model.state.y+'');
        element.setAttribute('r', info.base_radius+'');
        element.style.visibility = 'visible';
      }
      function updateTarget(factions, models, ruler, display, element) {
        var target = gameRulerService.target(ruler);
        var target_model;
        if(R.exists(target)) {
          target_model = gameModelsService.findStamp(target, models);
        }
        if(!display ||
           R.isNil(target_model)) {
          element.style.visibility = 'hidden';
          return;
        }
        if(gameRulerService.targetReached(ruler)) {
          element.classList.add('reached');
        }
        else {
          element.classList.remove('reached');
        }
        var info = gameFactionsService.getModelInfo(target_model.state.info, factions);
        element.setAttribute('cx', target_model.state.x+'');
        element.setAttribute('cy', target_model.state.y+'');
        element.setAttribute('r', info.base_radius+'');
        element.style.visibility = 'visible';
      }
    }
  ]);
