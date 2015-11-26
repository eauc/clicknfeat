'use strict';

angular.module('clickApp.directives')
  .directive('clickGameCreateModel', [
    '$window',
    'gameFactions',
    function($window,
             gameFactionsService) {
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
              setModelPosition(scope.create.model.base, model, element);
          
              scope.onGameEvent('moveCreateModel', function onMoveCreateModel() {
                setModelPosition(scope.create.model.base, model, element);
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
      function setModelPosition(base, model, element) {
        element.setAttribute('cx', (base.x+model.x)+'');
        element.setAttribute('cy', (base.y+model.y)+'');
      }
    }
  ]);
