'use strict';

(function () {
  angular.module('clickApp.services').factory('modes', modesModelFactory).factory('allModes', ['defaultMode',
  // 'rulerMode',
  // 'losMode',
  // 'createModelMode',
  // 'modelsMode',
  // 'modelMode',
  // 'modelChargeMode',
  // 'modelPlaceMode',
  // 'createTemplateMode',
  // 'aoeTemplateMode',
  // 'sprayTemplateMode',
  // 'wallTemplateMode',
  // 'createTerrainMode',
  // 'terrainMode',
  function () {
    return {};
  }]);

  modesModelFactory.$inject = [];
  function modesModelFactory() {
    var MODES_REG = {};
    var modesModel = {
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

    var enterModeP$ = R.curry(enterModeP);
    var leaveModeP$ = R.curry(leaveModeP);
    var cleanupCurrentModeBindings$ = R.curry(cleanupCurrentModeBindings);
    var setupCurrentModeBindings$ = R.curry(setupCurrentModeBindings);

    R.curryService(modesModel);
    return modesModel;

    function registerMode(mode) {
      console.log('modes: registering ' + mode.name, mode);
      MODES_REG[mode.name] = mode;
    }
    function modesInitP(state) {
      var modes = {
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
      return R.thread(modes)(modesModel.currentModeBindings, R.toPairsIn, R.sortBy(R.head));
    }
    function currentModeActionP(action, args, modes) {
      var mode_name = modesModel.currentModeName(modes);
      return R.threadP(modes)(currentMode, R.path(['actions', action]), R.rejectIf(R.isNil, 'Unknown action "' + action + '" in "' + mode_name + '" mode'), function (handler) {
        return handler.apply(null, args);
      });
    }
    function switchToModeP(name, state, modes) {
      var previous_mode = currentMode(modes);
      return R.threadP(modes)(R.path(['register', name]), R.rejectIf(R.isNil, 'Mode ' + name + ' does not exists'), R.always(modes), leaveModeP$(state), enterModeP$(name, state), R.spy('Modes: switch mode from ' + previous_mode.name + ' to ' + name));
    }
    function currentMode() {
      var modes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return R.pathOr({}, ['register', R.propOr('##', 'current', modes)], modes);
    }
    function enterModeP(name, state, modes) {
      return R.threadP(modes)(R.path(['register', name]), function (next_mode) {
        return R.exists(next_mode.onEnter) ? next_mode.onEnter(state) : null;
      }, R.always(modes), R.assoc('current', name), setupCurrentModeBindings$(state));
    }
    function leaveModeP(state, modes) {
      return R.threadP(modes)(currentMode, function (mode) {
        return R.exists(mode.onLeave) ? mode.onLeave(state) : null;
      }, R.always(modes), cleanupCurrentModeBindings$(state), R.assoc('current', null));
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
      var own_bindings = R.keys(mode.bindings);
      var all_bindings = R.keysIn(mode.bindings);
      var inherited_bindings = R.difference(all_bindings, own_bindings);
      R.forEach(bindAction, inherited_bindings);
      R.forEach(bindAction, own_bindings);

      function bindAction(action) {
        Mousetrap.bind(mode.bindings[action], actionBinding(action));
      }
      function actionBinding(name) {
        return function (event, keys) {
          console.warn('binding', name, keys, event);

          state.event('Modes.current.action', name, [event]);
        };
      }
    }
  }
})();
//# sourceMappingURL=modes.js.map
