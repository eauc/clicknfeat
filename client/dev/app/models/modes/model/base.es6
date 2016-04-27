(function() {
  angular.module('clickApp.services')
    .factory('modelBaseMode', modelBaseModeModelFactory);

  modelBaseModeModelFactory.$inject = [
    'appState',
    'settings',
    'modelsMode',
    'model',
    'gameModels',
    'gameModelSelection',
  ];
  function modelBaseModeModelFactory(appStateService,
                                     settingsModel,
                                     modelsModeModel,
                                     modelModel,
                                     gameModelsModel,
                                     gameModelSelectionModel) {
    const model_actions = Object.create(modelsModeModel.actions);
    model_actions.createAoEOnModel = modelCreateAoEOnModel;
    model_actions.createSprayOnModel = modelCreateSprayOnModel;
    model_actions.selectAllFriendly = modelSelectAllFriendly;
    model_actions.selectAllUnit = modelSelectAllUnit;
    model_actions.setB2B = modelSetB2B;
    model_actions.openEditLabel = modelOpenEditLabel;
    model_actions.openEditDamage = modelOpenEditDamage;

    const model_default_bindings = {
      'createAoEOnModel': 'ctrl+a',
      'createSprayOnModel': 'ctrl+s',
      'selectAllUnit': 'ctrl+u',
      'selectAllFriendly': 'ctrl+f',
      'setB2B': 'ctrl+shift+clickModel',
      'openEditLabel': 'shift+l',
      'openEditDamage': 'shift+d'
    };
    const model_bindings = R.extend(Object.create(modelsModeModel.bindings),
                                    model_default_bindings);

    const model_mode = {
      onEnter: () => { },
      onLeave: () => { },
      name: 'ModelBase',
      actions: model_actions,
      buttons: [],
      bindings: model_bindings
    };
    settingsModel.register('Bindings',
                             model_mode.name,
                             model_default_bindings,
                             (bs) => {
                               R.extend(model_mode.bindings, bs);
                             });
    return model_mode;

    function modelCreateAoEOnModel(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            (model) => R.pick(['x','y'], model.state),
            R.assoc('type', 'aoe'),
            (position) => ({
              base: { x: 0, y: 0, r: 0 },
              templates: [ R.assoc('r', 0, position) ]
            }),
            (create) => {
              const is_flipped = R.path(['ui_state','flip_map'], state);
              appStateService
                .chainReduce('Game.command.execute',
                             'createTemplate',
                             [create, is_flipped]);
            }
          )
        )
      );
    }
    function modelCreateSprayOnModel(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      return R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          R.pipe(
            (model) => R.thread(model)(
              modelModel.baseEdgeInDirection$(state.factions, model.state.r),
              R.assoc('o', model.state.stamp),
              R.assoc('r', model.state.r),
              R.assoc('type', 'spray'),
              (position) => ({
                base: { x: 0, y: 0, r: 0 },
                templates: [ position ]
              }),
              (create) => {
                const is_flipped = R.path(['ui_state','flip_map'], state);
                appStateService
                  .chainReduce('Game.command.execute',
                               'createTemplate',
                               [create, is_flipped]);
              }
            )
          )
        )
      );
    }
    function modelSelectAllFriendly(state) {
      const selection = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(selection[0]),
        R.unless(
          R.isNil,
          R.pipe(
            modelModel.user,
            (user) => R.thread(state.game)(
              R.prop('models'),
              gameModelsModel.all,
              R.filter(modelModel.userIs$(user)),
              R.map(modelModel.stamp)
            ),
            (stamps) => {
              appStateService
                .chainReduce('Game.command.execute',
                             'setModelSelection',
                             ['set', stamps]);
            }
          )
        )
      );
    }
    function modelSelectAllUnit(state) {
      const selection = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(selection[0]),
        R.unless(
          R.isNil,
          R.pipe(
            (model) => R.thread(model)(
              modelModel.unit,
              R.unless(
                R.equals(0),
                R.pipe(
                  (unit) => R.thread(state.game)(
                    R.prop('models'),
                    gameModelsModel.all,
                    R.filter(modelModel.userIs$(modelModel.user(model))),
                    R.filter(modelModel.unitIs$(unit)),
                    R.map(modelModel.stamp)
                  ),
                  (stamps) => {
                    appStateService
                      .chainReduce('Game.command.execute',
                                   'setModelSelection',
                                   ['set', stamps]);
                  }
                )
              )
            )
          )
        )
      );
    }
    function modelSetB2B(state, event) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          (model) => {
            if(model.state.stamp === event['click#'].target.state.stamp) return;

            appStateService
              .chainReduce('Game.command.execute',
                           'onModels', [
                             'setB2BP',
                             [state.factions, event['click#'].target],
                             stamps
                           ]);
          }
        )
      );
    }
    function modelOpenEditLabel(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        (model) => {
          appStateService
            .emit('Game.editLabel.open', 'onModels', model);
        }
      );
    }
    function modelOpenEditDamage(state) {
      const stamps = gameModelSelectionModel
              .get('local', state.game.model_selection);
      R.thread(state.game)(
        R.prop('models'),
        gameModelsModel.findStamp$(stamps[0]),
        R.unless(
          R.isNil,
          (model) => {
            appStateService
              .emit('Game.editDamage.toggle', model);
          }
        )
      );
    }
  }
})();
