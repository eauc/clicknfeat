'use strict';

angular.module('clickApp.directives').factory('wallTemplateElement', ['$window', 'template', 'gameTemplateSelection', 'gameMap', 'labelElement', function ($window, templateService, gameTemplateSelectionService, gameMapService, labelElementService) {
  var wallTemplateElementService = {
    create: function wallTemplateElementServiceCreate(svgNS, parent, template) {
      var group = document.createElementNS(svgNS, 'g');
      parent.appendChild(group);

      var rect = document.createElementNS(svgNS, 'rect');
      rect.classList.add('template');
      rect.classList.add('wall');
      rect.setAttribute('width', '40');
      rect.setAttribute('height', '7.5');
      rect.setAttribute('data-stamp', template.state.stamp);
      group.appendChild(rect);

      var label = labelElementService.create(svgNS, group);

      return { container: group,
        wall: rect,
        label: label
      };
    },
    update: function wallTemplateElementUpdate(map, scope, template, wall) {
      var selection = scope.game.template_selection;
      var local = gameTemplateSelectionService.in('local', template.state.stamp, selection);
      var remote = gameTemplateSelectionService.in('remote', template.state.stamp, selection);
      var selected = local || remote;

      var map_flipped = gameMapService.isFlipped(map);
      var zoom_factor = gameMapService.zoomFactor(map);
      var label_flip_center = template.state;
      var label_text_center = { x: template.state.x,
        y: template.state.y + 2
      };
      var label_text = templateService.fullLabel(template);
      $window.requestAnimationFrame(function _wallTemplateElementUpdate() {
        updateWall(template, wall.wall);
        updateContainer(selected, local, remote, template, wall.container);
        labelElementService.update(map_flipped, zoom_factor, label_flip_center, label_text_center, label_text, wall.label);
        $window.requestAnimationFrame(function _aoeTemplateElementUpdate2() {
          if (gameTemplateSelectionService.inSingle('local', template.state.stamp, scope.game.template_selection)) {
            scope.gameEvent('changeSingleAoESelection', null);
          }
        });
      });
    }
  };
  function updateWall(template, wall) {
    wall.setAttribute('x', template.state.x - 20 + '');
    wall.setAttribute('y', template.state.y - 3.75 + '');
  }
  function updateContainer(selected, local, remote, template, container) {
    if (selected) container.classList.add('selection');else container.classList.remove('selection');
    if (local) container.classList.add('local');else container.classList.remove('local');
    if (remote) container.classList.add('remote');else container.classList.remove('remote');

    container.setAttribute('transform', 'rotate(' + template.state.r + ',' + template.state.x + ',' + template.state.y + ')');
  }
  return wallTemplateElementService;
}]);
//# sourceMappingURL=wall.js.map
