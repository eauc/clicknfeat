'use strict';

angular.module('clickApp.services').factory('modes', [function modesServiceFactory() {
  var MODES_REG = {};
  var modesService = {
    registerMode: function registerMode(mode) {
      console.log('modes: registering ' + mode.name, mode);
      MODES_REG[mode.name] = mode;
    },
    init: function modesInit(state) {
      var modes = {
        register: MODES_REG
      };
      // TODO : import customized bindings
      Mousetrap.reset();
      return enterMode$('Default', state, modes);
    },
    exit: function modesExit(state, modes) {
      return cleanupCurrentModeBindings$(state, modes);
    },
    currentModeName: function currentModeName(modes) {
      return R.propOr('Unknown', 'name', currentMode(modes));
    },
    currentModeActions: function currentModeActions(modes) {
      return R.propOr({}, 'actions', currentMode(modes));
    },
    currentModeBindings: function currentModeBindings(modes) {
      return R.propOr({}, 'bindings', currentMode(modes));
    },
    currentModeButtons: function currentModeButtons(modes) {
      return R.propOr({}, 'buttons', currentMode(modes));
    },
    currentModeBindingsPairs: function currentModeBindingsPairs(modes) {
      return R.pipe(modesService.currentModeBindings, R.toPairsIn, R.sortBy(R.head))(modes);
    },
    currentModeAction: function currentModeAction(action, args, modes) {
      var mode_name = modesService.currentModeName(modes);
      return R.pipePromise(currentMode, R.path(['actions', action]), R.rejectIf(R.isNil, 'Unknown action "' + action + '" in "' + mode_name + '" mode'), function (handler) {
        return handler.apply(null, args);
      })(modes);
    },
    switchToMode: function switchToMode(name, state, modes) {
      var previous_mode = currentMode(modes);
      return R.pipePromise(R.path(['register', name]), R.rejectIf(R.isNil, 'Mode ' + name + ' does not exists'), R.always(modes), leaveMode$(state), enterMode$(name, state), R.spy('Modes: switch mode from ' + previous_mode.name + ' to ' + name))(modes);
    }
  };

  function currentMode() {
    var modes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    return R.pathOr({}, ['register', R.propOr('##', 'current', modes)], modes);
  }
  var enterMode$ = R.curry(function (name, state, modes) {
    return R.pipePromise(R.path(['register', name]), function (next_mode) {
      return R.exists(next_mode.onEnter) ? next_mode.onEnter(state) : null;
    }, R.always(modes), R.assoc('current', name), setupCurrentModeBindings$(state))(modes);
  });
  var leaveMode$ = R.curry(function (state, modes) {
    return R.pipePromise(currentMode, function (mode) {
      return R.exists(mode.onLeave) ? mode.onLeave(state) : null;
    }, R.always(modes), cleanupCurrentModeBindings$(state), R.assoc('current', null))(modes);
  });
  var cleanupCurrentModeBindings$ = R.curry(function (state, modes) {
    Mousetrap.reset();
    return modes;
  });
  var setupCurrentModeBindings$ = R.curry(function (state, modes) {
    setupBindings(currentMode(modes), state);
    return modes;
  });
  function setupBindings(mode, state) {
    var own_bindings = R.keys(mode.bindings);
    var all_bindings = R.keysIn(mode.bindings);
    var inherited_bindings = R.difference(all_bindings, own_bindings);
    R.forEach(function (action) {
      Mousetrap.bind(mode.bindings[action], actionBinding(action, state));
    }, inherited_bindings);
    R.forEach(function (action) {
      Mousetrap.bind(mode.bindings[action], actionBinding(action, state));
    }, own_bindings);
  }
  function actionBinding(name, state) {
    return function (event, keys) {
      console.warn('binding', name, keys, event);

      state.event('Modes.current.action', name, [event]);
    };
  }
  R.curryService(modesService);
  return modesService;
}]).factory('allModes', ['defaultMode', 'rulerMode', 'losMode', 'createModelMode', 'modelsMode', 'modelMode', 'modelChargeMode', 'modelPlaceMode', 'createTemplateMode', 'aoeTemplateMode', 'sprayTemplateMode', 'wallTemplateMode', 'createTerrainMode', 'terrainMode', function () {
  return {};
}]);
//# sourceMappingURL=modes.js.map
