(function() {

  angular.module('clickApp.directives')
    .factory('wallTemplateElement', wallTemplateElementModelFactory);

  wallTemplateElementModelFactory.$inject = [
    'template',
    'gameTemplateSelection',
    'gameMap',
    'labelElement',
  ];
  function wallTemplateElementModelFactory(templateModel,
                                           gameTemplateSelectionModel,
                                           gameMapService,
                                           labelElementModel) {
    const wallTemplateElementModel = {
      create: wallTemplateElementModelCreate,
      cleanup: () => {},
      update: wallTemplateElementModelUpdate
    };
    return wallTemplateElementModel;

    function wallTemplateElementModelCreate(svgNS, parent, template) {
      const group = document.createElementNS(svgNS, 'g');
      parent.appendChild(group);

      const rect = document.createElementNS(svgNS, 'rect');
      rect.classList.add('template');
      rect.classList.add('wall');
      rect.setAttribute('width', '40');
      rect.setAttribute('height', '7.5');
      rect.setAttribute('data-stamp', template.state.stamp);
      group.appendChild(rect);

      const label = labelElementModel.create(svgNS, group);

      return { container: group,
               wall: rect,
               label: label
             };
    }
    function wallTemplateElementModelUpdate(map, state, template, wall) {
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
                                  y: template.state.y+2
                                };
      const label_text = templateModel.fullLabel(template);

      updateWall(template, wall.wall);
      updateContainer(selected, local, remote, template, wall.container);
      labelElementModel.update(map_flipped,
                               zoom_factor,
                               label_flip_center,
                               label_text_center,
                               label_text,
                               wall.label);
    }
    function updateWall(template, wall) {
      wall.setAttribute('x', (template.state.x-20)+'');
      wall.setAttribute('y', (template.state.y-3.75)+'');
    }
    function updateContainer(selected, local, remote, template, container) {
      if(selected) container.classList.add('selection');
      else container.classList.remove('selection');
      if(local) container.classList.add('local');
      else container.classList.remove('local');
      if(remote) container.classList.add('remote');
      else container.classList.remove('remote');

      container.setAttribute('transform', ('rotate('+
                                           template.state.r+','+
                                           template.state.x+','+
                                           template.state.y+
                                           ')'
                                          ));
    }
  }
})();
