'use strict';

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
      var model_actions = Object.create(modelBaseModeService.actions);
      model_actions.endPlace = function modelEndPlace(scope) {
        var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
        return R.pipeP(
          function() {
            return gameService.executeCommand('onModels', 'endPlace',
                                              stamps, scope, scope.game);
          },
          function() {
            return scope.doSwitchToMode('Model');
          }
        )();
      };
      model_actions.setTargetModel = function modelSetTargetModel(scope, event) {
        var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          function(model) {
            if(model.state.stamp === event['click#'].target.state.stamp) return;
            
            return gameService.executeCommand('onModels', 'setPlaceTarget',
                                              scope.factions, event['click#'].target,
                                              stamps, scope, scope.game);
          }
        )(scope.game.models);
      };
      model_actions.setOriginModel = function modelSetOriginModel(scope, event) {
        var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
        return R.pipeP(
          gameModelsService.findStamp$(stamps[0]),
          function(model) {
            if(model.state.stamp === event['click#'].target.state.stamp) return;
            
            return gameService.executeCommand('onModels', 'setPlaceOrigin',
                                              scope.factions, event['click#'].target,
                                              stamps, scope, scope.game);
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
        model_actions[move[0]] = buildPlaceMove(move[0], move[2], false,
                                                move[0]);
        model_actions[move[0]+'Small'] = buildPlaceMove(move[0], move[2], true,
                                                        move[0]+'Small');
      }, moves);
      function buildPlaceMove(move, flip_move, small, fwd) {
        return function modelDoPlaceMove(scope) {
          var stamps = gameModelSelectionService.get('local', scope.game.model_selection);
          var _move = ( R.path(['ui_state','flip_map'], scope) ?
                        flip_move :
                        move
                      );

          return gameService.executeCommand('onModels', _move+'Place',
                                            scope.factions, small,
                                            stamps, scope, scope.game);
        };
      }

      var model_default_bindings = {
        'endPlace': 'p',
        'setTargetModel': 'shift+clickModel',
        'setOriginModel': 'ctrl+clickModel',
      };
      var model_bindings = R.extend(Object.create(modelBaseModeService.bindings),
                                    model_default_bindings);
      var model_buttons = modelsModeService.buildButtons({ single: true,
                                                           end_place: true });
      var model_mode = {
        onEnter: function modelOnEnter(scope) {
        },
        onLeave: function modelOnLeave(scope) {
        },
        name: 'ModelPlace',
        actions: model_actions,
        buttons: model_buttons,
        bindings: model_bindings,
      };
      modesService.registerMode(model_mode);
      settingsService.register('Bindings',
                               model_mode.name,
                               model_default_bindings,
                               function(bs) {
                                 R.extend(model_mode.bindings, bs);
                               });
      return model_mode;
    }
  ]);
