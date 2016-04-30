(function() {
  angular.module('clickApp.services')
    .factory('model', modelModelFactory);

  modelModelFactory.$inject = [
    'settings',
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
      const lock = {
        show: modelModel.isLocked({state}),
        x: cx + radius - 5,
        y: cy - 5
      };
      const path = { show: false, x: 0, y: 0, transform: '', length: {} };
      const label_options = {
        flipped: is_flipped,
        flip_center: { x: cx, y: cy },
        text_center: { x: cx, y: cx + radius + 8 }
      };
      const label = base
              .renderLabel(label_options, state);
      return R.deepExtend(
        {
          stamp: state.stamp,
          x: state.x, y: state.y,
          transform: [ `translate(${state.x-cx},${state.y-cy})`,
                       `rotate(${state.r},${cx},${cy})`
                     ].join(' '),
          cx, cy, radius, dx, dy, frx, flx, los,
          width: img.width, height: img.height,
          base_color: info.base_color,
          title: modelModel.descriptionFromInfo(info, {state}),
          label, lock, path
        },
        modelModel.renderArea({ info, radius }, factions, state),
        modelModel.renderAura({ radius }, state),
        modelModel.renderCharge({ base, charge_target, radius }, path, state),
        modelModel.renderCounter({ base, cx, cy, is_flipped, radius }, state),
        modelModel.renderDamage({ cx, cy, info, radius }, state),
        modelModel.renderEffect({ img, info }, state),
        modelModel.renderImage({ img }, state),
        modelModel.renderLeader({ cx, cy, radius }, state),
        modelModel.renderMelee({ img, info }, state),
        modelModel.renderPlace({ base, info, path }, state),
        modelModel.renderUnit({ base, cx, cy, radius }, state)
      );
    }
  }
})();
