angular.module('clickApp.services')
  .factory('stateModes', [
    'modes',
    'allModes',
    function stateModesServiceFactory(modesService) {
      var stateModesService = {
        init: function stateModesInit(state) {
          state.modes = {};

          state.onEvent('Modes.switchTo',
                        stateModesService.onModesSwitchTo$(state));
          state.onEvent('Modes.current.action',
                        stateModesService.onModesCurrentAction$(state));
          state.onEvent('Modes.reset',
                        stateModesService.onModesReset$(state));
          state.onEvent('Modes.exit',
                        stateModesService.onModesExit$(state));
          return state;
        },
        save: function stateModesSave(state) {
          return state;
        },
        onModesSwitchTo: function stateModesOnSwitchTo(state, event, to) {
          return R.pipePromise(
            modesService.switchToMode$(to, state),
            setModes$(state)
          )(state.modes).catch(gameActionError$(state));
        },
        onModesCurrentAction: function stateModesOnCurrentAction(state, e, action, args) {
          let res = modesService
                .currentModeAction(action, [state, ...args], state.modes);
          let event = R.last(args);
          if(R.exists(R.prop('preventDefault', event))) event.preventDefault();

          return self.Promise.resolve(res)
            .catch(gameActionError$(state));
        },
        onModesReset: function stateModesOnReset(state, event) {
          event = event;
          return R.pipePromise(
            modesService.init,
            setModes$(state)
          )(state);
        },
        onModesExit: function stateModesOnExit(state, event) {
          event = event;
          return R.pipePromise(
            modesService.exit$(state),
            setModes$(state)
          )(state.modes);
        }
      };
      var setModes$ = R.curry((state, modes) => {
        state.modes = modes;
        state.changeEvent('Modes.change');
      });
      var gameActionError$ = R.curry((state, error) => {
        state.changeEvent('Game.action.error', error);
        return null;
        // return self.Promise.reject(error);
      });
      R.curryService(stateModesService);
      return stateModesService;
    }
  ]);
