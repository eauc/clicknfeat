(function() {
  angular.module('clickApp.directives')
    .directive('clickGameTemplate', gameTemplateDirectiveFactory)
    .directive('clickGameTemplatesList', gameTemplatesListDirectiveFactory);

  gameTemplateDirectiveFactory.$inject = [
    'appState',
    'gameMap',
    'template',
    'gameTemplateSelection',
  ];
  function gameTemplateDirectiveFactory(appStateService,
                                        gameMapService,
                                        templateModel,
                                        gameTemplateSelectionModel) {
    const gameTemplateDirective = {
      restrict: 'A',
      scope: true,
      link: link
    };
    return gameTemplateDirective;

    function link(scope) {
      console.log('gameTemplate', scope.template);

      const template = scope.template;
      scope.onStateChangeEvent('Game.view.flipMap', onUpdate, scope);
      scope.onStateChangeEvent('Game.templates.change', onUpdate, scope);
      scope.onStateChangeEvent('Game.template_selection.change', onUpdate, scope);
      scope.onStateChangeEvent(`Game.template.change.${template.state.stamp}`,
                               _onUpdate, scope);
      updateTemplate(scope);

      let _template;
      let _selection;
      let _is_flipped;
      function onUpdate() {
        const map = document.getElementById('map');
        const is_flipped = gameMapService.isFlipped(map);
        const state = appStateService.current();
        const selection = R.path(['game','template_selection'], state);
        const template = scope.template;
        if(_template === template &&
           _selection === selection &&
           _is_flipped === is_flipped) {
          return;
        }
        _template = template;
        _selection = selection;
        _is_flipped = is_flipped;

        _onUpdate();
      }
      function _onUpdate() {
        updateTemplate(scope);
        scope.$digest();
      }
    }

    function updateTemplate(scope) {
      const map = document.getElementById('map');
      const is_flipped = gameMapService.isFlipped(map);
      const template = scope.template;
      console.warn('RENDER TEMPLATE', template.state.stamp);
      scope.render = templateModel.render(is_flipped, template.state);

      const state = appStateService.current();
      const selection = R.path(['game','template_selection'], state);
      const stamp = template.state.stamp;
      const local = gameTemplateSelectionModel
              .in('local', stamp, selection);
      const remote = gameTemplateSelectionModel
              .in('remote', stamp, selection);
      const selected = (local || remote);
      scope.selection = {
        local: local,
        remote: remote,
        selected: selected
      };
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
      scope.digestOnStateChangeEvent('Game.templates.change', scope);
      console.log('clickGameTemplatesList', scope.type);
    }
  }
})();
