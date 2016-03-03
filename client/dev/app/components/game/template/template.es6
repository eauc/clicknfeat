(function() {
  angular.module('clickApp.directives')
    .directive('clickGameTemplate', gameTemplateDirectiveFactory)
    .directive('clickGameTemplatesList', gameTemplatesListDirectiveFactory);

  gameTemplateDirectiveFactory.$inject = [
    'labelElement',
    'aoeTemplateElement',
    'sprayTemplateElement',
    'wallTemplateElement',
    'gameTemplates',
  ];
  function gameTemplateDirectiveFactory(labelElementModel,
                                        aoeTemplateElementModel,
                                        sprayTemplateElementModel,
                                        wallTemplateElementModel,
                                        gameTemplatesModel) {
    const templates = {
      aoe: aoeTemplateElementModel,
      spray: sprayTemplateElementModel,
      wall: wallTemplateElementModel
    };
    const gameTemplateDirective = {
      restrict: 'A',
      link: link
    };
    return gameTemplateDirective;

    function link(scope, parent) {
      const map = document.getElementById('map');
      const svgNS = map.namespaceURI;

      const template = scope.template;
      console.log('gameTemplate', template);
      if(R.isNil(template)) return;

      const element = templates[template.state.type]
              .create(svgNS, parent[0], template);
      element.container = parent[0];

      scope.onStateChangeEvent('Game.map.flipped', () => {
        labelElementModel
          .updateOnFlipMap(map, template.state, element.label);
      }, scope);
      updateTemplate();
      scope.onStateChangeEvent(`Game.template.change.${template.state.stamp}`,
                               updateTemplate, scope);

      function updateTemplate() {
        R.threadP()(
          () => gameTemplatesModel
            .findStampP(template.state.stamp, scope.state.game.templates),
          (template) => templates[template.state.type]
            .update(map, scope.state, template, element)
        );
      }
    }
  }

  gameTemplatesListDirectiveFactory.$inject = [];
  function gameTemplatesListDirectiveFactory() {
    const gameTemplatesListDirective = {
      restrict: 'A',
      templateUrl: 'app/components/game/template/templates_list.html',
      scope: true,
      link: link
    };
    return gameTemplatesListDirective;

    function link(scope, element) {
      scope.type = element[0].getAttribute('click-game-templates-list');
      scope.digestOnStateChangeEvent('Game.template.create', scope);
      console.log('clickGameTemplatesList', scope.type);
    }
  }
})();
