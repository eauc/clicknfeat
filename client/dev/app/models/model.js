'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('model', modelModelFactory);

  modelModelFactory.$inject = ['settings', 'element', 'gameFactions', 'modelArea', 'modelAura', 'modelCharge', 'modelCounter', 'modelDamage', 'modelEffect', 'modelGeom', 'modelImage', 'modelIncorporeal', 'modelLeader', 'modelMelee', 'modelMove', 'modelPlace', 'modelRuler', 'modelUnit', 'modelWreck'];
  function modelModelFactory(settingsModel, elementModel, gameFactionsModel, modelAreaModel, modelAuraModel, modelChargeModel, modelCounterModel, modelDamageModel, modelEffectModel, modelGeomModel, modelImageModel, modelIncorporealModel, modelLeaderModel, modelMeleeModel, modelMoveModel, modelPlaceModel, modelUnitModel, modelWreckModel, modelRulerModel) {
    var EFFECTS = [['b', '/data/icons/Blind.png'], ['c', '/data/icons/Corrosion.png'], ['d', '/data/icons/BoltBlue.png'], ['f', '/data/icons/Fire.png'], ['e', '/data/icons/BoltYellow.png'], ['k', '/data/icons/KD.png'], ['t', '/data/icons/Stationary.png']];
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
    function modelRender(is_flipped, factions, state) {
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
      var aura = {
        show: modelModel.isAuraDisplayed({ state: state }),
        radius: radius * 1.2,
        color: modelModel.auraDisplay({ state: state })
      };
      var lock = {
        show: modelModel.isLocked({ state: state }),
        x: cx + radius - 5,
        y: cy - 5
      };
      var state_dmg = R.propOr({}, 'dmg', state);
      var percent_damage = state_dmg.t / info.damage.total;
      var damage_x = cx - radius + 2 * radius * percent_damage;
      var dmg = {
        show: !(info.damage.type === 'warrior' && info.damage.n === 1),
        lx: cx - radius,
        ly: cy + radius + 2,
        rx: cx + radius,
        ry: cx + radius + 2,
        x: damage_x
      };
      var percent_field = state_dmg.f / info.damage.field;
      var field_x = cx - radius + 2 * radius * percent_field;
      var field = {
        show: R.exists(info.damage.field),
        lx: dmg.lx,
        ly: dmg.ly + 1,
        rx: dmg.rx,
        ry: dmg.ry + 1,
        x: field_x
      };
      var label_options = {
        flipped: is_flipped,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx, y: cx + radius + 8 }
      };
      var label = base.renderLabel(label_options, state);
      var counter_options = {
        rotate: state.r,
        flipped: is_flipped,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx, y: cy + 2 }
      };
      var counter = base.renderText(counter_options, state.c);
      counter.show = modelModel.isCounterDisplayed('c', { state: state });
      var souls_options = {
        rotate: state.r,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx + radius * 0.8 + 5,
          y: cy - radius - 5 }
      };
      var souls = base.renderText(souls_options, state.s);
      souls.show = modelModel.isCounterDisplayed('s', { state: state });
      souls.cx = souls.x - 10;
      souls.cy = souls.y - 10;
      var unit_options = {
        rotate: state.r,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx - radius * 0.7 - 5,
          y: cy - radius * 0.7 - 5 }
      };
      var unit = base.renderText(unit_options, 'U' + modelModel.unit({ state: state }));
      unit.show = modelModel.isUnitDisplayed({ state: state });
      unit.cx = unit.x - 10;
      unit.cy = unit.y - 10;
      var melee = {
        melee: {
          show: modelModel.isMeleeDisplayed('mm', { state: state }),
          path: computeMeleePath(5, img, info)
        },
        reach: {
          show: modelModel.isMeleeDisplayed('mr', { state: state }),
          path: computeMeleePath(20, img, info)
        },
        strike: {
          show: modelModel.isMeleeDisplayed('ms', { state: state }),
          path: computeMeleePath(40, img, info)
        }
      };
      var area = modelModel.isAreaDisplayed({ state: state }) ? modelModel.areaDisplay({ state: state }) * 10 + radius : null;
      var ctrl = modelModel.isCtrlAreaDisplayed(factions, { state: state }) ? (info.focus || info.fury) * 20 + radius : null;
      var effects = R.thread(EFFECTS)(R.filter(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 1);

        var key = _ref2[0];
        return modelModel.isEffectDisplayed(key, { state: state });
      }), function (actives) {
        var base_x = img.width / 2 - R.length(actives) * 10 / 2;
        var base_y = img.height / 2 + info.base_radius + 1;
        return R.addIndex(R.reduce)(function (mem, _ref3, i) {
          var _ref4 = _slicedToArray(_ref3, 2);

          var key = _ref4[0];
          var link = _ref4[1];

          return R.assoc(key, {
            show: modelModel.isEffectDisplayed(key, { state: state }),
            x: base_x + i * 10, y: base_y, link: link
          }, mem);
        }, {}, actives);
      });
      effects.l = {
        show: modelModel.isLeaderDisplayed({ state: state }),
        link: '/data/icons/Leader.png',
        x: cx - radius * 0.7 - 5,
        y: cy - radius * 0.7 - 5
      };
      return {
        stamp: state.stamp,
        x: state.x, y: state.y,
        transform: ['translate(' + (state.x - cx) + ',' + (state.y - cy) + ')', 'rotate(' + state.r + ',' + cx + ',' + cy + ')'].join(' '),
        cx: cx, cy: cy, radius: radius, dx: dx, dy: dy, frx: frx, flx: flx, los: los,
        width: img.width, height: img.height,
        img: img.link,
        base_color: info.base_color,
        title: modelModel.descriptionFromInfo(info, { state: state }),
        area: area, ctrl: ctrl, aura: aura, lock: lock, dmg: dmg, field: field, label: label,
        counter: counter, souls: souls, melee: melee, effects: effects, unit: unit
      };
    }
    function computeMeleePath(size, img, info) {
      return ['M' + (img.width / 2 - info.base_radius - size) + ',' + img.height / 2, 'L' + (img.width / 2 + info.base_radius + size) + ',' + img.height / 2, 'A' + (info.base_radius + size) + ',' + (info.base_radius + size) + ' 0 0,0', img.width / 2 - info.base_radius - size + ',' + img.height / 2, 'M' + img.width / 2 + ',' + img.height / 2, 'L' + img.width / 2 + ',' + (img.height / 2 - info.base_radius - size)].join(' ');
    }
  }
})();
//# sourceMappingURL=model.js.map
