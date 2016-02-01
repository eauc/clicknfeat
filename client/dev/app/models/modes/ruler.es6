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
      let ruler_actions = Object.create(commonModeService.actions);
      ruler_actions.exitRulerMode = commonModeService.actions.modeBackToDefault;
      ruler_actions.dragStartMap = (state, drag) => {
        return state.event('Game.update', R.lensProp('ruler'),
                           gameRulerService.setLocal$(drag.start, drag.now, state));
      };
      ruler_actions.dragMap = (state, drag) => {
        return state.event('Game.update', R.lensProp('ruler'),
                           gameRulerService.setLocal$(drag.start, drag.now, state));
      };
      ruler_actions.dragEndMap = (state, drag) => {
        return state.event('Game.command.execute',
                           'setRuler', [ 'setRemote', [drag.start, drag.now]]);
      };
      ruler_actions.dragStartTemplate = ruler_actions.dragStartMap;
      ruler_actions.dragTemplate = ruler_actions.dragMap;
      ruler_actions.dragEndTemplate = ruler_actions.dragEndMap;
      ruler_actions.dragStartModel = ruler_actions.dragStartMap;
      ruler_actions.dragModel = ruler_actions.dragMap;
      ruler_actions.dragEndModel = ruler_actions.dragEndMap;
      ruler_actions.setOriginModel = (state, event) => {
        return R.pipePromise(
          () => {
            return state.event('Game.command.execute',
                               'setRuler', ['setOrigin', [event['click#'].target]]);
          },
          (result) => {
            updateMaxLengthButton(state);
            return result;
          }
        )();
      };
      ruler_actions.setTargetModel = (state, event) => {
        return state.event('Game.command.execute',
                           'setRuler', ['setTarget', [event['click#'].target]]);
      };
      ruler_actions.setMaxLength = (state) => {
        return R.pipeP(
          () => {
            return promptService
              .prompt('prompt', 'Set ruler max length :',
                      gameRulerService.maxLength(state.game.ruler))
              .catch(R.always(null));
          },
          (value) => {
            value = (value === 0) ? null : value;
            return R.pipePromise(
              () => {
                return state.event('Game.command.execute',
                                   'setRuler', ['setMaxLength', [value]]);
              },
              (result) => {
                let origin = gameRulerService.origin(state.game.ruler);
                if(R.isNil(origin)) return result;

                return state.event('Game.command.execute',
                                   'onModels', ['setRulerMaxLength', [value], [origin]]);
              }
            )();
          },
          (result) => {
            updateMaxLengthButton(state);
            return result;
          }
        )();
      };
      ruler_actions.createAoEOnTarget = (state) => {
        return R.pipeP(
          () => {
            return gameRulerService
              .targetAoEPosition(state.game.models, state.game.ruler);
          },
          (position) => {
            position.type = 'aoe';
            let create = {
              base: { x: 0, y: 0, r: 0 },
              templates: [ position ]
            };
            return state.event('Game.command.execute',
                               'createTemplate', [create, false]);
          }
        )();
      };
      let ruler_default_bindings = {
        exitRulerMode: 'ctrl+r',
        setMaxLength: 'shift+r',
        setOriginModel: 'ctrl+clickModel',
        setTargetModel: 'shift+clickModel',
        createAoEOnTarget: 'ctrl+a'
      };
      let ruler_bindings = R.extend(Object.create(commonModeService.bindings),
                                    ruler_default_bindings);
      let ruler_buttons = [
        [ 'Set Max Len.', 'setMaxLength' ],
        [ 'AoE on Target', 'createAoEOnTarget' ],
      ];
      let ruler_mode = {
        onEnter: (state) => {
          return R.pipePromise(
            () => {
              return gameModelSelectionService
                .get('local', state.game.model_selection);
            },
            (stamps) => {
              if(R.length(stamps) !== 1) return null;

              return gameModelsService
                .findStamp(stamps[0], state.game.models)
                .catch(R.always(null));
            },
            (model) => {
              if(R.isNil(model)) return null;
              
              return state
                .event('Game.command.execute',
                       'setRuler', ['setOriginResetTarget', [model]]);
            },
            () => {
              updateMaxLengthButton(state);
            }
          )();
        },
        onLeave: (state) => {
          state.changeEvent('Game.ruler.remote.change');
        },
        name: 'Ruler',
        actions: ruler_actions,
        buttons: ruler_buttons,
        bindings: ruler_bindings
      };
      modesService.registerMode(ruler_mode);
      settingsService.register('Bindings',
                               ruler_mode.name,
                               ruler_default_bindings,
                               (bs) => {
                                 R.extend(ruler_mode.bindings, bs);
                               });

      function updateMaxLengthButton(state) {
        let max = gameRulerService.maxLength(state.game.ruler);
        ruler_mode.buttons[0][0] = 'Set Max Len. ('+max+')';
        state.changeEvent('Modes.buttons.update');
      }

      return ruler_mode;
    }
  ]);
