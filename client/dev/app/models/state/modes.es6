(function() {
  angular.module('clickApp.services')
    .factory('stateModes', stateModesModelFactory);

  stateModesModelFactory.$inject = [
    'modes',
    'game',
    'allModes',
  ];
  function stateModesModelFactory(modesModel,
                                  gameModel) {
    const stateModesModel = {
      create: stateModesCreate,
      save: stateModesSave,
      onModesSwitchTo: stateModesOnSwitchTo,
      onModesCurrentAction: stateModesOnCurrentAction,
      onModesReset: stateModesOnReset,
      onModesExit: stateModesOnExit
    };

    const setModes$ = R.curry(setModes);

    R.curryService(stateModesModel);
    return stateModesModel;

    function stateModesCreate(state) {
      state.modes = {};

      state.onEvent('Modes.switchTo',
                    stateModesModel.onModesSwitchTo$(state));
      state.onEvent('Modes.current.action',
                    stateModesModel.onModesCurrentAction$(state));
      state.onEvent('Modes.reset',
                    stateModesModel.onModesReset$(state));
      state.onEvent('Modes.exit',
                    stateModesModel.onModesExit$(state));
      return state;
    }
    function stateModesSave(state) {
      return state;
    }
    function stateModesOnSwitchTo(state, _event_, to) {
      return R.threadP(state.modes)(
        modesModel.switchToModeP$(to, state),
        setModes$(state)
      ).catch(gameModel.actionError$(state));
    }
    function stateModesOnCurrentAction(state, _event_, action, args) {
      const res = modesModel
              .currentModeActionP(action, [state, ...args], state.modes);
      const event = R.last(args);
      if(R.exists(R.prop('preventDefault', event))) {
        event.preventDefault();
      }

      return self.Promise.resolve(res)
        .catch(gameModel.actionError$(state));
    }
    function stateModesOnReset(state, _event_) {
      return R.threadP(state)(
        modesModel.initP,
        setModes$(state)
      );
    }
    function stateModesOnExit(state, _event_) {
      return R.threadP(state.modes)(
        modesModel.exit$(state),
        setModes$(state)
      );
    }
    function setModes(state, modes) {
      state.modes = modes;
      state.queueChangeEventP('Modes.change');
    }
  }
})();
