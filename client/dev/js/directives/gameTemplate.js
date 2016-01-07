'use strict';

angular.module('clickApp.directives').directive('clickGameTemplate', ['labelElement', 'aoeTemplateElement', 'sprayTemplateElement', 'wallTemplateElement', 'gameTemplates', function (labelElementService, aoeTemplateElementService, sprayTemplateElementService, wallTemplateElementService, gameTemplatesService) {
  var templates = {
    aoe: aoeTemplateElementService,
    spray: sprayTemplateElementService,
    wall: wallTemplateElementService
  };
  return {
    restrict: 'A',
    link: function link(scope, parent) {
      var map = document.getElementById('map');
      var svgNS = map.namespaceURI;

      var template = scope.template;
      console.log('gameTemplate', template);
      if (R.isNil(template)) return;

      var element = templates[template.state.type].create(svgNS, parent[0], template);
      element.container = parent[0];

      scope.onStateChangeEvent('Game.map.flipped', function () {
        labelElementService.updateOnFlipMap(map, template.state, element.label);
      }, scope);
      function updateTemplate() {
        R.pipePromise(function () {
          return gameTemplatesService.findStamp(template.state.stamp, scope.state.game.templates);
        }, function (template) {
          templates[template.state.type].update(map, scope.state, template, element);
        })();
      }
      updateTemplate();
      scope.onStateChangeEvent('Game.template.change.' + template.state.stamp, updateTemplate, scope);
    }
  };
}]).directive('clickGameTemplatesList', [function () {
  return {
    restrict: 'A',
    templateUrl: 'partials/game/templates_list.html',
    scope: true,
    link: function link(scope, element) {
      scope.type = element[0].getAttribute('click-game-templates-list');
      scope.digestOnStateChangeEvent('Game.template.create', scope);
      console.log('clickGameTemplatesList', scope.type);
    }
  };
}]);
//# sourceMappingURL=gameTemplate.js.map
