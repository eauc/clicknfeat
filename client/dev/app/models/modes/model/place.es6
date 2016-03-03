angular.module('clickApp.services')
  .factory('modelPlaceMode', [
    'modes',
    'settings',
    'modelsMode',
    'modelBaseMode',
    'game',
    'gameModels',
    'gameModelSelection',
    function modelPlaceModeServiceFactory(modesService,
                                          settingsService,
                                          modelsModeService,
                                          modelBaseModeService,
                                          gameService,
                                          gameModelsService,
                                          gameModelSelectionService) {
      let model_actions = Object.create(modelBaseModeService.actions);
      model_actions.endPlace = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipePromise(
          function() {
            return state.event('Game.command.execute',
                               'onModels', [ 'endPlace', [], stamps]);
          },
          function() {
            return state.event('Modes.switchTo', 'Model');
          }
        )();
      };
      model_actions.setTargetModel = (state, event) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          (model) => {
            if(model.state.stamp === event['click#'].target.state.stamp) return null;
            
            return state.event('Game.command.execute',
                               'onModels', [ 'setPlaceTarget',
                                             [state.factions, event['click#'].target],
                                             stamps
                                           ]);
          }
        )(state.game.models);
      };
      model_actions.setOriginModel = (state, event) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          (model) => {
            if(model.state.stamp === event['click#'].target.state.stamp) return null;
            
            return state.event('Game.command.execute',
                               'onModels', [ 'setPlaceOrigin',
                                             [state.factions, event['click#'].target],
                                             stamps
                                           ]);
          }
        )(state.game.models);
      };
      let moves = [
        ['moveFront', 'up', 'moveFront'],
        ['moveBack', 'down', 'moveBack'],
        ['rotateLeft', 'left', 'rotateLeft'],
        ['rotateRight', 'right', 'rotateRight'],
        ['shiftUp', 'ctrl+up', 'shiftDown'],
        ['shiftDown', 'ctrl+down', 'shiftUp'],
        ['shiftLeft', 'ctrl+left', 'shiftRight'],
        ['shiftRight', 'ctrl+right', 'shiftLeft'],
      ];
      var buildPlaceMove$ = R.curry((move, flip_move, small, state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        let _move = ( R.path(['ui_state','flip_map'], state) ?
                      flip_move :
                      move
                    );

        return state.event('Game.command.execute',
                           'onModels', [ _move+'Place',
                                         [state.factions, small],
                                         stamps
                                       ]);
      });
      R.forEach(([move, keys, flip_move]) => {
        keys = keys;
        model_actions[move] = buildPlaceMove$(move, flip_move, false);
        model_actions[move+'Small'] = buildPlaceMove$(move, flip_move, true);
      }, moves);

      let model_default_bindings = {
        'endPlace': 'p',
        'setTargetModel': 'shift+clickModel',
        'setOriginModel': 'ctrl+clickModel'
      };
      let model_bindings = R.extend(Object.create(modelBaseModeService.bindings),
                                    model_default_bindings);
      let model_buttons = modelsModeService.buildButtons({ single: true,
                                                           end_place: true
                                                         });
      let model_mode = {
        onEnter: () => { },
        onLeave: () => { },
        name: 'ModelPlace',
        actions: model_actions,
        buttons: model_buttons,
        bindings: model_bindings
      };
      modesService.registerMode(model_mode);
      settingsService.register('Bindings',
                               model_mode.name,
                               model_default_bindings,
                               (bs) => {
                                 R.extend(model_mode.bindings, bs);
                               });
      return model_mode;
    }
  ]);
