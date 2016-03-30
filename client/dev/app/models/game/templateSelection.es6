(function() {
  angular.module('clickApp.models')
    .factory('gameTemplateSelection', gameTemplateSelectionModelFactory);

  gameTemplateSelectionModelFactory.$inject = [
    'gameElementSelection',
    'gameTemplates',
  ];
  function gameTemplateSelectionModelFactory(gameElementSelectionModel,
                                             gameTemplatesModel) {
    const base = gameElementSelectionModel('template');
    const gameTemplateSelectionModel = Object.create(base);
    R.deepExtend(gameTemplateSelectionModel, {
      checkModeP: templateSelectionCheckModeP
    });
    R.curryService(gameTemplateSelectionModel);
    return gameTemplateSelectionModel;

    function templateSelectionCheckModeP(state, selection) {
      return R.threadP(selection)(
        gameTemplateSelectionModel.get$('local'),
        R.head,
        R.rejectIfP(R.isNil, 'No template selection'),
        (stamp) => gameTemplatesModel
          .findStampP(stamp, state.game.templates),
        (template) => {
          state.queueEventP('Modes.switchTo',
                            `${template.state.type}Template`);
        }
      );
    }
  }
})();
