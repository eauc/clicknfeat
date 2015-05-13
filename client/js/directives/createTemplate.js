'use strict';

angular.module('clickApp.directives')
  .directive('clickCreateTemplate', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var map = document.getElementById('map');
          var svgNS = map.namespaceURI;

          var aoe = document.createElementNS(svgNS, 'circle');
          aoe.id = 'create-template-aoe';
          aoe.setAttribute('cx', '240');
          aoe.setAttribute('cy', '240');
          aoe.setAttribute('r', '15');
          element[0].appendChild(aoe);

          scope.$on('enableCreateTemplate', function onEnableCreateTemplate() {
            $window.requestAnimationFrame(function _onEnableCreateTemplate() {
              aoe.setAttribute('cx', scope.create.template.x+'');
              aoe.setAttribute('cy', scope.create.template.y+'');
              aoe.style.visibility = 'visible';
            });
          });
          scope.$on('moveCreateTemplate', function onMoveCreateTemplate() {
            $window.requestAnimationFrame(function _onMoveCreateTemplate() {
              aoe.setAttribute('cx', scope.create.template.x+'');
              aoe.setAttribute('cy', scope.create.template.y+'');
            });
          });
          scope.$on('disableCreateTemplate', function onDisableCreateTemplate() {
            $window.requestAnimationFrame(function _onDisableCreateTemplate() {
              aoe.style.visibility = 'hidden';
            });
          });
        }
      };
    }
  ]);
