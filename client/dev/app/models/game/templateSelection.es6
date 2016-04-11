(function() {
  angular.module('clickApp.models')
    .factory('gameTemplateSelection', gameTemplateSelectionModelFactory);

  gameTemplateSelectionModelFactory.$inject = [
    'appState',
    'gameElementSelection',
    'gameTemplates',
  ];
  function gameTemplateSelectionModelFactory(appStateService,
                                             gameElementSelectionModel,
                                             gameTemplatesModel) {
    const base = gameElementSelectionModel('template');
    const gameTemplateSelectionModel = Object.create(base);
    R.deepExtend(gameTemplateSelectionModel, {
      checkMode: templateSelectionCheckMode
    });
    R.curryService(gameTemplateSelectionModel);
    return gameTemplateSelectionModel;

    function templateSelectionCheckMode(selection) {
      const state = appStateService.current();
      return R.thread(selection)(
        gameTemplateSelectionModel.get$('local'),
        R.ifElse(
          R.isEmpty,
          () => null,
          (local) => R.thread(local)(
            R.head,
            gameTemplatesModel.findStamp$(R.__, state.game.templates),
            (template) => `${template.state.type}Template`
          )
        )
      );
    }
  }
})();
