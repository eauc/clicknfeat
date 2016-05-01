(function() {
  angular.module('clickApp.services')
    .factory('modes', modesModelFactory)
    .factory('allModes', [
      'defaultMode',
      'rulerMode',
      // 'losMode',
      'createModelMode',
      'modelsMode',
      'modelMode',
      'modelChargeMode',
      'modelPlaceMode',
      'createTemplateMode',
      'aoeTemplateMode',
      'sprayTemplateMode',
      'wallTemplateMode',
      'createTerrainMode',
      'terrainMode',
      () => ({})
    ]);

  modesModelFactory.$inject = [
    'appState',
  ];
  function modesModelFactory(appStateService) {
    const MODES_REG = {};
    const modesModel = {
      registerMode: registerMode,
      init: modesInit,
      exit: modesExit,
      currentModeName: currentModeName,
      currentModeActions: currentModeActions,
      currentModeBindings: currentModeBindings,
      currentModeButtons: currentModeButtons,
      currentModeBindingsPairs: currentModeBindingsPairs,
      currentModeActionP: currentModeActionP,
      switchToMode: switchToMode
    };
    const enterMode$ = R.curry(enterMode);
    R.curryService(modesModel);
    return modesModel;

    function registerMode(mode) {
      console.log('modes: registering '+mode.name, mode);
      MODES_REG[mode.name] = mode;
    }
    function modesInit() {
      const modes = {
        register: MODES_REG
      };
      // TODO : import customized bindings
      Mousetrap.reset();
      return enterMode('Default', modes);
    }
    function modesExit(modes) {
      return cleanupCurrentModeBindings(modes);
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
      return R.thread(modes)(
        currentMode,
        R.path(['actions', action]),
        R.ifElse(
          R.exists,
          (handler) => handler.apply(null, args),
          () => R.rejectP(`Unknown action "${action}" in "${mode_name}" mode`)
        )
      );
    }
    function switchToMode(name, modes) {
      const previous_mode = currentMode(modes);
      return R.thread(modes)(
        R.path(['register', name]),
        R.ifElse(
          R.isNil,
          () => {
            appStateService
              .emit('Game.error', `Mode ${name} does not exist`);
            return modes;
          },
          () => R.thread(modes)(
            leaveMode,
            enterMode$(name),
            R.spy(`Modes: switch mode from ${previous_mode.name} to ${name}`)
          )
        )
      );
    }
    function currentMode(modes = {}) {
      return R.pathOr({}, [
        'register',
        R.propOr('##', 'current', modes)
      ], modes);
    }
    function enterMode(name, modes) {
      return R.thread(modes)(
        R.path(['register', name]),
        R.when(
          (next_mode) => R.exists(next_mode.onEnter),
          (next_mode) => next_mode.onEnter()
        ),
        () => R.assoc('current', name, modes),
        setupCurrentModeBindings
      );
    }
    function leaveMode(modes) {
      return R.thread(modes)(
        currentMode,
        R.when(
          (mode) => R.exists(mode.onLeave),
          (mode) => mode.onLeave()
        ),
        () => cleanupCurrentModeBindings(modes),
        R.assoc('current', null)
      );
    }
    function cleanupCurrentModeBindings(modes) {
      Mousetrap.reset();
      return modes;
    }
    function setupCurrentModeBindings(modes) {
      setupBindings(currentMode(modes));
      return modes;
    }
    function setupBindings(mode) {
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

          appStateService.reduce('Modes.current.action', name, [event]);
          return false;
        };
      }
    }
  }
})();
