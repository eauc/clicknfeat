'use strict';

(function () {
  angular.module('clickApp.services').factory('modelBaseMode', modelBaseModeModelFactory);

  modelBaseModeModelFactory.$inject = ['appState', 'settings', 'modelsMode', 'model', 'gameModels', 'gameModelSelection'];
  function modelBaseModeModelFactory(appStateService, settingsModel, modelsModeModel, modelModel, gameModelsModel, gameModelSelectionModel) {
    var FLIP_MAP_LENS = R.lensPath(['view', 'flip_map']);
    var MODELS_LENS = R.lensPath(['game', 'models']);
    var model_actions = Object.create(modelsModeModel.actions);
    model_actions.createAoEOnModel = modelCreateAoEOnModel;
    model_actions.createSprayOnModel = modelCreateSprayOnModel;
    model_actions.selectAllFriendly = modelSelectAllFriendly;
    model_actions.selectAllUnit = modelSelectAllUnit;
    model_actions.setB2B = modelSetB2B;
    model_actions.openEditLabel = modelOpenEditLabel;
    model_actions.openEditDamage = modelOpenEditDamage;

    var model_default_bindings = {
      'createAoEOnModel': 'ctrl+a',
      'createSprayOnModel': 'ctrl+s',
      'selectAllUnit': 'ctrl+u',
      'selectAllFriendly': 'ctrl+f',
      'setB2B': 'ctrl+shift+clickModel',
      'openEditLabel': 'shift+l',
      'openEditDamage': 'shift+d'
    };
    var model_bindings = R.extend(Object.create(modelsModeModel.bindings), model_default_bindings);

    var model_mode = {
      onEnter: function onEnter() {},
      onLeave: function onLeave() {},
      name: 'ModelBase',
      actions: model_actions,
      buttons: [],
      bindings: model_bindings
    };
    settingsModel.register('Bindings', model_mode.name, model_default_bindings, function (bs) {
      R.extend(model_mode.bindings, bs);
    });
    return model_mode;

    function modelCreateAoEOnModel(state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(function (model) {
        return R.pick(['x', 'y'], model.state);
      }, R.assoc('type', 'aoe'), function (position) {
        return {
          base: { x: 0, y: 0, r: 0 },
          templates: [R.assoc('r', 0, position)]
        };
      }, function (create) {
        var is_flipped = R.viewOr(false, FLIP_MAP_LENS, state);
        return appStateService.onAction(state, ['Game.command.execute', 'createTemplate', [create, is_flipped]]);
      })));
    }
    function modelCreateSprayOnModel(state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, R.pipe(function (model) {
        return R.thread(model)(modelModel.baseEdgeInDirection$(model.state.r), R.assoc('o', model.state.stamp), R.assoc('r', model.state.r), R.assoc('type', 'spray'), function (position) {
          return {
            base: { x: 0, y: 0, r: 0 },
            templates: [position]
          };
        }, function (create) {
          var is_flipped = R.viewOr(false, FLIP_MAP_LENS, state);
          return appStateService.onAction(state, ['Game.command.execute', 'createTemplate', [create, is_flipped]]);
        });
      })));
    }
    function modelSelectAllFriendly(state) {
      var selection = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(selection[0]), R.unless(R.isNil, R.pipe(modelModel.user, function (user) {
        return R.thread(state.game)(R.prop('models'), gameModelsModel.all, R.filter(modelModel.userIs$(user)), R.map(R.path(['state', 'stamp'])));
      }, function (stamps) {
        return appStateService.onAction(state, ['Game.command.execute', 'setModelSelection', ['set', stamps]]);
      })));
    }
    function modelSelectAllUnit(state) {
      var selection = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(selection[0]), R.unless(R.isNil, R.pipe(function (model) {
        return R.thread(model)(modelModel.unit, R.unless(R.equals(0), R.pipe(function (unit) {
          return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.all, R.spyError('toto'), R.filter(modelModel.userIs$(modelModel.user(model))), R.spyError('toto'), R.filter(modelModel.unitIs$(unit)), R.spyError('toto'), R.map(R.path(['state', 'stamp'])), R.spyError('toto'));
        }, function (stamps) {
          return appStateService.onAction(state, ['Game.command.execute', 'setModelSelection', ['set', stamps]]);
        })));
      })));
    }
    function modelSetB2B(state, event) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]), R.unless(R.isNil, function (model) {
        if (model.state.stamp === event['click#'].target.state.stamp) return state;

        return appStateService.onAction(state, ['Game.command.execute', 'onModels', ['setB2BP', [event['click#'].target], stamps]]);
      }));
    }
    function modelOpenEditLabel(state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      var model = R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]));
      if (R.isNil(model)) return null;
      return R.assocPath(['view', 'edit_label'], {
        type: 'model', element: model
      }, state);
    }
    function modelOpenEditDamage(state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      var model = R.thread(state)(R.view(MODELS_LENS), gameModelsModel.findStamp$(stamps[0]));
      if (R.isNil(model)) return null;
      return R.assocPath(['view', 'edit_damage'], {
        selection: model
      }, state);
    }
  }
})();
//# sourceMappingURL=base.js.map
