(function() {
  angular.module('clickApp.services')
    .factory('modes', modesModelFactory)
    .factory('allModes', [
      'defaultMode',
      // 'rulerMode',
      // 'losMode',
      // 'createModelMode',
      // 'modelsMode',
      // 'modelMode',
      // 'modelChargeMode',
      // 'modelPlaceMode',
      'createTemplateMode',
      'aoeTemplateMode',
      'sprayTemplateMode',
      'wallTemplateMode',
      'createTerrainMode',
      'terrainMode',
      () => ({})
    ]);

  modesModelFactory.$inject = [];
  function modesModelFactory() {
    const MODES_REG = {};
    const modesModel = {
      registerMode: registerMode,
      initP: modesInitP,
      exit: modesExit,
      currentModeName: currentModeName,
      currentModeActions: currentModeActions,
      currentModeBindings: currentModeBindings,
      currentModeButtons: currentModeButtons,
      currentModeBindingsPairs: currentModeBindingsPairs,
      currentModeActionP: currentModeActionP,
      switchToModeP: switchToModeP
    };

    const enterModeP$ = R.curry(enterModeP);
    const leaveModeP$ = R.curry(leaveModeP);
    const cleanupCurrentModeBindings$ = R.curry(cleanupCurrentModeBindings);
    const setupCurrentModeBindings$ = R.curry(setupCurrentModeBindings);

    R.curryService(modesModel);
    return modesModel;

    function registerMode(mode) {
      console.log('modes: registering '+mode.name, mode);
      MODES_REG[mode.name] = mode;
    }
    function modesInitP(state) {
      const modes = {
        register: MODES_REG
      };
      // TODO : import customized bindings
      Mousetrap.reset();
      return enterModeP$('Default', state, modes);
    }
    function modesExit(state, modes) {
      return cleanupCurrentModeBindings$(state, modes);
    }
    function currentModeName(modes) {
      return R.propOr('Unknown', 'name', currentMode(modes));
    }
    function currentModeActions(modes) {
      return R.propOr({}, 'actions', currentMode(modes));
    }
    function currentModeBindings(modes) {
      return R.propOr({}, 'bindings', currentMode(modes));
    }
    function currentModeButtons(modes) {
      return R.propOr({}, 'buttons', currentMode(modes));
    }
    function currentModeBindingsPairs(modes) {
      return R.thread(modes)(
        modesModel.currentModeBindings,
        R.toPairsIn,
        R.sortBy(R.head)
      );
    }
    function currentModeActionP(action, args, modes) {
      const mode_name = modesModel.currentModeName(modes);
      return R.threadP(modes)(
        currentMode,
        R.path(['actions', action]),
        R.rejectIf(R.isNil, `Unknown action "${action}" in "${mode_name}" mode`),
        (handler) => {
          return handler.apply(null, args);
        }
      );
    }
    function switchToModeP(name, state, modes) {
      const previous_mode = currentMode(modes);
      return R.threadP(modes)(
        R.path(['register', name]),
        R.rejectIf(R.isNil, `Mode ${name} does not exists`),
        R.always(modes),
        leaveModeP$(state),
        enterModeP$(name, state),
        R.spy(`Modes: switch mode from ${previous_mode.name} to ${name}`)
      );
    }
    function currentMode(modes = {}) {
      return R.pathOr({}, [
        'register',
        R.propOr('##', 'current', modes)
      ], modes);
    }
    function enterModeP(name, state, modes) {
      return R.threadP(modes)(
        R.path(['register', name]),
        (next_mode) => {
          return ( R.exists(next_mode.onEnter)
                   ? next_mode.onEnter(state)
                   : null
                 );
        },
        R.always(modes),
        R.assoc('current', name),
        setupCurrentModeBindings$(state)
      );
    }
    function leaveModeP(state, modes) {
      return R.threadP(modes)(
        currentMode,
        (mode) => {
          return ( R.exists(mode.onLeave)
                   ? mode.onLeave(state)
                   : null
                 );
        },
        R.always(modes),
        cleanupCurrentModeBindings$(state),
        R.assoc('current', null)
      );
    }
    function cleanupCurrentModeBindings(state, modes) {
      Mousetrap.reset();
      return modes;
    }
    function setupCurrentModeBindings(state, modes) {
      setupBindings(currentMode(modes), state);
      return modes;
    }
    function setupBindings(mode, state) {
      const own_bindings = R.keys(mode.bindings);
      const all_bindings = R.keysIn(mode.bindings);
      const inherited_bindings = R.difference(all_bindings,
                                              own_bindings);
      R.forEach(bindAction, inherited_bindings);
      R.forEach(bindAction, own_bindings);

      function bindAction(action) {
        Mousetrap.bind(mode.bindings[action],
                       actionBinding(action)
                      );
      }
      function actionBinding(name) {
        return (event, keys) => {
          console.warn('binding', name, keys, event);

          state.queueEventP('Modes.current.action', name, [event]);
        };
      }
    }
  }
})();
