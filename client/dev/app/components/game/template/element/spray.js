'use strict';

(function () {
  angular.module('clickApp.directives').factory('sprayTemplateElement', sprayTemplateElementModelFactory);

  sprayTemplateElementModelFactory.$inject = ['template', 'sprayTemplate', 'gameTemplateSelection',
  // 'gameModels',
  // 'gameFactions',
  'gameMap', 'labelElement'];
  var POINTS = {
    6: '8.75,0 5.125,-59 10,-60 14.875,-59 11.25,0',
    8: '8.75,0 3.5,-78.672 10,-80 16.5,-78.672 11.25,0',
    10: '8.75,0 1.875,-98.34 10,-100 18.125,-98.34 11.25,0'
  };
  function sprayTemplateElementModelFactory(templateModel, sprayTemplateModel, gameTemplateSelectionModel,
  // gameModelsModel,
  // gameFactionsModel,
  gameMapService, labelElementModel) {
    var sprayTemplateElementModel = {
      create: sprayTemplateElementModelCreate,
      update: sprayTemplateElementModelUpdate
    };
    return sprayTemplateElementModel;

    function sprayTemplateElementModelCreate(svgNS, parent, spray) {
      var over_models = document.getElementById('game-over-models');

      var group = document.createElementNS(svgNS, 'g');
      parent.appendChild(group);

      var polygon = document.createElementNS(svgNS, 'polygon');
      polygon.classList.add('template');
      polygon.classList.add('spray');
      polygon.setAttribute('data-stamp', spray.state.stamp);
      group.appendChild(polygon);

      var label = labelElementModel.create(svgNS, group);

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
    }
    function sprayTemplateElementModelUpdate(map, state, template, spray) {
      var selection = state.game.template_selection;
      var local = gameTemplateSelectionModel.in('local', template.state.stamp, selection);
      var remote = gameTemplateSelectionModel.in('remote', template.state.stamp, selection);
      var selected = local || remote;
      var stroke_color = selected ? local ? '#0F0' : '#FFF' : '#C60';

      var map_flipped = gameMapService.isFlipped(map);
      var zoom_factor = gameMapService.zoomFactor(map);
      var label_flip_center = template.state;
      var label_text_center = { x: template.state.x,
        y: template.state.y + 5
      };
      var label_text = templateModel.fullLabel(template);

      updateContainer(template, spray.container);
      updateSpray(stroke_color, template, spray.spray);
      labelElementModel.update(map_flipped, zoom_factor, label_flip_center, label_text_center, label_text, spray.label);

      // R.threadP(template)(
      //   sprayTemplateModel.origin,
      //   findOriginModel,
      //   (origin_model) => updateOrigin(state.factions, local,
      //                                  origin_model, spray.origin)
      // );

      // function findOriginModel(origin) {
      //   if(R.isNil(origin)) return null;

      //   return gameModelsModel
      //     .findStampP(origin, state.game.models);
      // }
    }
    function updateContainer(template, container) {
      container.setAttribute('transform', ['rotate(', template.state.r, ',', template.state.x, ',', template.state.y, ')'].join(''));
    }
    function updateSpray(stroke_color, template, spray) {
      spray.setAttribute('transform', ['translate(', template.state.x - 10, ',', template.state.y, ')'].join(''));
      spray.setAttribute('points', POINTS[template.state.s + '']);
      spray.style.stroke = stroke_color;
    }
    // function updateOrigin(factions, local, model, origin) {
    //   if(!local ||
    //      R.isNil(model)) {
    //     origin.style.visibility = 'hidden';
    //     return;
    //   }
    //   R.threadP(factions)(
    //     gameFactionsModel.getModelInfoP$(model.state.info),
    //     (info) => {
    //       origin.setAttribute('cx', model.state.x+'');
    //       origin.setAttribute('cy', model.state.y+'');
    //       origin.setAttribute('r', info.base_radius+'');
    //       origin.style.visibility = 'visible';
    //     }
    //   );
    // }
  }
})();
//# sourceMappingURL=spray.js.map
