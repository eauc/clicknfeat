'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('modelPlaceMode', modelPlaceModeModelFactory);

  modelPlaceModeModelFactory.$inject = ['modes', 'settings', 'modelsMode', 'modelBaseMode', 'game', 'gameModels', 'gameModelSelection'];
  function modelPlaceModeModelFactory(modesModel, settingsModel, modelsModeModel, modelBaseModeModel, gameModel, gameModelsModel, gameModelSelectionModel) {
    var model_actions = Object.create(modelBaseModeModel.actions);
    model_actions.endPlace = placeModelEnd;
    model_actions.setTargetModel = placeModelSetTarget;
    model_actions.setOriginModel = placeModelSetOrigin;

    var moves = [['moveFront', 'up', 'moveFront'], ['moveBack', 'down', 'moveBack'], ['rotateLeft', 'left', 'rotateLeft'], ['rotateRight', 'right', 'rotateRight'], ['shiftUp', 'ctrl+up', 'shiftDown'], ['shiftDown', 'ctrl+down', 'shiftUp'], ['shiftLeft', 'ctrl+left', 'shiftRight'], ['shiftRight', 'ctrl+right', 'shiftLeft']];
    var placeModelMove$ = R.curry(placeModelMove);
    R.forEach(buildPlaceMove, moves);

    var model_default_bindings = {
      'endPlace': 'p',
      'setTargetModel': 'shift+clickModel',
      'setOriginModel': 'ctrl+clickModel'
    };
    var model_bindings = R.extend(Object.create(modelBaseModeModel.bindings), model_default_bindings);
    var model_buttons = modelsModeModel.buildButtons({ single: true,
      end_place: true
    });
    var model_mode = {
      onEnter: function onEnter() {},
      onLeave: function onLeave() {},
      name: 'ModelPlace',
      actions: model_actions,
      buttons: model_buttons,
      bindings: model_bindings
    };
    modesModel.registerMode(model_mode);
    settingsModel.register('Bindings', model_mode.name, model_default_bindings, function (bs) {
      R.extend(model_mode.bindings, bs);
    });
    return model_mode;

    function placeModelEnd(state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP()(function () {
        return state.eventP('Game.command.execute', 'onModels', ['endPlace', [], stamps]);
      }, function () {
        return state.eventP('Modes.switchTo', 'Model');
      });
    }
    function placeModelSetTarget(state, event) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(stamps[0]), function (model) {
        if (model.state.stamp === event['click#'].target.state.stamp) return null;

        return state.eventP('Game.command.execute', 'onModels', ['setPlaceTargetP', [state.factions, event['click#'].target], stamps]);
      });
    }
    function placeModelSetOrigin(state, event) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(stamps[0]), function (model) {
        if (model.state.stamp === event['click#'].target.state.stamp) return null;

        return state.eventP('Game.command.execute', 'onModels', ['setPlaceOriginP', [state.factions, event['click#'].target], stamps]);
      });
    }
    function placeModelMove(move, flip_move, small, state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      var _move = R.path(['ui_state', 'flip_map'], state) ? flip_move : move;
      return state.eventP('Game.command.execute', 'onModels', [_move + 'PlaceP', [state.factions, small], stamps]);
    }
    function buildPlaceMove(_ref) {
      var _ref2 = _slicedToArray(_ref, 3);

      var move = _ref2[0];
      var keys = _ref2[1];
      var flip_move = _ref2[2];

      model_actions[move] = placeModelMove$(move, flip_move, false);
      model_actions[move + 'Small'] = placeModelMove$(move, flip_move, true);
    }
  }
})();
//# sourceMappingURL=place.js.map
