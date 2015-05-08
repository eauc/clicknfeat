self.modesServiceFactory = function modesServiceFactory() {
  var MODES_REG = {};
  var modesService = {
    registerMode: function registerMode(mode) {
      console.log('registering mode '+mode.name, mode);
      MODES_REG[mode.name] = mode;
    },
    init: function modesInit(scope) {
      var modes = {
        current: 'Default',
        register: R.clone(MODES_REG),
      };
      // TODO : import customized bindings
      enterMode(modes, scope);
      return modes;
    },
    currentModeName: function(modes) {
      return currentMode(modes).name;
    },
    currentModeBindings: function(modes) {
      return currentMode(modes).bindings;
    },
    currentModeBindingsPairs: function(modes) {
      return R.pipe(
        R.toPairsIn,
        R.sortBy(R.head)
      )(currentMode(modes).bindings);
    },
    currentModeAction: function(modes, action, scope) {
      var mode = currentMode(modes);
      if(R.isNil(mode.actions[action])) {
        console.log('unknown mode '+mode.name+' action '+action);
        return;
      }
      mode.actions[action](scope);
    },
    switchToMode: function(modes, name, scope) {
      var next = modes.register[name];
      if(R.isNil(next)) {
        console.log('error switching to mode '+name+' : does not exists');
        return;
      }
      leaveMode(modes, scope);
      modes.current = name;
      enterMode(modes, scope);
    }
  };

  function currentMode(modes) {
    return modes.register[modes.current];
  }
  function enterMode(modes, scope) {
    var mode = currentMode(modes);
    if(R.exists(mode.onEnter)) {
      mode.onEnter(scope);
    }
    setupCurrentModeBindings(modes, scope);
    setupCurrentModeButtons(modes, scope);
  }
  function leaveMode(modes, scope) {
    var mode = currentMode(modes);
    if(R.exists(mode.onLeave)) {
      mode.onLeave(scope);
    }
  }
  function setupCurrentModeButtons(modes, scope) {
    scope.action_buttons = currentMode(modes).buttons;
    scope.action_bindings = modesService.currentModeBindings(modes);
  }
  function setupCurrentModeBindings(modes, scope) {
    Mousetrap.reset();
    setupBindings(currentMode(modes), scope);
  }
  function setupBindings(mode, scope) {
    R.forEach(function(action) {
      Mousetrap.bind(mode.bindings[action],
                     actionBinding(mode.actions[action],
                                   scope));
    }, R.keysIn(mode.bindings));
  }
  function actionBinding(action, scope) {
    return function binding(event, keys) {
      console.log('binding', keys, event, action);
      action(scope);
      event.preventDefault();
    };
  }

  return modesService;
};
