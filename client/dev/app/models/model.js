'use strict';

(function () {
  angular.module('clickApp.services').factory('model', modelModelFactory);

  modelModelFactory.$inject = ['settings', 'element', 'gameFactions', 'modelArea', 'modelAura', 'modelCharge', 'modelCounter', 'modelDamage', 'modelEffect', 'modelGeom', 'modelImage', 'modelIncorporeal', 'modelLeader', 'modelMelee', 'modelMove', 'modelPlace', 'modelRuler', 'modelUnit', 'modelWreck'];
  function modelModelFactory(settingsModel, elementModel, gameFactionsModel, modelAreaModel, modelAuraModel, modelChargeModel, modelCounterModel, modelDamageModel, modelEffectModel, modelGeomModel, modelImageModel, modelIncorporealModel, modelLeaderModel, modelMeleeModel, modelMoveModel, modelPlaceModel, modelUnitModel, modelWreckModel, modelRulerModel) {
    var DEFAULT_MOVES = {
      Move: 10,
      MoveSmall: 5,
      Rotate: 15,
      RotateSmall: 5,
      Shift: 10,
      ShiftSmall: 1,
      RotateCharge: 10,
      RotateChargeSmall: 2
    };
    var MOVES = R.clone(DEFAULT_MOVES);
    settingsModel.register('Misc', 'Model', DEFAULT_MOVES, function (moves) {
      R.extend(MOVES, moves);
    });

    var base = elementModel('model', MOVES);
    var modelModel = Object.create(base);
    R.deepExtend(modelModel, {
      createP: modelCreateP,
      state_checkers: [],
      state_updaters: [],
      checkStateP: modelCheckStateP,
      descriptionFromInfo: modelDescriptionFromInfo,
      user: modelUser,
      userIs: modelUserIs,
      modeFor: modelModeFor
    }, modelAreaModel(modelModel), modelAuraModel(modelModel), modelChargeModel(MOVES, modelModel), modelCounterModel(modelModel), modelDamageModel(modelModel), modelEffectModel(modelModel), modelGeomModel(modelModel), modelImageModel(modelModel), modelIncorporealModel(modelModel), modelLeaderModel(modelModel), modelMeleeModel(modelModel), modelMoveModel(MOVES, modelModel), modelPlaceModel(MOVES, modelModel), modelRulerModel(modelModel), modelUnitModel(modelModel), modelWreckModel(modelModel));

    R.curryService(modelModel);
    return modelModel;

    function modelCreateP(factions, temp) {
      return R.threadP(factions)(gameFactionsModel.getModelInfoP$(temp.info), function (info) {
        var model = {
          state: {
            x: 0, y: 0, r: 0,
            img: 0,
            dsp: ['i'],
            eff: [],
            l: [],
            c: 0, s: 0,
            u: null,
            aur: null,
            are: null,
            rml: null,
            cml: null,
            pml: [null, false],
            cha: null,
            pla: null,
            dmg: initDamage(info.damage),
            stamp: R.guid()
          }
        };
        if (info.type === 'wardude' || info.type === 'beast' || info.type === 'jack') {
          model.state.dsp = R.append('c', model.state.dsp);
        }
        if (info.immovable) {
          model.state.lk = true;
        }
        model.state = R.deepExtend(model.state, temp);
        return modelModel.checkStateP(factions, null, model);
      });
    }
    function modelUser(model) {
      return R.path(['state', 'user'], model);
    }
    function modelUserIs(user, model) {
      return R.pathEq(['state', 'user'], user, model);
    }
    function modelCheckStateP(factions, target, model) {
      return R.threadP(factions)(gameFactionsModel.getModelInfoP$(model.state.info), function (info) {
        var radius = info.base_radius;
        return R.thread(model.state)(R.assoc('x', Math.max(0 + radius, Math.min(480 - radius, model.state.x))), R.assoc('y', Math.max(0 + radius, Math.min(480 - radius, model.state.y))), function (state) {
          return R.reduce(function (state, checker) {
            return checker(info, target, state);
          }, state, modelModel.state_checkers);
        }, function (state) {
          return R.reduce(function (state, updater) {
            return updater(state);
          }, state, modelModel.state_updaters);
        });
      }, function (state) {
        return R.assoc('state', state, model);
      });
    }
    function modelModeFor(model) {
      if (modelModel.isCharging(model)) {
        return 'ModelCharge';
      }
      if (modelModel.isPlacing(model)) {
        return 'ModelPlace';
      }
      return 'Model';
    }
    function modelDescriptionFromInfo(info, model) {
      return R.thread(info)(R.props(['unit_name', 'name']), R.prepend(modelModel.user(model)), R.reject(R.isNil), R.join('/'));
    }
    function initDamage(info) {
      if (info.type === 'warrior') {
        return { n: 0, t: 0 };
      }
      return R.thread(info)(R.keys, R.reject(R.equals('type')), R.reject(R.equals('field')), R.reject(R.equals('total')), R.reject(R.equals('depth')), R.reduce(function (mem, key) {
        return R.assoc(key, R.map(R.always(0), info[key]), mem);
      }, {}), R.assoc('f', 0), R.assoc('t', 0));
    }
  }
})();
//# sourceMappingURL=model.js.map
