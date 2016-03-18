(function() {
  angular.module('clickApp.directives')
    .factory('aoeTemplateElement', aoeTemplateElementModelFactory);

  aoeTemplateElementModelFactory.$inject = [
    'template',
    'gameTemplateSelection',
    'gameMap',
    'labelElement',
  ];
  function aoeTemplateElementModelFactory(templateModel,
                                          gameTemplateSelectionModel,
                                          gameMapService,
                                          labelElementModel) {
    const aoeTemplateElementModel = {
      create: aoeTemplateElementModelCreate,
      cleanup: () => {},
      update: aoeTemplateElementModelUpdate
    };
    R.curryService(aoeTemplateElementModel);
    return aoeTemplateElementModel;

    function aoeTemplateElementModelCreate(svgNS, parent, aoe) {
      const circle = document.createElementNS(svgNS, 'circle');
      circle.classList.add('template');
      circle.classList.add('aoe');
      circle.setAttribute('data-stamp', aoe.state.stamp);
      parent.appendChild(circle);

      const line = document.createElementNS(svgNS, 'line');
      line.classList.add('template-aoe-direction');
      line.style['marker-end'] = 'url(#aoe-direction-end)';
      parent.appendChild(line);

      const label = labelElementModel.create(svgNS, parent);

      return { aoe: circle,
               dir: line,
               label: label
             };
    }
    function aoeTemplateElementModelUpdate(map, state, template, aoe) {
      const selection = state.game.template_selection;
      const local = gameTemplateSelectionModel
              .in('local', template.state.stamp, selection);
      const remote = gameTemplateSelectionModel
              .in('remote', template.state.stamp, selection);
      const selected = (local || remote);

      const map_flipped = gameMapService.isFlipped(map);
      const zoom_factor = gameMapService.zoomFactor(map);
      const label_flip_center = template.state;
      const label_text_center = { x: template.state.x,
                                  y: template.state.y + template.state.s + 5
                                };
      const label_text = templateModel.fullLabel(template);

      if(selected) aoe.container.classList.add('selection');
      else aoe.container.classList.remove('selection');
      if(local) aoe.container.classList.add('local');
      else aoe.container.classList.remove('local');
      if(remote) aoe.container.classList.add('remote');
      else aoe.container.classList.remove('remote');

      updateAoe(template, aoe.aoe);
      updateDir(template, aoe.dir);
      labelElementModel.update(map_flipped,
                               zoom_factor,
                               label_flip_center,
                               label_text_center,
                               label_text,
                               aoe.label);
    }
    function updateAoe(template, aoe) {
      aoe.setAttribute('cx', template.state.x+'');
      aoe.setAttribute('cy', template.state.y+'');
      aoe.setAttribute('r', template.state.s+'');
    }
    function updateDir(template, dir) {
      dir.setAttribute('x1', template.state.x+'');
      dir.setAttribute('y1', template.state.y+'');
      dir.setAttribute('x2', template.state.x+'');
      dir.setAttribute('y2', (template.state.y-template.state.s)+'');
      dir.setAttribute('transform', ('rotate('+
                                     template.state.r+','+
                                     template.state.x+','+
                                     template.state.y+
                                     ')'
                                    ));
    }
  }
})();
