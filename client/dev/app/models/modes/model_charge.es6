angular.module('clickApp.services')
  .factory('modelChargeMode', [
    'modes',
    'settings',
    'modelsMode',
    'modelBaseMode',
    'model',
    'game',
    'gameModels',
    'gameModelSelection',
    function modelChargeModeServiceFactory(modesService,
                                           settingsService,
                                           modelsModeService,
                                           modelBaseModeService,
                                           modelService,
                                           gameService,
                                           gameModelsService,
                                           gameModelSelectionService) {
      let charge_actions = Object.create(modelBaseModeService.actions);
      charge_actions.endCharge = (state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipePromise(
          () => {
            return state.event('Game.command.execute',
                               'onModels', ['endCharge', [], stamps]);
          },
          () => {
            return state.event('Modes.switchTo', 'Model');
          }
        )();
      };
      charge_actions.setTargetModel = (state, event) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          (model) => {
            return R.pipeP(
              () => {
                return modelService
                  .chargeTarget(model)
                  .catch(R.always(null));
              },
              (target_stamp) => {
                return ( target_stamp === event['click#'].target.state.stamp ?
                         null :
                         event['click#'].target
                       );
              },
              (set_target) => {
                if(R.exists(set_target) &&
                   model.state.stamp === set_target.state.stamp) return null;

                return state.event('Game.command.execute',
                                   'onModels', [ 'setChargeTarget',
                                                  [state.factions, set_target],
                                                 stamps
                                               ]);
              }
            )();
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
      var buildChargeMove$ = R.curry((move, flip_move, small, state) => {
        let stamps = gameModelSelectionService
              .get('local', state.game.model_selection);
        let _move = ( R.path(['ui_state','flip_map'], state) ?
                      flip_move :
                      move
                    );
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          (model) => {
            return modelService
              .chargeTarget(model)
              .catch(R.always(null));
          },
          (target_stamp) => {
            return ( R.exists(target_stamp) ?
                     gameModelsService.findStamp(target_stamp, state.game.models) :
                     null
                   );
          },
          (target_model) => {
            return state.event('Game.command.execute',
                               'onModels', [ _move+'Charge',
                                             [state.factions, target_model, small],
                                             stamps
                                           ]);
          }
        )(state.game.models);
      });
      R.forEach(([move, keys, flip_move]) => {
        keys = keys;
        charge_actions[move] = buildChargeMove$(move, flip_move, false);
        charge_actions[move+'Small'] = buildChargeMove$(move, flip_move, true);
      }, moves);

      let charge_default_bindings = {
        'endCharge': 'c',
        'setTargetModel': 'shift+clickModel'
      };
      let charge_bindings = R.extend(Object.create(modelBaseModeService.bindings),
                                     charge_default_bindings);
      let charge_buttons = modelsModeService.buildButtons({ single: true,
                                                            end_charge: true
                                                          });
      let charge_mode = {
        onEnter: () => { },
        onLeave: () => { },
        name: 'ModelCharge',
        actions: charge_actions,
        buttons: charge_buttons,
        bindings: charge_bindings
      };
      modesService.registerMode(charge_mode);
      settingsService.register('Bindings',
                               charge_mode.name,
                               charge_default_bindings,
                               (bs) => {
                                 R.extend(charge_mode.bindings, bs);
                               });
      return charge_mode;
    }
  ]);
