angular.module('clickApp.services')
  .factory('modelBaseMode', [
    'modes',
    'settings',
    'modelsMode',
    'sprayTemplateMode',
    'model',
    'game',
    'gameModels',
    'gameModelSelection',
    function modelBaseModeServiceFactory(modesService,
                                         settingsService,
                                         modelsModeService,
                                         sprayTemplateModeService,
                                         modelService,
                                         gameService,
                                         gameModelsService,
                                         gameModelSelectionService) {
      let model_actions = Object.create(modelsModeService.actions);
      model_actions.createAoEOnModel = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          () => {
            return gameModelsService.findStamp(stamps[0], state.game.models);
          },
          (model) => {
            let position = R.pick(['x','y'], model.state);
            position.type = 'aoe';
            let create = {
              base: { x: 0, y: 0 },
              templates: [position]
            };
            let is_flipped = R.path(['ui_state','flip_map'], state);
            return state.event('Game.command.execute',
                               'createTemplate', [create, is_flipped]);
          }
        )();
      };
      model_actions.createSprayOnModel = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          () => {
            return gameModelsService.findStamp(stamps[0], state.game.models);
          },
          (model) =>{
            let position = R.pick(['x','y'], model.state);
            position.type = 'spray';
            let create = {
              base: { x: 0, y: 0 },
              templates: [position]
            };
            let is_flipped = R.path(['ui_state','flip_map'], state);
            return R.pipePromise(
              () => {
                return state.event('Game.command.execute',
                                   'createTemplate', [create, is_flipped]);
              },
              () => {
                // simulate set-origin-model in sprayTemplateMode
                return sprayTemplateModeService.actions
                  .setOriginModel(state, { 'click#': { target: model } });
              }
            )();
          }
        )();
      };
      model_actions.selectAllFriendly = (state) => {
        let selection = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(selection[0]),
          (model) => {
            let stamps = R.pipe(
              gameModelsService.all,
              R.filter(modelService.userIs$(modelService.user(model))),
              R.map(modelService.stamp)
            )(state.game.models);

            return state.event('Game.command.execute',
                               'setModelSelection', ['set', stamps]);
          }
        )(state.game.models);
      };
      model_actions.selectAllUnit = (state) => {
        let selection = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(selection[0]),
          (model) => {
            let unit = modelService.unit(model);
            if(R.isNil(unit)) {
              return self.Promise.reject('Model not in unit');
            }
            
            let stamps = R.pipe(
              gameModelsService.all,
              R.filter(modelService.userIs$(modelService.user(model))),
              R.filter(modelService.unitIs$(unit)),
              R.map(modelService.stamp)
            )(state.game.models);
            
            return state.event('Game.command.execute',
                               'setModelSelection', ['set', stamps]);
          }
        )(state.game.models);
      };
      model_actions.setB2B = (state, event) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          () => {
            return gameModelsService.findStamp(stamps[0], state.game.models);
          },
          (model) => {
            if(model.state.stamp === event['click#'].target.state.stamp) return null;
            
            return state.event('Game.command.execute',
                               'onModels', [ 'setB2B',
                                             [state.factions, event['click#'].target],
                                             stamps
                                           ]);
          }
        )();
      };
      model_actions.openEditLabel = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          () => {
            return gameModelsService.findStamp(stamps[0], state.game.models);
          },
          (model) => {
            state.changeEvent('Game.editLabel.open', model);
          }
        )();
      };
      model_actions.openEditDamage = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          () => {
            return gameModelsService.findStamp(stamps[0], state.game.models);
          },
          (model) => {
            state.changeEvent('Game.editDamage.toggle', model);
          }
        )();
      };

      let model_default_bindings = {
        'createAoEOnModel': 'ctrl+a',
        'createSprayOnModel': 'ctrl+s',
        'selectAllUnit': 'ctrl+u',
        'selectAllFriendly': 'ctrl+f',
        'setB2B': 'ctrl+shift+clickModel',
        'openEditLabel': 'shift+l',
        'openEditDamage': 'shift+d'
      };
      let model_bindings = R.extend(Object.create(modelsModeService.bindings),
                                    model_default_bindings);

      let model_mode = {
        onEnter: () => { },
        onLeave: () => { },
        name: 'ModelBase',
        actions: model_actions,
        buttons: [],
        bindings: model_bindings
      };
      settingsService.register('Bindings',
                               model_mode.name,
                               model_default_bindings,
                               (bs) => {
                                 R.extend(model_mode.bindings, bs);
                               });
      return model_mode;
    }
  ]);
