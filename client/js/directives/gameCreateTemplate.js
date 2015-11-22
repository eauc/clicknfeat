'use strict';

angular.module('clickApp.directives')
  .directive('clickGameCreateTemplate', [
    '$window',
    function($window) {
      var templates = {};
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          var map = document.getElementById('map');
          var svgNS = map.namespaceURI;

          templates['aoe'] = {
            element: createAoE(document, svgNS, element[0]),
            setPosition: setAoEPosition,
          };
          templates['spray'] = {
            element: createSpray(document, svgNS, element[0]),
            setPosition: setSprayPosition,
          };
          templates['wall'] = {
            element: createWall(document, svgNS, element[0]),
            setPosition: setWallPosition,
          };

          scope.onGameEvent('enableCreateTemplate', function onEnableCreateTemplate() {
            var type = scope.create.template.type;
            templates[type].setPosition(scope.create.template);
            templates[type].element.style.visibility = 'visible';
          }, scope);
          scope.onGameEvent('moveCreateTemplate', function onMoveCreateTemplate() {
            var type = scope.create.template.type;
            templates[type].setPosition(scope.create.template);
          }, scope);
          scope.onGameEvent('disableCreateTemplate', function onDisableCreateTemplate() {
            templates['aoe'].element.style.visibility = 'hidden';
            templates['spray'].element.style.visibility = 'hidden';
            templates['wall'].element.style.visibility = 'hidden';
          }, scope);
        }
      };
      function createAoE(document, svgNS, element) {
        var aoe = document.createElementNS(svgNS, 'circle');
        aoe.id = 'create-template-aoe';
        aoe.setAttribute('cx', '240');
        aoe.setAttribute('cy', '240');
        aoe.setAttribute('r', '15');
        element.appendChild(aoe);
        return aoe;
      }
      function setAoEPosition(coord) {
        templates['aoe'].element.setAttribute('cx', coord.x+'');
        templates['aoe'].element.setAttribute('cy', coord.y+'');
      }
      function createSpray(document, svgNS, element) {
        var sp = document.createElementNS(svgNS, 'polygon');
        sp.id = 'create-template-spray';
        sp.setAttribute('points', '8.75,0 5.125,-59 10,-60 14.875,-59 11.25,0');
        sp.setAttribute('transform', 'translate(230,240)');
        element.appendChild(sp);
        return sp;
      }
      function setSprayPosition(coord) {
        templates['spray'].element.setAttribute('transform', [
          'translate(',
          coord.x-10,
          ',',
          coord.y,
          ')',
        ].join(''));
      }
      function createWall(document, svgNS, element) {
        var wall = document.createElementNS(svgNS, 'rect');
        wall.id = 'create-template-wall';
        wall.setAttribute('x', '220');
        wall.setAttribute('y', '236.25');
        wall.setAttribute('width', '40');
        wall.setAttribute('height', '7.5');
        element.appendChild(wall);
        return wall;
      }
      function setWallPosition(coord) {
        templates['wall'].element.setAttribute('x', (coord.x-20)+'');
        templates['wall'].element.setAttribute('y', (coord.y-3.75)+'');
      }
    }
  ]);
