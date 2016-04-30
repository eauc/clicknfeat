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
      create: modelCreate,
      state_checkers: [],
      state_updaters: [],
      checkState: modelCheckState,
      descriptionFromInfo: modelDescriptionFromInfo,
      user: modelUser,
      userIs: modelUserIs,
      modeFor: modelModeFor,
      render: modelRender
    }, modelAreaModel(modelModel), modelAuraModel(modelModel), modelChargeModel(MOVES, modelModel), modelCounterModel(modelModel), modelDamageModel(modelModel), modelEffectModel(modelModel), modelGeomModel(modelModel), modelImageModel(modelModel), modelIncorporealModel(modelModel), modelLeaderModel(modelModel), modelMeleeModel(modelModel), modelMoveModel(MOVES, modelModel), modelPlaceModel(MOVES, modelModel), modelRulerModel(modelModel), modelUnitModel(modelModel), modelWreckModel(modelModel));

    R.curryService(modelModel);
    return modelModel;

    function modelCreate(factions, temp) {
      return R.thread(factions)(gameFactionsModel.getModelInfo$(temp.info), R.unless(R.isNil, function (info) {
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
        return modelModel.checkState(factions, null, model);
      }));
    }
    function modelUser(model) {
      return R.path(['state', 'user'], model);
    }
    function modelUserIs(user, model) {
      return R.pathEq(['state', 'user'], user, model);
    }
    function modelCheckState(factions, target, model) {
      return R.thread(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.ifElse(R.isNil, function () {
        return R.prop('state', model);
      }, function (info) {
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
      }), function (state) {
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
    function modelRender(_ref, factions, state) {
      var is_flipped = _ref.is_flipped;
      var charge_target = _ref.charge_target;

      var info = R.thread(factions)(gameFactionsModel.getModelInfo$(state.info), R.defaultTo({ base_radius: 5.905 }));
      var is_wreck = modelModel.isWreckDisplayed({ state: state });
      var img = is_wreck ? modelModel.getWreckImage(factions, { state: state }) : modelModel.getImage(factions, { state: state });
      var cx = img.width / 2;
      var cy = img.height / 2;
      var radius = info.base_radius;
      var dx = cx;
      var dy = cy - info.base_radius;
      var frx = cx - info.base_radius;
      var flx = cx + info.base_radius;
      var los = {
        dy: cy - 700,
        lx: cx - 700,
        rx: cx + 700
      };
      var lock = {
        show: modelModel.isLocked({ state: state }),
        x: cx + radius - 5,
        y: cy - 5
      };
      var path = { show: false, x: 0, y: 0, transform: '', length: {} };
      var label_options = {
        flipped: is_flipped,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx, y: cx + radius + 8 }
      };
      var label = base.renderLabel(label_options, state);
      return R.deepExtend({
        stamp: state.stamp,
        x: state.x, y: state.y,
        transform: ['translate(' + (state.x - cx) + ',' + (state.y - cy) + ')', 'rotate(' + state.r + ',' + cx + ',' + cy + ')'].join(' '),
        cx: cx, cy: cy, radius: radius, dx: dx, dy: dy, frx: frx, flx: flx, los: los,
        width: img.width, height: img.height,
        base_color: info.base_color,
        title: modelModel.descriptionFromInfo(info, { state: state }),
        label: label, lock: lock, path: path
      }, modelModel.renderArea({ info: info, radius: radius }, factions, state), modelModel.renderAura({ radius: radius }, state), modelModel.renderCharge({ base: base, charge_target: charge_target, radius: radius }, path, state), modelModel.renderCounter({ base: base, cx: cx, cy: cy, is_flipped: is_flipped, radius: radius }, state), modelModel.renderDamage({ cx: cx, cy: cy, info: info, radius: radius }, state), modelModel.renderEffect({ img: img, info: info }, state), modelModel.renderImage({ img: img }, state), modelModel.renderLeader({ cx: cx, cy: cy, radius: radius }, state), modelModel.renderMelee({ img: img, info: info }, state), modelModel.renderPlace({ base: base, info: info, path: path }, state), modelModel.renderUnit({ base: base, cx: cx, cy: cy, radius: radius }, state));
    }
  }
})();
//# sourceMappingURL=model.js.map
