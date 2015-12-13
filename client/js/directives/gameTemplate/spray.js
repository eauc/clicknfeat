'use strict';

angular.module('clickApp.directives').factory('sprayTemplateElement', ['$window', 'template', 'sprayTemplate', 'gameTemplateSelection', 'gameModels', 'gameFactions', 'gameMap', 'labelElement', function ($window, templateService, sprayTemplateService, gameTemplateSelectionService, gameModelsService, gameFactionsService, gameMapService, labelElementService) {
  var POINTS = {
    6: '8.75,0 5.125,-59 10,-60 14.875,-59 11.25,0',
    8: '8.75,0 3.5,-78.672 10,-80 16.5,-78.672 11.25,0',
    10: '8.75,0 1.875,-98.34 10,-100 18.125,-98.34 11.25,0'
  };
  var sprayTemplateElementService = {
    create: function sprayTemplateElementServiceCreate(svgNS, parent, spray) {
      var over_models = document.getElementById('game-over-models');

      var group = document.createElementNS(svgNS, 'g');
      parent.appendChild(group);

      var polygon = document.createElementNS(svgNS, 'polygon');
      polygon.classList.add('template');
      polygon.classList.add('spray');
      polygon.setAttribute('data-stamp', spray.state.stamp);
      group.appendChild(polygon);

      var label = labelElementService.create(svgNS, group);

      var origin = document.createElementNS(svgNS, 'circle');
      origin.classList.add('spray-origin');
      origin.setAttribute('cx', '0');
      origin.setAttribute('cy', '0');
      origin.setAttribute('r', '0');
      origin.style.visibility = 'hidden';
      over_models.appendChild(origin);

      return { container: group,
        spray: polygon,
        label: label,
        origin: origin
      };
    },
    update: function sprayTemplateElementUpdate(map, scope, template, spray) {
      var selection = scope.game.template_selection;
      var local = gameTemplateSelectionService.in('local', template.state.stamp, selection);
      var remote = gameTemplateSelectionService.in('remote', template.state.stamp, selection);
      var selected = local || remote;
      var stroke_color = selected ? local ? '#0F0' : '#FFF' : '#C60';

      var map_flipped = gameMapService.isFlipped(map);
      var zoom_factor = gameMapService.zoomFactor(map);
      var label_flip_center = template.state;
      var label_text_center = { x: template.state.x,
        y: template.state.y + 5
      };
      var label_text = templateService.fullLabel(template);
      $window.requestAnimationFrame(function _sprayTemplateElementUpdate() {
        updateContainer(template, spray.container);
        updateSpray(stroke_color, template, spray.spray);
        labelElementService.update(map_flipped, zoom_factor, label_flip_center, label_text_center, label_text, spray.label);
        $window.requestAnimationFrame(function _aoeTemplateElementUpdate2() {
          if (gameTemplateSelectionService.inSingle('local', template.state.stamp, scope.game.template_selection)) {
            scope.gameEvent('changeSingleAoESelection', null);
          }
        });
      });

      R.pipeP(function () {
        return self.Promise.resolve(sprayTemplateService.origin(template));
      }, function (origin) {
        if (R.isNil(origin)) return;

        return gameModelsService.findStamp(origin, scope.game.models);
      }, function (origin_model) {
        updateOrigin(scope.factions, local, origin_model, spray.origin);
      })();
    }
  };
  function updateContainer(template, container) {
    container.setAttribute('transform', ['rotate(', template.state.r, ',', template.state.x, ',', template.state.y, ')'].join(''));
  }
  function updateSpray(stroke_color, template, spray) {
    spray.setAttribute('transform', ['translate(', template.state.x - 10, ',', template.state.y, ')'].join(''));
    spray.setAttribute('points', POINTS[template.state.s + '']);
    spray.style.stroke = stroke_color;
  }
  function updateOrigin(factions, local, model, origin) {
    $window.requestAnimationFrame(function _aoeTemplateElementUpdateOrigin() {
      if (!local || R.isNil(model)) {
        origin.style.visibility = 'hidden';
        return;
      }
      R.pipeP(gameFactionsService.getModelInfo$(model.state.info), function (info) {
        origin.setAttribute('cx', model.state.x + '');
        origin.setAttribute('cy', model.state.y + '');
        origin.setAttribute('r', info.base_radius + '');
        origin.style.visibility = 'visible';
      })(factions);
    });
  }
  return sprayTemplateElementService;
}]);
//# sourceMappingURL=spray.js.map
