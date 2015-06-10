'use strict';

angular.module('clickApp.directives')
  .directive('clickCreateModel', [
    '$window',
    'gameFactions',
    function($window,
             gameFactionsService) {
      var BASE_RADIUS = {
        huge: 24.605,
        large: 9.842,
        medium: 7.874,
        small: 5.905
      };

      return {
        restrict: 'A',
        link: function(scope, el, attrs) {
          var map = document.getElementById('map');
          var svgNS = map.namespaceURI;

          console.log('clickCreateModel', scope.index);
          var model = R.nth(scope.index, scope.create.model.models);
          var info = gameFactionsService.getModelInfo(model.info, scope.factions);
          var element = createModelElement(info, document, svgNS, el[0]);
          setModelPosition(scope.create.model.base, model, element);

          scope.onGameEvent('moveCreateModel', function onMoveCreateModel() {
            $window.requestAnimationFrame(function _onMoveCreateModel() {
              setModelPosition(scope.create.model.base, model, element);
            });
          }, scope);
        }
      };
      function createModelElement(info, document, svgNS, parent) {
        var element = document.createElementNS(svgNS, 'circle');
        element.classList.add('create-model');
        element.setAttribute('cx', '240');
        element.setAttribute('cy', '240');
        element.setAttribute('r', BASE_RADIUS[info.base]);
        parent.appendChild(element);
        return element;
      }
      function setModelPosition(base, model, element) {
        element.setAttribute('cx', (base.x+model.x)+'');
        element.setAttribute('cy', (base.y+model.y)+'');
      }
    }
  ])
  .directive('clickCreateModels', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          console.log('clickCreateModels');
          scope.digestOnGameEvent('enableCreateModel', scope);
          scope.digestOnGameEvent('disableCreateModel', scope);
        }
      };
    }
  ]);
