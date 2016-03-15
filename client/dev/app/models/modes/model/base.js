'use strict';

(function () {
  angular.module('clickApp.services').factory('modelBaseMode', modelBaseModeModelFactory);

  modelBaseModeModelFactory.$inject = ['modes', 'settings', 'modelsMode', 'sprayTemplateMode', 'model', 'game', 'gameModels', 'gameModelSelection'];
  function modelBaseModeModelFactory(modesModel, settingsModel, modelsModeModel, sprayTemplateModeModel, modelModel, gameModel, gameModelsModel, gameModelSelectionModel) {
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
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(stamps[0]), function (model) {
        return R.pick(['x', 'y'], model.state);
      }, R.assoc('type', 'aoe'), function (position) {
        return {
          base: { x: 0, y: 0 },
          templates: [position]
        };
      }, function (create) {
        var is_flipped = R.path(['ui_state', 'flip_map'], state);
        return state.eventP('Game.command.execute', 'createTemplate', [create, is_flipped]);
      });
    }
    function modelCreateSprayOnModel(state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(stamps[0]), function (model) {
        return R.threadP(model)(R.prop('state'), R.pick(['x', 'y']), R.assoc('type', 'spray'), function (position) {
          return {
            base: { x: 0, y: 0 },
            templates: [position]
          };
        }, function (create) {
          var is_flipped = R.path(['ui_state', 'flip_map'], state);
          return R.threadP()(function () {
            return state.eventP('Game.command.execute', 'createTemplate', [create, is_flipped]);
          },
          // simulate set-origin-model in sprayTemplateMode
          function () {
            return sprayTemplateModeModel.actions.setOriginModel(state, { 'click#': { target: model } });
          });
        });
      });
    }
    function modelSelectAllFriendly(state) {
      var selection = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(selection[0]), modelModel.user, function (user) {
        return R.thread(state.game)(R.prop('models'), gameModelsModel.all, R.filter(modelModel.userIs$(user)), R.map(modelModel.stamp));
      }, function (stamps) {
        return state.eventP('Game.command.execute', 'setModelSelection', ['set', stamps]);
      });
    }
    function modelSelectAllUnit(state) {
      var selection = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(selection[0]), function (model) {
        return R.threadP(model)(modelModel.unit, R.rejectIf(R.isNil, 'Model not in unit'), function (unit) {
          return R.thread(state.game)(R.prop('models'), gameModelsModel.all, R.filter(modelModel.userIs$(modelModel.user(model))), R.filter(modelModel.unitIs$(unit)), R.map(modelModel.stamp));
        });
      }, function (stamps) {
        return state.eventP('Game.command.execute', 'setModelSelection', ['set', stamps]);
      });
    }
    function modelSetB2B(state, event) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(stamps[0]), function (model) {
        if (model.state.stamp === event['click#'].target.state.stamp) return null;

        return state.eventP('Game.command.execute', 'onModels', ['setB2BP', [state.factions, event['click#'].target], stamps]);
      });
    }
    function modelOpenEditLabel(state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(stamps[0]), function (model) {
        state.queueChangeEventP('Game.editLabel.open', model);
      });
    }
    function modelOpenEditDamage(state) {
      var stamps = gameModelSelectionModel.get('local', state.game.model_selection);
      return R.threadP(state.game)(R.prop('models'), gameModelsModel.findStampP$(stamps[0]), function (model) {
        state.queueChangeEventP('Game.editDamage.toggle', model);
      });
    }
  }
})();
//# sourceMappingURL=base.js.map