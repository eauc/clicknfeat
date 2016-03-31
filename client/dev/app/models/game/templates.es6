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
      modeForStampP: gameTemplatesModeForStampP,
      fromStampsP: gameTemplatesFromStampsP,
      onStampsP: gameTemplatesOnStampsP
    });

    const fromStampsP$ = R.curry(fromStampsP);
    const updateTemplates$ = R.curry(updateTemplates);

    R.curryService(gameTemplatesModel);
    return gameTemplatesModel;

    function gameTemplatesModeForStampP(stamp, templates) {
      return R.threadP(templates)(
        gameTemplatesModel.findStampP$(stamp),
        R.path(['state','type']),
        R.defaultTo('aoe'),
        (type) => {
          return type+'Template';
        }
      );
    }
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
        gameTemplatesModel.findAnyStampsP$(stamps),
        R.reject(R.isNil),
        R.map(callMethodOnTemplate),
        R.allP
      );

      function callMethodOnTemplate(template) {
        return self.Promise
          .resolve(templateModel.callP(method, args, template))
          .catch(onError(template));
      }
    }
    function updateTemplates(templates, news) {
      return R.thread(templates)(
        gameTemplatesModel.all,
        R.concat(news),
        R.uniqBy(R.path(['state','stamp'])),
        R.partition(templateModel.isLocked),
        ([locked, active]) => {
          return {
            active: active,
            locked: locked
          };
        }
      );
    }
  }
})();
