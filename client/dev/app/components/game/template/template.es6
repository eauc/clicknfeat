(function() {
  angular.module('clickApp.directives')
    .directive('clickGameTemplate', gameTemplateDirectiveFactory)
    .directive('clickGameTemplatesList', gameTemplatesListDirectiveFactory);

  gameTemplateDirectiveFactory.$inject = [
    'appGame',
    'gameMap',
    'template',
    'gameTemplates',
    'gameTemplateSelection',
    // 'gameModels',
    'gameFactions',
  ];
  function gameTemplateDirectiveFactory(appGameService,
                                        gameMapService,
                                        templateModel,
                                        gameTemplatesModel,
                                        gameTemplateSelectionModel // ,
                                        // gameModelsModel,
                                        // gameFactionsModel
                                       ) {
    const gameTemplateDirective = {
      restrict: 'A',
      scope: true,
      link: link
    };
    return gameTemplateDirective;

    function link(scope) {
      console.log('gameTemplate', scope.template);

      const stamp = scope.template.state.stamp;
      scope.listenSignal(refreshRender,
                         appGameService.templates.flip_map,
                         scope);
      scope.listenSignal(refreshSelection,
                         appGameService.templates.selection_changes,
                         scope);
      scope.listenSignal(onTemplatesChanges,
                         appGameService.templates.changes,
                         scope);
      mount();

      function onTemplatesChanges([templates, stamps]) {
        if(!R.find(R.equals(stamp), stamps)) return;

        refreshRender(templates);
      }

      function mount() {
        const templates = appGameService.templates.templates.sample();
        refreshRender(templates);

        const selection = appGameService.templates.selection.sample();
        refreshSelection(selection);

      //   if(local &&
      //      R.exists(template.state.o)) {
      //     R.thread(state.game.models)(
      //       gameModelsModel.findStamp$(template.state.o),
      //       R.unless(
      //         R.isNil,
      //         R.pipe(
      //         (origin) => [
      //           origin,
      //           gameFactionsModel.getModelInfo(origin.state.info, state.factions)
      //         ],
      //         ([origin, info]) => {
      //           scope.render.origin = {
      //             cx: origin.state.x,
      //             cy: origin.state.y,
      //             radius: info.base_radius
      //           };
      //         }
      //       )
      //     )
      //   );
      // }
      }

      function refreshRender(templates) {
        const template = gameTemplatesModel.findStamp(stamp, templates);
        if(R.isNil(template)) return;
        scope.template = template;

        const map = document.getElementById('map');
        const is_flipped = gameMapService.isFlipped(map);
        template.render = templateModel.render(is_flipped, template.state);

        console.warn('RENDER TEMPLATE',
                     stamp, template.state, template.render);
      }
      function refreshSelection(selection) {
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
        console.warn('SELECTION TEMPLATE',
                     stamp, selection, scope.selection);
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
      console.log('clickGameTemplatesList', scope.type);
    }
  }
})();
