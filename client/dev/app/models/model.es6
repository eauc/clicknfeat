(function() {
  angular.module('clickApp.services')
    .factory('model', modelModelFactory);

  modelModelFactory.$inject = [
    'settings',
    'point',
    'element',
    'gameFactions',
    'modelArea',
    'modelAura',
    'modelCharge',
    'modelCounter',
    'modelDamage',
    'modelEffect',
    'modelGeom',
    'modelImage',
    'modelIncorporeal',
    'modelLeader',
    'modelMelee',
    'modelMove',
    'modelPlace',
    'modelRuler',
    'modelUnit',
    'modelWreck',
  ];
  function modelModelFactory(settingsModel,
                             pointModel,
                             elementModel,
                             gameFactionsModel,
                             modelAreaModel,
                             modelAuraModel,
                             modelChargeModel,
                             modelCounterModel,
                             modelDamageModel,
                             modelEffectModel,
                             modelGeomModel,
                             modelImageModel,
                             modelIncorporealModel,
                             modelLeaderModel,
                             modelMeleeModel,
                             modelMoveModel,
                             modelPlaceModel,
                             modelUnitModel,
                             modelWreckModel,
                             modelRulerModel) {
    const EFFECTS = [
      [ 'b' , '/data/icons/Blind.png'      ],
      [ 'c' , '/data/icons/Corrosion.png'  ],
      [ 'd' , '/data/icons/BoltBlue.png'   ],
      [ 'f' , '/data/icons/Fire.png'       ],
      [ 'e' , '/data/icons/BoltYellow.png' ],
      [ 'k' , '/data/icons/KD.png'         ],
      [ 't' , '/data/icons/Stationary.png' ],
    ];
    const DEFAULT_MOVES = {
      Move: 10,
      MoveSmall: 5,
      Rotate: 15,
      RotateSmall: 5,
      Shift: 10,
      ShiftSmall: 1,
      RotateCharge: 10,
      RotateChargeSmall: 2
    };
    const MOVES = R.clone(DEFAULT_MOVES);
    settingsModel.register('Misc',
                           'Model',
                           DEFAULT_MOVES,
                           (moves) => {
                             R.extend(MOVES, moves);
                           });

    const base = elementModel('model', MOVES);
    const modelModel = Object.create(base);
    R.deepExtend(
      modelModel, {
        create: modelCreate,
        state_checkers: [],
        state_updaters: [],
        checkState: modelCheckState,
        descriptionFromInfo: modelDescriptionFromInfo,
        user: modelUser,
        userIs: modelUserIs,
        modeFor: modelModeFor,
        render: modelRender
      },
      modelAreaModel(modelModel),
      modelAuraModel(modelModel),
      modelChargeModel(MOVES, modelModel),
      modelCounterModel(modelModel),
      modelDamageModel(modelModel),
      modelEffectModel(modelModel),
      modelGeomModel(modelModel),
      modelImageModel(modelModel),
      modelIncorporealModel(modelModel),
      modelLeaderModel(modelModel),
      modelMeleeModel(modelModel),
      modelMoveModel(MOVES, modelModel),
      modelPlaceModel(MOVES, modelModel),
      modelRulerModel(modelModel),
      modelUnitModel(modelModel),
      modelWreckModel(modelModel)
    );

    R.curryService(modelModel);
    return modelModel;

    function modelCreate(factions, temp) {
      return R.thread(factions)(
        gameFactionsModel.getModelInfo$(temp.info),
        R.unless(
          R.isNil,
          (info) => {
            const model = {
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
                pml: [null,false],
                cha: null,
                pla: null,
                dmg: initDamage(info.damage),
                stamp: R.guid()
              }
            };
            if(info.type === 'wardude' ||
               info.type === 'beast' ||
               info.type === 'jack') {
              model.state.dsp = R.append('c', model.state.dsp);
            }
            if(info.immovable) {
              model.state.lk = true;
            }
            model.state = R.deepExtend(model.state, temp);
            return modelModel.checkState(factions, null, model);
          }
        )
      );
    }
    function modelUser(model) {
      return R.path(['state', 'user'], model);
    }
    function modelUserIs(user, model) {
      return R.pathEq(['state', 'user'], user, model);
    }
    function modelCheckState(factions, target, model) {
      return R.thread(factions)(
        gameFactionsModel.getModelInfo$(model.state.info),
        R.ifElse(
          R.isNil,
          () => R.prop('state', model),
          (info) => {
            const radius = info.base_radius;
            return R.thread(model.state)(
              R.assoc('x', Math.max(0+radius, Math.min(480-radius, model.state.x))),
              R.assoc('y', Math.max(0+radius, Math.min(480-radius, model.state.y))),
              (state) => R.reduce((state, checker) => {
                return checker(info, target, state);
              }, state, modelModel.state_checkers),
              (state) => R.reduce(function(state, updater) {
                return updater(state);
              }, state, modelModel.state_updaters)
            );
          }
        ),
        (state) => R.assoc('state', state, model)
      );
    }
    function modelModeFor(model) {
      if(modelModel.isCharging(model)) {
        return 'ModelCharge';
      }
      if(modelModel.isPlacing(model)) {
        return 'ModelPlace';
      }
      return 'Model';
    }
    function modelDescriptionFromInfo(info, model) {
      return R.thread(info)(
        R.props(['unit_name', 'name']),
        R.prepend(modelModel.user(model)),
        R.reject(R.isNil),
        R.join('/')
      );
    }
    function initDamage(info) {
      if(info.type === 'warrior') {
        return { n: 0, t: 0 };
      }
      return R.thread(info)(
        R.keys,
        R.reject(R.equals('type')),
        R.reject(R.equals('field')),
        R.reject(R.equals('total')),
        R.reject(R.equals('depth')),
        R.reduce((mem, key) => {
          return R.assoc(key, R.map(R.always(0), info[key]), mem);
        }, {}),
        R.assoc('f', 0),
        R.assoc('t', 0)
      );
    }
    function modelRender({ is_flipped,
                           charge_target
                         }, factions, state) {
      const info = R.thread(factions)(
        gameFactionsModel.getModelInfo$(state.info),
        R.defaultTo({ base_radius: 5.905 })
      );
      const is_wreck = modelModel.isWreckDisplayed({state});
      const img = (is_wreck
                   ? modelModel.getWreckImage(factions, {state})
                   : modelModel.getImage(factions, {state}));
      const cx = img.width / 2;
      const cy = img.height / 2;
      const radius = info.base_radius;
      const dx = cx;
      const dy = cy - info.base_radius;
      const frx = cx - info.base_radius;
      const flx = cx + info.base_radius;
      const los = {
        dy: cy - 700,
        lx: cx - 700,
        rx: cx + 700
      };
      const aura = {
        show: modelModel.isAuraDisplayed({state}),
        radius: radius * 1.2,
        color: modelModel.auraDisplay({state})
      };
      const lock = {
        show: modelModel.isLocked({state}),
        x: cx + radius - 5,
        y: cy - 5
      };
      const state_dmg = R.propOr({}, 'dmg', state);
      const percent_damage = state_dmg.t / info.damage.total;
      const damage_x = cx - radius + 2 * radius * percent_damage;
      const dmg = {
        show: !( info.damage.type === 'warrior' &&
                 info.damage.n === 1),
        lx: cx - radius,
        ly: cy + radius + 2,
        rx: cx + radius,
        ry: cx + radius + 2,
        x: damage_x
      };
      const percent_field = state_dmg.f / info.damage.field;
      const field_x = cx - radius + 2 * radius * percent_field;
      const field = {
        show: R.exists(info.damage.field),
        lx: dmg.lx,
        ly: dmg.ly + 1,
        rx: dmg.rx,
        ry: dmg.ry + 1,
        x: field_x
      };
      const label_options = {
        flipped: is_flipped,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx, y: cx + radius + 8 }
      };
      const label = base
        .renderLabel(label_options, state);
      const counter_options = {
        rotate: 0,
        flipped: is_flipped,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx, y: cy + 2 }
      };
      const counter = base
              .renderText(counter_options, state.c);
      counter.show = modelModel
        .isCounterDisplayed('c', {state});
      const souls_options = {
        rotate: 0,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx + radius * 0.8 + 5,
                       y: cy - radius - 5 }
      };
      const souls = base
              .renderText(souls_options, state.s);
      souls.show = modelModel
        .isCounterDisplayed('s', {state});
      souls.cx = souls.x - 10;
      souls.cy = souls.y - 10;
      const unit_options = {
        rotate: 0,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx - radius * 0.7 - 5,
                       y: cy - radius * 0.7 - 5 }
      };
      const unit = base
              .renderText(unit_options, `U${modelModel.unit({state})}`);
      unit.show = modelModel
        .isUnitDisplayed({state});
      unit.cx = unit.x - 10;
      unit.cy = unit.y - 10;
      const melee = {
        melee: {
          show: modelModel.isMeleeDisplayed('mm', {state}),
          path: computeMeleePath(5, img, info)
        },
        reach: {
          show: modelModel.isMeleeDisplayed('mr', {state}),
          path: computeMeleePath(20, img, info)
        },
        strike: {
          show: modelModel.isMeleeDisplayed('ms', {state}),
          path: computeMeleePath(40, img, info)
        }
      };
      const area = ( modelModel.isAreaDisplayed({state})
                     ? modelModel.areaDisplay({state}) * 10 + radius
                     : null
                   );
      const ctrl = ( modelModel.isCtrlAreaDisplayed(factions, {state})
                     ? (info.focus || info.fury) * 20 + radius
                     : null
                   );
      const effects = R.thread(EFFECTS)(
        R.filter(([key]) => modelModel.isEffectDisplayed(key, {state})),
        (actives) => {
          const base_x = img.width / 2 - (R.length(actives) * 10 / 2);
          const base_y = img.height / 2 + info.base_radius + 1;
          return R.addIndex(R.reduce)((mem, [key, link], i) => {
            return R.assoc(key, {
              show: modelModel.isEffectDisplayed(key, {state}),
              x: base_x + i * 10, y: base_y, link
            }, mem);
          }, {}, actives);
        }
      );
      effects.l = {
        show: modelModel.isLeaderDisplayed({state}),
        link: '/data/icons/Leader.png',
        x: cx - radius * 0.7 - 5,
        y: cy - radius * 0.7 - 5
      };
      const path = { show: false, x: 0, y: 0, transform: '', length: {} };
      const charge_target_ = {};
      if(modelModel.isCharging({state})) {
        path.show = true;

        const charge_dir = state.cha.s.r;
        const charge_middle = pointModel
                .translateInDirection(400, charge_dir, state.cha.s);
        path.x = charge_middle.x - radius;
        path.y = charge_middle.y - 400;
        path.transform = `rotate(${charge_dir},${charge_middle.x},${charge_middle.y})`;

        const charge_length = pointModel.distanceTo(state, state.cha.s);
        let charge_text = `${Math.round(charge_length*10)/100}"`;
        const charge_max_dist = modelModel.chargeMaxLength({state});
        if(R.exists(charge_max_dist)) {
          charge_text += `/${charge_max_dist}"`;
        }
        const charge_options = {
          rotate: 0,
          flip_center: state.cha.s,
          text_center: state.cha.s
        };
        const charge_label = base
                .renderText(charge_options, charge_text);
        charge_label.show = true;
        path.length = charge_label;

        if(charge_target) {
          charge_target_.show = true;
          charge_target_.cx = charge_target.state.x;
          charge_target_.cy = charge_target.state.y;
          charge_target_.radius = charge_target.info.base_radius;

          let melee_range = 0;
          if(modelModel.isMeleeDisplayed('mm', {state})) {
            melee_range = 5;
          }
          if(modelModel.isMeleeDisplayed('mr', {state})) {
            melee_range = 20;
          }
          if(modelModel.isMeleeDisplayed('ms', {state})) {
            melee_range = 40;
          }
          const distance_to_target = pointModel
                  .distanceTo(charge_target.state, state);
          charge_target_.reached = distance_to_target <=
            melee_range + radius + charge_target.info.base_radius;
        }
      }
      if(modelModel.isPlacing({state})) {
        path.show = true;

        const place_dir = state.pla.s.r;
        const place_middle = pointModel
                .translateInDirection(400, place_dir, state.pla.s);
        path.x = place_middle.x - info.base_radius;
        path.y = place_middle.y - 400;
        path.transform = `rotate(${place_dir},${place_middle.x},${place_middle.y})`;

        const place_length = pointModel.distanceTo(state, state.pla.s);
        let place_text = `${Math.round(place_length*10)/100}"`;
        const within = modelModel.placeWithin({state});
        const place_max_dist = modelModel.placeMaxLength({state});
        if(R.exists(place_max_dist)) {
          place_text += `/${within ? 'w.' : ''}${place_max_dist}"`;
        }
        const place_options = {
          rotate: 0,
          flip_center: state.pla.s,
          text_center: state.pla.s
        };
        const place_label = base
                .renderText(place_options, place_text);
        place_label.show = true;
        path.length = place_label;
      }
      return {
        stamp: state.stamp,
        x: state.x, y: state.y,
        transform: [ `translate(${state.x-cx},${state.y-cy})`,
                     `rotate(${state.r},${cx},${cy})`
                   ].join(' '),
        cx, cy, radius, dx, dy, frx, flx, los,
        width: img.width, height: img.height,
        img: img.link,
        base_color: info.base_color,
        title: modelModel.descriptionFromInfo(info, {state}),
        area, ctrl, aura, lock, dmg, field, label,
        counter, souls, melee, effects, unit,
        path, charge_target: charge_target_
      };
    }
    function computeMeleePath(size, img, info) {
      return [
        `M${img.width/2-info.base_radius-size},${img.height/2}`,
        `L${img.width/2+info.base_radius+size},${img.height/2}`,
        `A${info.base_radius+size},${info.base_radius+size} 0 0,0`,
        `${img.width/2-info.base_radius-size},${img.height/2}`,
        `M${img.width/2},${img.height/2}`,
        `L${img.width/2},${img.height/2-info.base_radius-size}`,
      ].join(' ');
    }
  }
})();
