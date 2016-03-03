'use strict';

(function () {
  angular.module('clickApp.directives').factory('aoeTemplateElement', aoeTemplateElementModelFactory);

  aoeTemplateElementModelFactory.$inject = ['template', 'gameTemplateSelection', 'gameMap', 'labelElement'];
  function aoeTemplateElementModelFactory(templateModel, gameTemplateSelectionModel, gameMapService, labelElementModel) {
    var aoeTemplateElementModel = {
      create: aoeTemplateElementModelCreate,
      update: aoeTemplateElementModelUpdate
    };
    R.curryService(aoeTemplateElementModel);
    return aoeTemplateElementModel;

    function aoeTemplateElementModelCreate(svgNS, parent, aoe) {
      var circle = document.createElementNS(svgNS, 'circle');
      circle.classList.add('template');
      circle.classList.add('aoe');
      circle.setAttribute('data-stamp', aoe.state.stamp);
      parent.appendChild(circle);

      var line = document.createElementNS(svgNS, 'line');
      line.classList.add('template-aoe-direction');
      line.style['marker-end'] = 'url(#aoe-direction-end)';
      parent.appendChild(line);

      var label = labelElementModel.create(svgNS, parent);

      return { aoe: circle,
        dir: line,
        label: label
      };
    }
    function aoeTemplateElementModelUpdate(map, state, template, aoe) {
      var selection = state.game.template_selection;
      var local = gameTemplateSelectionModel.in('local', template.state.stamp, selection);
      var remote = gameTemplateSelectionModel.in('remote', template.state.stamp, selection);
      var selected = local || remote;

      var map_flipped = gameMapService.isFlipped(map);
      var zoom_factor = gameMapService.zoomFactor(map);
      var label_flip_center = template.state;
      var label_text_center = { x: template.state.x,
        y: template.state.y + template.state.s + 5
      };
      var label_text = templateModel.fullLabel(template);

      if (selected) aoe.container.classList.add('selection');else aoe.container.classList.remove('selection');
      if (local) aoe.container.classList.add('local');else aoe.container.classList.remove('local');
      if (remote) aoe.container.classList.add('remote');else aoe.container.classList.remove('remote');

      updateAoe(template, aoe.aoe);
      updateDir(template, aoe.dir);
      labelElementModel.update(map_flipped, zoom_factor, label_flip_center, label_text_center, label_text, aoe.label);
    }
    function updateAoe(template, aoe) {
      aoe.setAttribute('cx', template.state.x + '');
      aoe.setAttribute('cy', template.state.y + '');
      aoe.setAttribute('r', template.state.s + '');
    }
    function updateDir(template, dir) {
      dir.setAttribute('x1', template.state.x + '');
      dir.setAttribute('y1', template.state.y + '');
      dir.setAttribute('x2', template.state.x + '');
      dir.setAttribute('y2', template.state.y - template.state.s + '');
      dir.setAttribute('transform', 'rotate(' + template.state.r + ',' + template.state.x + ',' + template.state.y + ')');
    }
  }
})();
//# sourceMappingURL=aoe.js.map
