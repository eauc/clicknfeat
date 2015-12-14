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
      ruler_actions.dragStartMap = function rulerDragStartMap(scope, drag) {
        scope.game.ruler = gameRulerService.setLocal(drag.start, drag.now,
                                                     scope, scope.game.ruler);
      };
      ruler_actions.dragMap = function rulerDragMap(scope, drag) {
        scope.game.ruler = gameRulerService.setLocal(drag.start, drag.now,
                                                     scope, scope.game.ruler);
      };
      ruler_actions.dragEndMap = function rulerDragEndMap(scope, drag) {
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
          () => {
            return gameService
              .executeCommand('setRuler',
                              'setOrigin', event['click#'].target,
                              scope,  scope.game);
          },
          (result) => {
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
      ruler_actions.setMaxLength = function rulerSetMaxLength(scope) {
        return R.pipeP(
          () => {
            return promptService.prompt('prompt', 'Set ruler max length :',
                                        gameRulerService.maxLength(scope.game.ruler))
              .catch(R.always(null));
          },
          (value) => {
            value = (value === 0) ? null : value;
            return R.pipeP(
              () => {
                return gameService
                  .executeCommand('setRuler',
                                  'setMaxLength', value,
                                  scope,  scope.game);
              },
              (result) => {
                var origin = gameRulerService.origin(scope.game.ruler);
                if(R.isNil(origin)) return result;

                return gameService
                  .executeCommand('onModels',
                                  'setRulerMaxLength', value,
                                  [origin], scope, scope.game);
              }
            )();
          },
          (result) => {
            updateMaxLengthButton(scope);
            return result;
          }
        )();
      };
      ruler_actions.createAoEOnTarget = function rulerCreateAoEOnTarget(scope) {
        return R.pipeP(
          () => {
            return gameRulerService.targetAoEPosition(scope.game.models,
                                                      scope.game.ruler);
          },
          (position) => {
            position.type = 'aoe';
            return gameService.executeCommand('createTemplate', [position],
                                              scope, scope.game);
          }
        )();
      };
      var ruler_default_bindings = {
        exitRulerMode: 'shift+r',
        setMaxLength: 'shift+m',
        setOriginModel: 'ctrl+clickModel',
        setTargetModel: 'shift+clickModel',
        createAoEOnTarget: 'a',
      };
      var ruler_bindings = R.extend(Object.create(commonModeService.bindings),
                                    ruler_default_bindings);
      var ruler_buttons = [
        [ 'Set Max Len.', 'setMaxLength' ],
        [ 'AoE on Target', 'createAoEOnTarget' ],
      ];
      var ruler_mode = {
        onEnter: function rulerOnEnter(scope) {
          return R.pipePromise(
            () => {
              return gameModelSelectionService
                .get('local', scope.game.model_selection);
            },
            (stamps) => {
              if(R.length(stamps) !== 1) return null;

              return gameModelsService
                .findStamp(stamps[0], scope.game.models)
                .catch(R.always(null));
            },
            (model) => {
              if(R.isNil(model)) return null;
              
              return gameService
                .executeCommand('setRuler',
                                'setOriginResetTarget', model,
                                scope, scope.game)
                .catch(R.always(null));
            },
            () => {
              updateMaxLengthButton(scope);
            }
          )();
        },
        onLeave: function rulerOnLeave(/*scope*/) {
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
                               (bs) => {
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
