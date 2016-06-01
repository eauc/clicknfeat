'use strict';

(function () {
  angular.module('clickApp.services').factory('model', modelModelFactory);

  modelModelFactory.$inject = ['settings', 'element', 'gameFactions', 'modelArea', 'modelAura', 'modelCharge', 'modelCounter', 'modelDamage', 'modelEffect', 'modelGeom', 'modelImage', 'modelIncorporeal', 'modelLeader', 'modelMelee', 'modelMove', 'modelPlace', 'modelRuler', 'modelUnit', 'modelWreck'];
  function modelModelFactory(settingsModel, elementModel, gameFactionsModel, modelAreaModel, modelAuraModel, modelChargeModel, modelCounterModel, modelDamageModel, modelEffectModel, modelGeomModel, modelImageModel, modelIncorporealModel, modelLeaderModel, modelMeleeModel, modelMoveModel, modelPlaceModel, modelUnitModel, modelWreckModel, modelRulerModel) {
    var USER_LENS = R.lensPath(['state', 'user']);
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
          info: info,
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
        if (model.info.type === 'wardude' || model.info.type === 'beast' || model.info.type === 'jack') {
          model.state.dsp = R.append('c', model.state.dsp);
        }
        if (model.info.immovable) {
          model.state.lk = true;
        }
        model.state = R.deepExtend(model.state, temp);
        return modelModel.checkState(null, model);
      }));
    }
    function modelUser(model) {
      return R.view(USER_LENS, model);
    }
    function modelUserIs(user, model) {
      return R.equals(user, R.view(USER_LENS, model));
    }
    function modelCheckState(target, model) {
      var info = model.info;
      var radius = info.base_radius;
      var state = R.thread(model.state)(R.assoc('x', Math.max(0 + radius, Math.min(480 - radius, model.state.x))), R.assoc('y', Math.max(0 + radius, Math.min(480 - radius, model.state.y))), function (state) {
        return R.reduce(function (state, checker) {
          return checker(target, info, state);
        }, state, modelModel.state_checkers);
      }, function (state) {
        return R.reduce(function (state, updater) {
          return updater(state);
        }, state, modelModel.state_updaters);
      });
      return R.assoc('state', state, model);
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
    function modelDescriptionFromInfo(model) {
      return R.thread(model.info)(R.props(['unit_name', 'name']), R.prepend(modelModel.user(model)), R.reject(R.isNil), R.join('/'));
    }
    function initDamage(info) {
      if (info.type === 'warrior') {
        return { n: 0, t: 0 };
      }
      return R.thread(info)(R.keys, R.reject(R.equals('type')), R.reject(R.equals('field')), R.reject(R.equals('total')), R.reject(R.equals('depth')), R.reduce(function (mem, key) {
        return R.assoc(key, R.map(R.always(0), info[key]), mem);
      }, {}), R.assoc('f', 0), R.assoc('t', 0));
    }
    function modelRender(_ref, model) {
      var is_flipped = _ref.is_flipped;
      var charge_target = _ref.charge_target;

      var state = model.state;
      var info = model.info;
      var is_wreck = modelModel.isWreckDisplayed(model);
      var img = is_wreck ? modelModel.getWreckImage(model) : modelModel.getImage(model);
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
        show: modelModel.isLocked(model),
        x: cx + radius - 5,
        y: cy - 5
      };
      var path = { show: false, x: 0, y: 0, transform: '', length: {} };
      var r = state.r % 360;
      r = r > 0 ? r : 360 + r;
      var text_y_top = cx + radius + 8;
      var text_y_bottom = cx - radius - 2;
      var text_center_y = r > 90 && r < 270 ? is_flipped ? text_y_bottom : text_y_top : is_flipped ? text_y_top : text_y_bottom;
      var label_options = {
        flipped: is_flipped,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx, y: text_center_y }
      };
      var label = base.renderLabel(label_options, model);
      return R.deepExtend({
        stamp: state.stamp,
        x: state.x, y: state.y,
        transform: ['translate(' + (state.x - cx) + ',' + (state.y - cy) + ')', 'rotate(' + state.r + ',' + cx + ',' + cy + ')'].join(' '),
        cx: cx, cy: cy, radius: radius, dx: dx, dy: dy, frx: frx, flx: flx, los: los,
        width: img.width, height: img.height,
        base_color: info.base_color,
        title: modelModel.descriptionFromInfo(model),
        label_transform: 'translate(' + (state.x - cx) + ',' + (state.y - cy) + ')',
        label: label, lock: lock, path: path
      }, modelModel.renderArea(model), modelModel.renderAura(model), modelModel.renderCharge({ base: base, charge_target: charge_target }, path, model), modelModel.renderCounter({ base: base, cx: cx, cy: cy, is_flipped: is_flipped }, model), modelModel.renderDamage({ cx: cx, cy: cy }, model), modelModel.renderEffect({ img: img }, model), modelModel.renderImage({ img: img }, model), modelModel.renderLeader({ cx: cx, cy: cy }, model), modelModel.renderMelee({ img: img }, model), modelModel.renderPlace({ base: base, path: path }, model), modelModel.renderUnit({ base: base, cx: cx, cy: cy }, model));
    }
  }
})();
//# sourceMappingURL=model.js.map
