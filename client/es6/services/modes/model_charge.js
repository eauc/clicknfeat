'use strict';

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
      var charge_actions = Object.create(modelBaseModeService.actions);
      charge_actions.endCharge = function modelEndCharge(scope) {
        var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
        return R.pipeP(
          function() {
            return gameService.executeCommand('onModels', 'endCharge',
                                              stamps, scope, scope.game);
          },
          function() {
            return scope.doSwitchToMode('Model');
          }
        )();
      };
      charge_actions.setTargetModel = function modelSetTargetModel(scope, event) {
        var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          function(model) {
            return R.pipeP(
              function() {
                return modelService.chargeTarget(model)
                  .catch(R.always(null));
              },
              function(target_stamp) {
                return ( target_stamp === event['click#'].target.state.stamp ?
                         null :
                         event['click#'].target
                       );
              },
              function(set_target) {
                if(R.exists(set_target) &&
                   model.state.stamp === set_target.state.stamp) return;

                return gameService.executeCommand('onModels', 'setChargeTarget',
                                                  scope.factions, set_target,
                                                  stamps, scope, scope.game);
              }
            )();
          }
        )(scope.game.models);
      };
      var moves = [
        ['moveFront', 'up', 'moveFront'],
        ['moveBack', 'down', 'moveBack'],
        ['rotateLeft', 'left', 'rotateLeft'],
        ['rotateRight', 'right', 'rotateRight'],
        ['shiftUp', 'ctrl+up', 'shiftDown'],
        ['shiftDown', 'ctrl+down', 'shiftUp'],
        ['shiftLeft', 'ctrl+left', 'shiftRight'],
        ['shiftRight', 'ctrl+right', 'shiftLeft'],
      ];
      R.forEach(function(move) {
        charge_actions[move[0]] = buildChargeMove(move[0], move[2], false,
                                                 move[0]);
        charge_actions[move[0]+'Small'] = buildChargeMove(move[0], move[2], true,
                                                         move[0]+'Small');
      }, moves);
      function buildChargeMove(move, flip_move, small) {
        return function modelDoChargeMove(scope) {
          var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
          var _move = ( R.path(['ui_state','flip_map'], scope) ?
                        flip_move :
                        move
                      );
          return R.pipeP(
            gameModelsService.findStamp$(stamps[0]),
            function(model) {
              return modelService.chargeTarget(model)
                .catch(R.always(null));
            },
            function(target_stamp) {
              return ( R.exists(target_stamp) ?
                       gameModelsService.findStamp(target_stamp, scope.game.models) :
                       null
                     );
            },
            function(target_model) {
              return gameService.executeCommand('onModels', _move+'Charge',
                                                scope.factions, target_model, small,
                                                stamps, scope, scope.game);
            }
          )(scope.game.models);
        };
      }

      var charge_default_bindings = {
        'endCharge': 'c',
        'setTargetModel': 'shift+clickModel',
      };
      var charge_bindings = R.extend(Object.create(modelBaseModeService.bindings),
                                     charge_default_bindings);
      var charge_buttons = modelsModeService.buildButtons({ single: true,
                                                            end_charge: true });
      var charge_mode = {
        onEnter: function modelOnEnter(/*scope*/) {
        },
        onLeave: function modelOnLeave(/*scope*/) {
        },
        name: 'ModelCharge',
        actions: charge_actions,
        buttons: charge_buttons,
        bindings: charge_bindings,
      };
      modesService.registerMode(charge_mode);
      settingsService.register('Bindings',
                               charge_mode.name,
                               charge_default_bindings,
                               function(bs) {
                                 R.extend(charge_mode.bindings, bs);
                               });
      return charge_mode;
    }
  ]);
