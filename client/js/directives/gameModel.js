'use strict';

angular.module('clickApp.directives')
  .directive('clickGameModel', [
    'gameFactions',
    'labelElement',
    function(gameFactionsService,
             labelElementService) {
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

          var info = gameFactionsService.getModelInfo(scope.model.state.info,
                                                      scope.factions);
          console.log('gameModel', scope.model, info);
          if(R.isNil(scope.model) ||
             R.isNil(info)) return;
          var container = el[0];
          var element = createModelElement(info, svgNS, container);

          // scope.onGameEvent('mapFlipped', function onMapFlipped() {
          //   labelElementService.updateOnFlipMap(map, model.state, element.label);
          // }, scope);
          function updateModel(event, selection) {
            self.requestAnimationFrame(function _updateModel() {
              updateModelPosition(info, scope.model, element);
            });
          }
          updateModel();
          scope.onGameEvent('changeModel-'+scope.model.state.stamp,
                            updateModel, scope);
        }
      };
      function createModelElement(info, svgNS, parent) {
        var base = document.createElementNS(svgNS, 'circle');
        base.classList.add('model-base');
        base.setAttribute('cx', (info.img[0].width/2)+'');
        base.setAttribute('cy', (info.img[0].height/2)+'');
        base.setAttribute('r', BASE_RADIUS[info.base]);
        base.setAttribute('style', [
          'fill:', info.base_color, ';',
        ].join(''));
        parent.appendChild(base);

        var direction = document.createElementNS(svgNS, 'line');
        direction.classList.add('model-los');
        direction.setAttribute('x1', (info.img[0].width/2)+'');
        direction.setAttribute('y1', (info.img[0].height/2)+'');
        direction.setAttribute('x2', (info.img[0].width/2)+'');
        direction.setAttribute('y2', (info.img[0].height/2-BASE_RADIUS[info.base])+'');
        parent.appendChild(direction);

        var front_arc = document.createElementNS(svgNS, 'line');
        front_arc.classList.add('model-los');
        front_arc.setAttribute('x1', (info.img[0].width/2-BASE_RADIUS[info.base])+'');
        front_arc.setAttribute('y1', (info.img[0].height/2)+'');
        front_arc.setAttribute('x2', (info.img[0].width/2+BASE_RADIUS[info.base])+'');
        front_arc.setAttribute('y2', (info.img[0].height/2)+'');
        parent.appendChild(front_arc);

        // var image = document.createElementNS(svgNS, 'image');
        // image.classList.add('model-image');
        // image.setAttribute('x', '0');
        // image.setAttribute('y', '0');
        // image.setAttribute('width', info.img[0].width+'');
        // image.setAttribute('height', info.img[0].height+'');
        // image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', info.img[0].link);
        // parent.appendChild(image);

        return { container: parent,
                 base: base,
                 direction: direction,
                 front_arc: front_arc,
                 // image: image,
               };
      }
      function updateModelPosition(info, model, element) {
        element.container.setAttribute('transform', [
          'translate(',
          model.state.x-info.img[0].width/2,
          ',',
          model.state.y-info.img[0].height/2,
          ') rotate(',
          model.state.r,
          ',',
          model.state.x,
          ',',
          model.state.y,
          ')'
        ].join(''));
      }
    }
  ])
  .directive('clickGameModelsList', [
    '$window',
    function($window) {
      return {
        restrict: 'A',
        link: function(scope, element, attrs) {
          scope.digestOnGameEvent('createModel', scope);
        }
      };
    }
  ]);
