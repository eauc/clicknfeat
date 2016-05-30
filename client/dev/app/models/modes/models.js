'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('modelsMode', modelsModeModelFactory);

  modelsModeModelFactory.$inject = ['$rootScope', 'appAction', 'appGame', 'appState', 'modes', 'settings', 'defaultMode', 'model', 'gameModels', 'gameModelSelection', 'prompt'];
  function modelsModeModelFactory($rootScope, appActionService, appGameService, appStateService, modesModel, settingsModel, defaultModeModel, modelModel, gameModelsModel, gameModelSelectionModel, promptService) {
    var FLIP_MAP_LENS = R.lensPath(['view', 'flip_map']);
    var MODELS_LENS = R.lensPath(['game', 'models']);
    var MODEL_SELECTION_LENS = R.lensPath(['game', 'model_selection']);
    var models_actions = Object.create(defaultModeModel.actions);
    models_actions.clickMap = modelsClearSelection;
    models_actions.rightClickMap = modelsClearSelection;
    models_actions.modeBackToDefault = modelsClearSelection;
    models_actions.deleteSelection = modelsDeleteSelection;
    models_actions.copySelection = modelsCopySelection;
    models_actions.toggleLock = modelsToggleLock;
    models_actions.toggleImageDisplay = modelsToggleImageDisplay;
    models_actions.setNextImage = modelsSetNextImage;
    models_actions.toggleWreckDisplay = modelsToggleWreckDisplay;
    models_actions.toggleUnitDisplay = modelsToggleUnitDisplay;
    models_actions.setUnit = modelsSetUnit;
    models_actions.toggleMeleeDisplay = modelsToggleMeleeDisplay;
    models_actions.toggleReachDisplay = modelsToggleReachDisplay;
    models_actions.toggleStrikeDisplay = modelsToggleStrikeDisplay;
    models_actions.toggleCounterDisplay = modelsToggleCounterDisplay;
    models_actions.incrementCounter = modelsIncrementCounter;
    models_actions.decrementCounter = modelsDecrementCounter;
    models_actions.toggleSoulsDisplay = modelsToggleSoulsDisplay;
    models_actions.incrementSouls = modelsIncrementSouls;
    models_actions.decrementSouls = modelsDecrementSouls;
    models_actions.setRulerMaxLength = modelsSetRulerMaxLength;
    models_actions.setChargeMaxLength = modelsSetChargeMaxLength;
    models_actions.setPlaceMaxLength = modelsSetPlaceMaxLength;
    models_actions.togglePlaceWithin = modelsTogglePlaceWithin;
    models_actions.toggleLeaderDisplay = modelsToggleLeaderDisplay;
    models_actions.toggleIncorporealDisplay = modelsToggleIncorporealDisplay;
    models_actions.setOrientationUp = modelsSetOrientationUp;
    models_actions.setOrientationDown = modelsSetOrientationDown;
    models_actions.setTargetModel = modelsSetTargetModel;
    models_actions.clearLabel = modelsClearLabel;
    var effects = [['Blind', 'b'], ['Corrosion', 'c'], ['Disrupt', 'd'], ['Fire', 'f'], ['Fleeing', 'e'], ['KD', 'k'], ['Stationary', 't']];
    R.forEach(modelsToggleEffect, effects);
    var auras = [['Red', '#F00'], ['Green', '#0F0'], ['Blue', '#00F'], ['Yellow', '#FF0'], ['Purple', '#F0F'], ['Cyan', '#0FF']];
    R.forEach(modelsToggleAura, auras);
    models_actions.toggleCtrlAreaDisplay = modelsToggleCtrlAreaDisplay;
    var areas = R.range(0, 10);
    R.forEach(modelsToggleAreaDisplay, areas);
    var moves = [['moveFront', 'up'], ['moveBack', 'down'], ['rotateLeft', 'left'], ['rotateRight', 'right']];
    R.forEach(modelsMove, moves);
    var shifts = [['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
    R.forEach(modelsShift, shifts);
    modelsDrag();

    var models_default_bindings = {
      'clickMap': 'clickMap',
      'rightClickMap': 'rightClickMap',
      'deleteSelection': 'del',
      'copySelection': 'ctrl+c',
      'toggleLock': 'l',
      'toggleImageDisplay': 'alt+i',
      'setNextImage': 'shift+i',
      'toggleWreckDisplay': 'alt+w',
      'setOrientationUp': 'pageup',
      'setOrientationDown': 'pagedown',
      'setTargetModel': 'shift+clickModel',
      'toggleCounterDisplay': 'alt+n',
      'incrementCounter': '+',
      'decrementCounter': '-',
      'toggleSoulsDisplay': 'alt+o',
      'incrementSouls': 'ctrl++',
      'decrementSouls': 'ctrl+-',
      'toggleCtrlAreaDisplay': 'alt+a',
      'setRulerMaxLength': 'shift+r',
      'setChargeMaxLength': 'shift+c',
      'setPlaceMaxLength': 'shift+p',
      'togglePlaceWithin': 'alt+p',
      'toggleMeleeDisplay': 'alt+m',
      'toggleReachDisplay': 'alt+r',
      'toggleStrikeDisplay': 'alt+s',
      'toggleUnitDisplay': 'alt+u',
      'setUnit': 'shift+u',
      'toggleLeaderDisplay': 'alt+l',
      'toggleIncorporealDisplay': 'alt+g',
      'clearLabel': 'ctrl+shift+l'
    };
    R.forEach(modelsBindMove, moves);
    R.forEach(modelsBindShift, shifts);
    R.forEach(modelsBindArea, areas);
    R.addIndex(R.forEach)(modelsBindAura, auras);
    R.forEach(modelsBindEffect, effects);
    var models_bindings = R.extend(Object.create(defaultModeModel.bindings), models_default_bindings);

    var models_buttons = buildModelsModesButtons();
    var models_mode = {
      onEnter: function onEnter() {},
      onLeave: function onLeave() {},
      name: 'Models',
      actions: models_actions,
      buttons: models_buttons,
      buildButtons: buildModelsModesButtons,
      bindings: models_bindings,
      areas: areas,
      auras: auras,
      effects: effects
    };
    modesModel.registerMode(models_mode);
    settingsModel.register('Bindings', models_mode.name, models_default_bindings, function (bs) {
      R.extend(models_mode.bindings, bs);
    });

    return models_mode;

    function modelsClearSelection(state) {
      return appStateService.onAction(state, ['Game.command.execute', 'setModelSelection', ['clear', null]]);
    }
    function modelsDeleteSelection(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return appStateService.onAction(state, ['Game.command.execute', 'deleteModel', [stamps]]);
    }
    function modelsCopySelection(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.copyStamps$(stamps), function (copy) {
        return appStateService.onAction(state, ['Game.model.copy', copy]);
      });
    }
    function modelsToggleLock(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.isLocked, function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'lockModels', [!present, stamps]]);
      })));
    }
    function modelsToggleImageDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), modelModel.isImageDisplayed, function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setImageDisplay', [!present], stamps]]);
      });
    }
    function modelsSetNextImage(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setNextImage', [], stamps]]);
    }
    function modelsToggleWreckDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), modelModel.isWreckDisplayed, function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setWreckDisplay', [!present], stamps]]);
      });
    }
    function modelsToggleUnitDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.isUnitDisplayed, function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setUnitDisplay', [!present], stamps]]);
      })));
    }
    function modelsSetUnit(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, function (model) {
        return R.threadP(model)(modelModel.unit, R.defaultTo(0), function (value) {
          return promptService.promptP('prompt', 'Set unit number :', value).catch(R.always(null));
        }, function (value) {
          return appActionService.do('Game.command.execute', 'onModels', ['setUnit', [value], stamps]);
        });
      }));
    }
    function modelsToggleMeleeDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.isMeleeDisplayed$('mm'), function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setMeleeDisplay', ['mm', !present], stamps]]);
      })));
    }
    function modelsToggleReachDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.isMeleeDisplayed$('mr'), function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setMeleeDisplay', ['mr', !present], stamps]]);
      })));
    }
    function modelsToggleStrikeDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.isMeleeDisplayed$('ms'), function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setMeleeDisplay', ['ms', !present], stamps]]);
      })));
    }
    function modelsToggleCounterDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), modelModel.isCounterDisplayed$('c'), function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setCounterDisplay', ['c', !present], stamps]]);
      });
    }
    function modelsIncrementCounter(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['incrementCounter', ['c'], stamps]]);
    }
    function modelsDecrementCounter(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['decrementCounter', ['c'], stamps]]);
    }
    function modelsToggleSoulsDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), modelModel.isCounterDisplayed$('s'), function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setCounterDisplay', ['s', !present], stamps]]);
      });
    }
    function modelsIncrementSouls(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['incrementCounter', ['s'], stamps]]);
    }
    function modelsDecrementSouls(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['decrementCounter', ['s'], stamps]]);
    }
    function modelsSetRulerMaxLength(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, function (model) {
        return R.threadP(model)(modelModel.rulerMaxLength, R.defaultTo(0), function (value) {
          return promptService.promptP('prompt', 'Set ruler max length :', value).catch(R.always(null));
        }, function (value) {
          return value === 0 ? null : value;
        }, function (value) {
          appActionService.do('Game.command.execute', 'onModels', ['setRulerMaxLength', [value], stamps]);
        });
      }));
    }
    function modelsSetChargeMaxLength(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.threadP(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, function (model) {
        return R.threadP(model)(modelModel.chargeMaxLength, R.defaultTo(0), function (value) {
          return promptService.promptP('prompt', 'Set charge max length :', value).catch(R.always(null));
        }, function (value) {
          return value === 0 ? null : value;
        }, function (value) {
          appActionService.do('Game.command.execute', 'onModels', ['setChargeMaxLength', [value], stamps]);
        });
      }));
    }
    function modelsSetPlaceMaxLength(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.threadP(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, function (model) {
        return R.threadP(model)(modelModel.placeMaxLength, R.defaultTo(0), function (value) {
          return promptService.promptP('prompt', 'Set place max length :', value).catch(R.always(null));
        }, function (value) {
          return value === 0 ? null : value;
        }, function (value) {
          appActionService.do('Game.command.execute', 'onModels', ['setPlaceMaxLengthP', [value], stamps]);
        });
      }));
    }
    function modelsTogglePlaceWithin(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.placeWithin, function (present) {
        appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setPlaceWithinP', [!present], stamps]]);
      })));
    }
    function modelsToggleLeaderDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.isLeaderDisplayed, function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setLeaderDisplay', [!present], stamps]]);
      })));
    }
    function modelsToggleIncorporealDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), modelModel.isIncorporealDisplayed, function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setIncorporealDisplay', [!present], stamps]]);
      });
    }
    function modelsToggleEffect(_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var effect = _ref2[0];
      var flag = _ref2[1];

      models_actions['toggle' + effect + 'EffectDisplay'] = modelsToggleEffect_;

      function modelsToggleEffect_(state) {
        var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
        return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.isEffectDisplayed$(flag), function (present) {
          return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setEffectDisplay', [flag, !present], stamps]]);
        })));
      }
    }
    function modelsToggleAura(_ref3) {
      var _ref4 = _slicedToArray(_ref3, 2);

      var aura = _ref4[0];
      var hex = _ref4[1];

      models_actions['toggle' + aura + 'AuraDisplay'] = modelsToggleAura_;

      function modelsToggleAura_(state) {
        var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
        return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.auraDisplay, function (present) {
          return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setAuraDisplay', [present === hex ? null : hex], stamps]]);
        })));
      }
    }
    function modelsToggleCtrlAreaDisplay(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.isCtrlAreaDisplayed, function (present) {
        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setCtrlAreaDisplay', [!present], stamps]]);
      })));
    }
    function modelsToggleAreaDisplay(area) {
      var size = area === 0 ? 10 : area;
      models_actions['toggle' + size + 'InchesAreaDisplay'] = modelsToggleAreaDisplay_(size);
      var big_size = size + 10;
      models_actions['toggle' + big_size + 'InchesAreaDisplay'] = modelsToggleAreaDisplay_(big_size);

      function modelsToggleAreaDisplay_(size) {
        return function modelsToggleSizeAreaDisplay(state) {
          var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
          return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(modelModel.areaDisplay, function (present) {
            return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setAreaDisplay', [present === size ? null : size], stamps]]);
          })));
        };
      }
    }
    function modelsMove(_ref5) {
      var _ref6 = _slicedToArray(_ref5, 2);

      var move = _ref6[0];
      var _key_ = _ref6[1];

      models_actions[move] = modelsMove_(false);
      models_actions[move + 'Small'] = modelsMove_(true);

      function modelsMove_(small) {
        return function modelsSmallMove(state) {
          var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
          return appStateService.onAction(state, ['Game.command.execute', 'onModels', [move + 'P', [small], stamps]]);
        };
      }
    }
    function modelsShift(_ref7) {
      var _ref8 = _slicedToArray(_ref7, 3);

      var shift = _ref8[0];
      var _key_ = _ref8[1];
      var flip_shift = _ref8[2];

      models_actions[shift] = modelsShift_(false);
      models_actions[shift + 'Small'] = modelsShift_(true);

      function modelsShift_(small) {
        return function modelsShiftSmall(state) {
          var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
          var model_shift = R.viewOr(false, FLIP_MAP_LENS, state) ? flip_shift : shift;
          return appStateService.onAction(state, ['Game.command.execute', 'onModels', [model_shift + 'P', [small], stamps]]);
        };
      }
    }
    function modelsSetOrientationUp(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      var orientation = R.viewOr(false, FLIP_MAP_LENS, state) ? 180 : 0;
      return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setOrientationP', [orientation], stamps]]);
    }
    function modelsSetOrientationDown(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      var orientation = R.viewOr(false, FLIP_MAP_LENS, state) ? 0 : 180;
      return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setOrientationP', [orientation], stamps]]);
    }
    function modelsSetTargetModel(state, event) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['orientToP', [event['click#'].target], stamps]]);
    }
    function modelsClearLabel(state) {
      var stamps = gameModelSelectionModel.get('local', R.view(MODEL_SELECTION_LENS, state));
      return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['clearLabel', [], stamps]]);
    }

    function modelsDrag() {
      var drag_charge_target = undefined;
      var drag_models_start_states = undefined;
      var drag_models_start_selection = undefined;

      models_actions.dragStartModel = modelsDragStart;
      defaultModeModel.actions.dragStartModel = modelsDragStart;
      models_actions.dragModel = modelsDragContinue;
      defaultModeModel.actions.dragModel = modelsDragContinue;
      models_actions.dragEndModel = modelsDragEnd;
      defaultModeModel.actions.dragEndModel = modelsDragEnd;

      function modelsDragStart(state, event) {
        var stamp = event.target.state.stamp;
        return R.thread(state.game)(resolveModelSelection, gameModelsModel.findAnyStamps$(R.__, state.game.models), R.reject(R.isNil), R.tap(initDragChargeTarget), R.tap(function (models) {
          drag_models_start_selection = models;
        }), R.map(modelModel.saveState), R.tap(function (states) {
          drag_models_start_states = states;
        }), function () {
          return modelsDragContinue(state, event);
        });

        function resolveModelSelection() {
          return R.thread(state)(R.view(MODEL_SELECTION_LENS), R.ifElse(gameModelSelectionModel.in$('local', stamp), gameModelSelectionModel.get$('local'), function () {
            appActionService.defer('Game.command.execute', 'setModelSelection', ['set', [stamp]]);
            return [stamp];
          }));
        }
        function initDragChargeTarget(models) {
          drag_charge_target = null;
          if (R.length(models) !== 1) return;

          R.thread(models)(R.head, modelModel.chargeTarget, R.unless(R.isNil, R.pipe(gameModelsModel.findStamp$(R.__, state.game.models), function (target_model) {
            drag_charge_target = target_model;
          })));
        }
      }
      function modelsDragContinue(_state_, event) {
        return R.threadP(drag_models_start_selection)(R.addIndex(R.map)(updateDragedModelPositionP), R.allP, R.reject(R.equals(null)), R.unless(R.isEmpty, function () {
          appGameService.models.force_changes.send(R.map(R.path(['state', 'stamp']), drag_models_start_selection));
          $rootScope.$digest();
        }));

        function updateDragedModelPositionP(model, index) {
          var pos = {
            x: drag_models_start_states[index].x + event.now.x - event.start.x,
            y: drag_models_start_states[index].y + event.now.y - event.start.y
          };
          return modelModel.setPositionP_(drag_charge_target, pos, model).catch(function () {
            return null;
          });
        }
      }
      function modelsDragEnd(_state_, event) {
        return R.threadP(drag_models_start_selection)(R.addIndex(R.map)(resetDragedModelPositionP), R.allP, R.reject(R.isNil), R.map(R.path(['state', 'stamp'])), setFinalPositions);

        function resetDragedModelPositionP(model, index) {
          return modelModel.setPositionP_(drag_charge_target, drag_models_start_states[index], model).catch(function () {
            return null;
          });
        }
        function setFinalPositions(stamps) {
          var shift = {
            x: event.now.x - event.start.x,
            y: event.now.y - event.start.y
          };
          appActionService.do('Game.command.execute', 'onModels', ['shiftPositionP', [drag_charge_target, shift], stamps]);
        }
      }
    }

    function modelsBindMove(_ref9) {
      var _ref10 = _slicedToArray(_ref9, 2);

      var move = _ref10[0];
      var keys = _ref10[1];

      models_default_bindings[move] = keys;
      models_default_bindings[move + 'Small'] = 'shift+' + keys;
    }
    function modelsBindShift(_ref11) {
      var _ref12 = _slicedToArray(_ref11, 2);

      var shift = _ref12[0];
      var keys = _ref12[1];

      models_default_bindings[shift] = keys;
      models_default_bindings[shift + 'Small'] = 'shift+' + keys;
    }
    function modelsBindArea(area) {
      var size = area === 0 ? 10 : area;
      models_default_bindings['toggle' + size + 'InchesAreaDisplay'] = 'alt+' + area;
      size += 10;
      models_default_bindings['toggle' + size + 'InchesAreaDisplay'] = 'alt+shift+' + area;
    }
    function modelsBindAura(_ref13, index) {
      var _ref14 = _slicedToArray(_ref13, 1);

      var aura = _ref14[0];

      models_default_bindings['toggle' + aura + 'AuraDisplay'] = 'ctrl+' + (index + 1);
    }
    function modelsBindEffect(_ref15) {
      var _ref16 = _slicedToArray(_ref15, 2);

      var effect = _ref16[0];
      var keys = _ref16[1];

      models_default_bindings['toggle' + effect + 'EffectDisplay'] = 'alt+' + keys;
    }

    function buildModelsModesButtons() {
      var _ref17 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var single = _ref17.single;
      var start_charge = _ref17.start_charge;
      var end_charge = _ref17.end_charge;
      var start_place = _ref17.start_place;
      var end_place = _ref17.end_place;

      var ret = [['Delete', 'deleteSelection'], ['Copy', 'copySelection'], ['Lock', 'toggleLock'],
      // [ 'Ruler Max Len.', 'setRulerMaxLength' ],
      ['Clear Label', 'clearLabel'], ['Image', 'toggle', 'image'], ['Show/Hide', 'toggleImageDisplay', 'image'], ['Next', 'setNextImage', 'image'], ['Wreck', 'toggleWreckDisplay', 'image'], ['Orient.', 'toggle', 'orientation'], ['Face Up', 'setOrientationUp', 'orientation'], ['Face Down', 'setOrientationDown', 'orientation'], ['Counter', 'toggle', 'counter'], ['Show/Hide', 'toggleCounterDisplay', 'counter'], ['Inc.', 'incrementCounter', 'counter'], ['Dec.', 'decrementCounter', 'counter'], ['Souls', 'toggle', 'souls'], ['Show/Hide', 'toggleSoulsDisplay', 'souls'], ['Inc.', 'incrementSouls', 'souls'], ['Dec.', 'decrementSouls', 'souls'], ['Melee', 'toggle', 'melee'], ['0.5"', 'toggleMeleeDisplay', 'melee'], ['Reach', 'toggleReachDisplay', 'melee'], ['Strike', 'toggleStrikeDisplay', 'melee']];
      if (single) {
        ret = R.concat(ret, [['Templates', 'toggle', 'templates'], ['AoE', 'createAoEOnModel', 'templates'], ['Spray', 'createSprayOnModel', 'templates']]);
      }
      ret = R.append(['Areas', 'toggle', 'areas'], ret);
      ret = R.append(['CtrlArea', 'toggleCtrlAreaDisplay', 'areas'], ret);
      ret = R.concat(ret, R.map(function (area) {
        var size = area + 1;
        return [size + '"', 'toggle' + size + 'InchesAreaDisplay', 'areas'];
      }, areas));
      ret = R.concat(ret, R.map(function (area) {
        var size = area + 11;
        return [size + '"', 'toggle' + size + 'InchesAreaDisplay', 'areas'];
      }, areas));
      ret = R.append(['Auras', 'toggle', 'auras'], ret);
      ret = R.concat(ret, R.map(function (_ref18) {
        var _ref19 = _slicedToArray(_ref18, 1);

        var aura = _ref19[0];

        return [aura, 'toggle' + aura + 'AuraDisplay', 'auras'];
      }, auras));
      ret = R.append(['Effects', 'toggle', 'effects'], ret);
      ret = R.concat(ret, R.map(function (_ref20) {
        var _ref21 = _slicedToArray(_ref20, 1);

        var effect = _ref21[0];

        return [effect, 'toggle' + effect + 'EffectDisplay', 'effects'];
      }, effects));
      ret = R.append(['Incorp.', 'toggleIncorporealDisplay', 'effects'], ret);
      ret = R.append(['Charge', 'toggle', 'charge'], ret);
      if (start_charge) {
        ret = R.append(['Start', 'startCharge', 'charge'], ret);
      }
      if (end_charge) {
        ret = R.append(['End', 'endCharge', 'charge'], ret);
      }
      ret = R.append(['Max Len.', 'setChargeMaxLength', 'charge'], ret);
      ret = R.append(['Place', 'toggle', 'place'], ret);
      if (start_place) {
        ret = R.append(['Start', 'startPlace', 'place'], ret);
      }
      if (end_place) {
        ret = R.append(['End', 'endPlace', 'place'], ret);
      }
      ret = R.append(['Max Len.', 'setPlaceMaxLength', 'place'], ret);
      ret = R.append(['Within', 'togglePlaceWithin', 'place'], ret);
      ret = R.concat(ret, [['Unit', 'toggle', 'unit'], ['Show/Hide', 'toggleUnitDisplay', 'unit'], ['Set #', 'setUnit', 'unit'], ['Leader', 'toggleLeaderDisplay', 'unit']]);
      if (single) {
        ret = R.append(['Select All', 'selectAllUnit', 'unit'], ret);
        ret = R.append(['Select Friends', 'selectAllFriendly'], ret);
      }

      return ret;
    }
  }
})();
//# sourceMappingURL=models.js.map
