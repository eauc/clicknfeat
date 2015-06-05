'use strict';

angular.module('clickApp.directives')
  .directive('clickGameRuler', [
    'gameMap',
    'labelElement',
    function(gameMapService,
             labelElementService) {
      return {
        restrict: 'A',
        link: function(scope, el, attrs) {
          var map = document.getElementById('map');
          var svgNS = map.namespaceURI;

          var local_element = createRulerElement(svgNS, el[0]);
          var remote_element = createRulerElement(svgNS, el[0]);
          
          scope.onGameEvent('changeLocalRuler', function onChangeLocalRuler(event, local) {
            updateRuler(map, local, local_element);
          }, scope);
          scope.onGameEvent('changeRemoteRuler', function onChangeRemoteRuler(event, remote) {
            updateRuler(map, remote, remote_element);
          }, scope);
          scope.onGameEvent('mapFlipped', function onMapFlipped(event) {
            updateRulerOnMapFlipped(map, scope.game.ruler.local, local_element);
            updateRulerOnMapFlipped(map, scope.game.ruler.remote, remote_element);
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
        return { container: group,
                 line: line,
                 label: label
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
    }
  ]);
