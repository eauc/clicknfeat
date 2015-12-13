'use strict';

angular.module('clickApp.directives').directive('clickGameTemplate', ['labelElement', 'aoeTemplateElement', 'sprayTemplateElement', 'wallTemplateElement', function (labelElementService, aoeTemplateElementService, sprayTemplateElementService, wallTemplateElementService) {
  var templates = {
    aoe: aoeTemplateElementService,
    spray: sprayTemplateElementService,
    wall: wallTemplateElementService
  };
  return {
    restrict: 'A',
    link: function link(scope, el /*, attrs*/) {
      var map = document.getElementById('map');
      var svgNS = map.namespaceURI;

      var template = scope.template;
      console.log('gameTemplate', template);
      if (R.isNil(template)) return;

      var element = templates[template.state.type].create(svgNS, el[0], template);
      element.container = el[0];

      scope.onGameEvent('mapFlipped', function onMapFlipped() {
        labelElementService.updateOnFlipMap(map, template.state, element.label);
      }, scope);
      function updateTemplate() {
        templates[template.state.type].update(map, scope, template, element);
      }
      updateTemplate();
      scope.onGameEvent('changeTemplate-' + template.state.stamp, updateTemplate, scope);
    }
  };
}]);

angular.module('clickApp.directives').directive('clickGameTemplatesList', [function () {
  return {
    restrict: 'A',
    templateUrl: 'partials/game/templates_list.html',
    scope: true,
    link: function link(scope, element /*, attrs*/) {
      scope.type = element[0].getAttribute('click-game-templates-list');
      console.log('clickGameTemplatesList', scope.type);
    }
  };
}]);
//# sourceMappingURL=gameTemplate.js.map
