angular.module('clickApp.services')
  .factory('losMode', [
    'modes',
    'settings',
    'commonMode',
    'game',
    'gameLos',
    'gameModels',
    'gameModelSelection',
    function losModeServiceFactory(modesService,
                                   settingsService,
                                   commonModeService,
                                   gameService,
                                   gameLosService,
                                   gameModelsService,
                                   gameModelSelectionService) {
      let los_actions = Object.create(commonModeService.actions);
      los_actions.exitLosMode = commonModeService.actions.modeBackToDefault;
      los_actions.dragStartMap = (state, drag) => {
        return state.event('Game.update', R.lensProp('los'),
                           gameLosService.setLocal$(drag.start, drag.now, state));
      };
      los_actions.dragMap = (state, drag) => {
        return state.event('Game.update', R.lensProp('los'),
                           gameLosService.setLocal$(drag.start, drag.now, state));
      };
      los_actions.dragEndMap = (state, drag) => {
        return state.event('Game.command.execute',
                           'setLos', ['setRemote', [drag.start, drag.now]]);
      };
      los_actions.dragStartTemplate = los_actions.dragStartMap;
      los_actions.dragTemplate = los_actions.dragMap;
      los_actions.dragEndTemplate = los_actions.dragEndMap;
      los_actions.dragStartModel = los_actions.dragStartMap;
      los_actions.dragModel = los_actions.dragMap;
      los_actions.dragEndModel = los_actions.dragEndMap;
      los_actions.setOriginModel = (state, event) => {
        return state.event('Game.command.execute',
                           'setLos', ['setOrigin', [event['click#'].target]]);
      };
      los_actions.setTargetModel = (state, event) => {
        return state.event('Game.command.execute',
                           'setLos', ['setTarget', [event['click#'].target]]);
      };
      los_actions.toggleIgnoreModel = (state, event) => {
        return state.event('Game.command.execute',
                           'setLos', ['toggleIgnoreModel', [event['click#'].target]]);
      };
      let los_default_bindings = {
        exitLosMode: 'ctrl+l',
        toggleIgnoreModel: 'clickModel',
        setOriginModel: 'ctrl+clickModel',
        setTargetModel: 'shift+clickModel'
      };
      let los_bindings = R.extend(Object.create(commonModeService.bindings),
                                  los_default_bindings);
      let los_buttons = [];
      let los_mode = {
        onEnter: (state) => {
          return R.pipePromise(
            R.path(['game','model_selection']),
            gameModelSelectionService.get$('local'),
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
                       'setLos', ['setOriginResetTarget', [model]]);
            }
          )(state);
        },
        onLeave: (state) => {
          state.changeEvent('Game.los.remote.change');
        },
        name: 'LoS',
        actions: los_actions,
        buttons: los_buttons,
        bindings: los_bindings
      };
      modesService.registerMode(los_mode);
      settingsService.register('Bindings',
                               los_mode.name,
                               los_default_bindings,
                               (bs) => {
                                 R.extend(los_mode.bindings, bs);
                               });
      return los_mode;
    }
  ]);
