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
  'createTemplateMode', 'aoeTemplateMode', 'sprayTemplateMode', 'wallTemplateMode', 'createTerrainMode', 'terrainMode', function () {
    return {};
  }]);

  modesModelFactory.$inject = ['appAction', 'appError'];
  function modesModelFactory(appActionService, appErrorService) {
    var MODES_REG = {};
    var modesModel = {
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
    var enterMode$ = R.curry(enterMode);
    R.curryService(modesModel);
    return modesModel;

    function registerMode(mode) {
      console.log('modes: registering ' + mode.name, mode);
      MODES_REG[mode.name] = mode;
    }
    function modesInit() {
      var modes = {
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
      return R.thread(modes)(modesModel.currentModeBindings, R.toPairsIn, R.sortBy(R.head));
    }
    function currentModeActionP(action, args, modes) {
      var mode_name = modesModel.currentModeName(modes);
      return R.thread(modes)(currentMode, R.path(['actions', action]), R.ifElse(R.exists, function (handler) {
        return handler.apply(null, args);
      }, function () {
        return R.rejectP('Unknown action "' + action + '" in "' + mode_name + '" mode');
      }));
    }
    function switchToMode(name, modes) {
      var previous_mode = currentMode(modes);
      return R.thread(modes)(R.path(['register', name]), R.ifElse(R.isNil, function () {
        appErrorService.emit('Mode ' + name + ' does not exist');
        return modes;
      }, function () {
        return R.thread(modes)(leaveMode, enterMode$(name), R.spy('Modes: switch mode from ' + previous_mode.name + ' to ' + name));
      }));
    }
    function currentMode() {
      var modes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return R.pathOr({}, ['register', R.propOr('##', 'current', modes)], modes);
    }
    function enterMode(name, modes) {
      return R.thread(modes)(R.path(['register', name]), R.when(function (next_mode) {
        return R.exists(next_mode.onEnter);
      }, function (next_mode) {
        return next_mode.onEnter();
      }), function () {
        return R.assoc('current', name, modes);
      }, setupCurrentModeBindings);
    }
    function leaveMode(modes) {
      return R.thread(modes)(currentMode, R.when(function (mode) {
        return R.exists(mode.onLeave);
      }, function (mode) {
        return mode.onLeave();
      }), function () {
        return cleanupCurrentModeBindings(modes);
      }, R.assoc('current', null));
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

          appActionService.do('Modes.current.action', name, [event]);
          return false;
        };
      }
    }
  }
})();
//# sourceMappingURL=modes.js.map
