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
                                         gameModelSelectionService
                                        ) {
      var model_actions = Object.create(modelsModeService.actions);
      model_actions.createAoEOnModel = function modelCreateAoEModel(scope) {
        var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
        return R.pipeP(
          () => {
            return gameModelsService.findStamp(stamps[0], scope.game.models);
          },
          (model) => {
            var position = R.pick(['x','y'], model.state);
            position.type = 'aoe';

            return gameService.executeCommand('createTemplate', [position],
                                              scope, scope.game);
          }
        )();
      };
      model_actions.createSprayOnModel = function modelCreateSprayModel(scope) {
        var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
        return R.pipeP(
          () => {
            return gameModelsService.findStamp(stamps[0], scope.game.models);
          },
          (model) =>{
            var position = R.pick(['x','y'], model.state);
            position.type = 'spray';

            return R.pipeP(
              () => {
                return gameService.executeCommand('createTemplate', [position],
                                                  scope, scope.game);
              },
              () => {
                // simulate set-origin-model in sprayTemplateMode
                return sprayTemplateModeService
                  .actions.setOriginModel(scope, { 'click#': { target: model } });
              }
            )();
          }
        )();
      };
      model_actions.selectAllFriendly = function modelSelectAllFriendly(scope) {
        var selection = gameModelSelectionService.get('local', scope.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(selection[0]),
          (model) => {
            var stamps = R.pipe(
              gameModelsService.all,
              R.filter(modelService.userIs$(modelService.user(model))),
              R.map(modelService.stamp)
            )(scope.game.models);

            return gameService.executeCommand('setModelSelection', 'set', stamps,
                                              scope, scope.game);
          }
        )(scope.game.models);
      };
      model_actions.selectAllUnit = function modelSelectAllUnit(scope) {
        var selection = gameModelSelectionService.get('local', scope.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(selection[0]),
          (model) => {
            var unit = modelService.unit(model);
            if(R.isNil(unit)) {
              return self.Promise.reject('Model not in unit');
            }
            
            var stamps = R.pipe(
              gameModelsService.all,
              R.filter(modelService.userIs$(modelService.user(model))),
              R.filter(modelService.unitIs$(unit)),
              R.map(modelService.stamp)
            )(scope.game.models);
            
            return gameService.executeCommand('setModelSelection', 'set', stamps,
                                              scope, scope.game);
          }
        )(scope.game.models);
      };
      model_actions.setB2B = function modelSetB2B(scope, event) {
        var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
        return R.pipeP(
          () => {
            return gameModelsService.findStamp(stamps[0], scope.game.models);
          },
          (model) => {
            if(model.state.stamp === event['click#'].target.state.stamp) return null;
            
            return gameService.executeCommand('onModels', 'setB2B',
                                              scope.factions, event['click#'].target,
                                              stamps, scope, scope.game);
          }
        )();
      };

      var model_default_bindings = {
        'createAoEOnModel': 'ctrl+a',
        'createSprayOnModel': 'ctrl+s',
        'selectAllUnit': 'ctrl+u',
        'selectAllFriendly': 'ctrl+f',
        'setB2B': 'ctrl+shift+clickModel',
      };
      var model_bindings = R.extend(Object.create(modelsModeService.bindings),
                                    model_default_bindings);

      var model_mode = {
        onEnter: function modelOnEnter(/*scope*/) {
        },
        onLeave: function modelOnLeave(/*scope*/) {
        },
        name: 'ModelBase',
        actions: model_actions,
        buttons: [],
        bindings: model_bindings,
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
