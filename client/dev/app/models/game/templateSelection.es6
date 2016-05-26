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
      checkMode: templateSelectionCheckMode
    });
    R.curryService(gameTemplateSelectionModel);
    return gameTemplateSelectionModel;

    function templateSelectionCheckMode(templates, selection) {
      const local = gameTemplateSelectionModel
              .get('local', selection);
      if(R.isEmpty(local)) return null;

      const template = gameTemplatesModel
              .findStamp$(R.head(local), templates);
      if(R.isNil(template)) return null;

      return `${template.state.type}Template`;
    }
  }
})();
