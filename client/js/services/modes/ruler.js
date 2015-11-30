'use strict';

angular.module('clickApp.services')
  .factory('rulerMode', [
    'modes',
    'settings',
    'commonMode',
    'game',
    'gameRuler',
    'model',
    'gameModels',
    'gameModelSelection',
    'prompt',
    function rulerModeServiceFactory(modesService,
                                     settingsService,
                                     commonModeService,
                                     gameService,
                                     gameRulerService,
                                     modelService,
                                     gameModelsService,
                                     gameModelSelectionService,
                                     promptService) {
      var ruler_actions = Object.create(commonModeService.actions);
      ruler_actions.exitRulerMode = commonModeService.actions.modeBackToDefault;
      ruler_actions.dragStartMap = function rulerDragStartMap(scope, drag, event) {
        scope.game.ruler = gameRulerService.setLocal(drag.start, drag.now,
                                                     scope, scope.game.ruler);
      };
      ruler_actions.dragMap = function rulerDragMap(scope, drag, event) {
        scope.game.ruler = gameRulerService.setLocal(drag.start, drag.now,
                                                     scope, scope.game.ruler);
      };
      ruler_actions.dragEndMap = function rulerDragEndMap(scope, drag, event) {
        return gameService
          .executeCommand('setRuler',
                          'setRemote', drag.start, drag.now,
                          scope,  scope.game);
      };
      ruler_actions.dragStartTemplate = ruler_actions.dragStartMap;
      ruler_actions.dragTemplate = ruler_actions.dragMap;
      ruler_actions.dragEndTemplate = ruler_actions.dragEndMap;
      ruler_actions.dragStartModel = ruler_actions.dragStartMap;
      ruler_actions.dragModel = ruler_actions.dragMap;
      ruler_actions.dragEndModel = ruler_actions.dragEndMap;
      ruler_actions.setOriginModel = function rulerSetOriginModel(scope, event) {
        return R.pipeP(
          function() {
            return gameService
              .executeCommand('setRuler',
                              'setOrigin', event['click#'].target,
                              scope,  scope.game);
          },
          function(result) {
            updateMaxLengthButton(scope);
            return result;
          }
        )();
      };
      ruler_actions.setTargetModel = function rulerSetTargetModel(scope, event) {
        return gameService
          .executeCommand('setRuler',
                          'setTarget', event['click#'].target,
                          scope,  scope.game);
      };
      ruler_actions.setMaxLength = function rulerSetMaxLength(scope, event) {
        return R.pipeP(
          function() {
            return promptService.prompt('prompt', 'Set ruler max length :',
                                        gameRulerService.maxLength(scope.game.ruler))
              .catch(R.always(null));
          },
          function(value) {
            value = (value === 0) ? null : value;
            return R.pipeP(
              function() {
                return gameService
                  .executeCommand('setRuler',
                                  'setMaxLength', value,
                                  scope,  scope.game);
              },
              function(result) {
                var origin = gameRulerService.origin(scope.game.ruler);
                if(R.isNil(origin)) return result;

                return gameService
                  .executeCommand('onModels',
                                  'setRulerMaxLength', value,
                                  [origin], scope, scope.game);
              }
            )();
          },
          function(result) {
            updateMaxLengthButton(scope);
            return result;
          }
        )();
      };
      // ruler_actions.createAoEOnTarget = function rulerCreateAoEOnTarget(scope, event) {
      //   var position = gameRulerService.targetAoEPosition(scope.game.models,
      //                                                     scope.game.ruler);
      //   position.type = 'aoe';
      //   gameService.executeCommand('createTemplate', position,
      //                              scope, scope.game);
      // };
      var ruler_default_bindings = {
        exitRulerMode: 'shift+r',
        setMaxLength: 'shift+m',
        setOriginModel: 'ctrl+clickModel',
        setTargetModel: 'shift+clickModel',
        // createAoEOnTarget: 'a',
      };
      var ruler_bindings = R.extend(Object.create(commonModeService.bindings),
                                    ruler_default_bindings);
      var ruler_buttons = [
        [ 'Set Max Len.', 'setMaxLength' ],
        // [ 'AoE on Target', 'createAoEOnTarget' ],
      ];
      var ruler_mode = {
        onEnter: function rulerOnEnter(scope) {
          return R.pipeP(
            R.bind(self.Promise.resolve, self.Promise),
            function() {
              return gameModelSelectionService
                .get('local', scope.game.model_selection);
            },
            function(stamps) {
              if(R.length(stamps) !== 1) return;

              return gameModelsService
                .findStamp(stamps[0], scope.game.models)
                .catch(R.always(null));
            },
            function(model) {
              if(R.exists(model)) {
                return gameService
                  .executeCommand('setRuler',
                                  'setOriginResetTarget', model,
                                  scope, scope.game)
                  .catch(R.always(null));
              }
            },
            function() {
              updateMaxLengthButton(scope);
            }
          )();
        },
        onLeave: function rulerOnLeave(scope) {
        },
        name: 'Ruler',
        actions: ruler_actions,
        buttons: ruler_buttons,
        bindings: ruler_bindings,
      };
      modesService.registerMode(ruler_mode);
      settingsService.register('Bindings',
                               ruler_mode.name,
                               ruler_default_bindings,
                               function(bs) {
                                 R.extend(ruler_mode.bindings, bs);
                               });

      function updateMaxLengthButton(scope) {
        var max = gameRulerService.maxLength(scope.game.ruler);
        ruler_mode.buttons[0][0] = 'Set Max Len. ('+max+')';
        scope.$digest();
      }

      return ruler_mode;
    }
  ]);
