(function() {
  angular.module('clickApp.services')
    .factory('gameTemplates', gameTemplatesModelFactory);

  gameTemplatesModelFactory.$inject = [
    'template',
    'gameElements',
  ];
  function gameTemplatesModelFactory(templateModel,
                                     gameElementsModel) {
    const base = gameElementsModel('template', templateModel);
    const gameTemplatesModel = Object.create(base);
    R.deepExtend(gameTemplatesModel, {
      fromStampsP: gameTemplatesFromStampsP,
      onStampsP: gameTemplatesOnStampsP
    });

    const fromStampsP$ = R.curry(fromStampsP);
    const updateTemplates$ = R.curry(updateTemplates);

    R.curryService(gameTemplatesModel);
    return gameTemplatesModel;

    function gameTemplatesFromStampsP(method, args, stamps, templates) {
      return fromStampsP$(R.compose(R.always, R.always(null)),
                          method, args, stamps, templates);
    }
    function gameTemplatesOnStampsP(method, args, stamps, templates) {
      return R.threadP(templates)(
        fromStampsP$(R.always, method, args, stamps),
        updateTemplates$(templates)
      );
    }
    function fromStampsP(onError, method, args, stamps, templates) {
      return R.threadP(templates)(
        gameTemplatesModel.findAnyStamps$(stamps),
        R.reject(R.isNil),
        R.map(callMethodOnTemplateP),
        R.allP
      );

      function callMethodOnTemplateP(template) {
        return R.resolveP(templateModel.callP(method, args, template))
          .catch(onError(template));
      }
    }
    function updateTemplates(templates, news) {
      return R.thread(templates)(
        gameTemplatesModel.all,
        R.concat(news),
        R.uniqBy(R.path(['state','stamp'])),
        R.partition(templateModel.isLocked),
        ([locked, active]) => ({
          active: active,
          locked: locked
        })
      );
    }
  }
})();
