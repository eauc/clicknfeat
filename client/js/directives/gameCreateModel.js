'use strict';

angular.module('clickApp.directives')
  .directive('clickGameCreateModel', [
    '$window',
    'gameFactions',
    'gameMap',
    function($window,
             gameFactionsService,
             gameMapService) {
      return {
        restrict: 'A',
        link: function(scope, el, attrs) {
          var map = document.getElementById('map');
          var svgNS = map.namespaceURI;

          console.log('clickCreateModel', scope.index);
          var model = R.nth(scope.index, scope.create.model.models);

          R.pipeP(
            gameFactionsService.getModelInfo$(model.info),
            function(info) {
              var element = createModelElement(info, document, svgNS, el[0]);
              var is_flipped = gameMapService.isFlipped(map);
              setModelPosition(scope.create.model.base, is_flipped, model, element);
          
              scope.onGameEvent('moveCreateModel', function onMoveCreateModel() {
                is_flipped = gameMapService.isFlipped(map);
                setModelPosition(scope.create.model.base, is_flipped, model, element);
              }, scope);
            }
          )(scope.factions);
        }
      };
      function createModelElement(info, document, svgNS, parent) {
        var element = document.createElementNS(svgNS, 'circle');
        element.classList.add('create-model');
        element.setAttribute('cx', '240');
        element.setAttribute('cy', '240');
        element.setAttribute('r', info.base_radius);
        parent.appendChild(element);
        return element;
      }
      function setModelPosition(base, is_flipped, model, element) {
        var coeff = is_flipped ? -1 : 1;
        element.setAttribute('cx', (base.x + coeff * model.x)+'');
        element.setAttribute('cy', (base.y + coeff * model.y)+'');
      }
    }
  ]);
