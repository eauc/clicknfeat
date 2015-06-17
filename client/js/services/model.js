'use strict';

self.modelServiceFactory = function modelServiceFactory(settingsService,
                                                        pointService,
                                                        gameFactionsService) {
  var DEFAULT_MOVES = {
    Move: 10,
    MoveSmall: 5,
    Rotate: 15,
    RotateSmall: 5,
    Shift: 10,
    ShiftSmall: 1,
  };
  var MOVES = R.clone(DEFAULT_MOVES);
  settingsService.register('Moves',
                           'Model',
                           DEFAULT_MOVES,
                           function(moves) {
                             R.extend(MOVES, moves);
                           });
  var modelService = {
    create: function modelCreate(factions, temp) {
      var info = gameFactionsService.getModelInfo(temp.info, factions);
      if(R.isNil(info)) {
        console.log('create unknown model '+temp.info.join('.'));
        return;
      }
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
          dmg: initDamage(info.damage),
          stamp: R.guid()
        }
      };
      if(info.type === 'wardude' ||
         info.type === 'beast' ||
         info.type === 'jack') {
        model.state.dsp = R.append('c', model.state.dsp);
      }
      model.state = R.deepExtend(model.state, temp);
      return model;
    },
    eventName: function modelEventName(model) {
      return R.path(['state','stamp'], model);
    },
    state: function modelState(model) {
      return R.prop('state', model);
    },
    saveState: function modelSaveState(model) {
      return R.clone(R.prop('state', model));
    },
    setState: function modelSetState(state, model) {
      model.state = R.clone(state);
    },
    isBetweenPoints: function modelIsBetweenPoints(top_left, bottom_right, model) {
      return ( top_left.x <= model.state.x && model.state.x <= bottom_right.x &&
               top_left.y <= model.state.y && model.state.y <= bottom_right.y
             );
    },
    isImageDisplayed: function modelIsImageDisplayed(model) {
      return !!R.find(R.eq('i'), model.state.dsp);
    },
    getImage: function modelGetImage(factions, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var link = modelService.isImageDisplayed(model) ? info.img[model.state.img].link : null;
      return R.assoc('link', link, info.img[model.state.img]);
    },
    setNextImage: function modelSetNextImage(factions, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var next_img = (model.state.img >= info.img.length-1) ? 0 : model.state.img+1;
      model.state = R.assoc('img', next_img, model.state);
    },
    toggleImageDisplay: function modelToggleImageDisplay(model) {
      if(modelService.isImageDisplayed(model)) {
        model.state.dsp = R.reject(R.eq('i'), model.state.dsp);
      }
      else {
        model.state.dsp = R.append('i', model.state.dsp);
      }
    },
    checkState: function modelCheckState(factions, state) {
      var info = gameFactionsService.getModelInfo(state.info, factions);
      var radius = info.base_radius;
      state.x = Math.max(0+radius, Math.min(480-radius, state.x));
      state.y = Math.max(0+radius, Math.min(480-radius, state.y));
      return state;
    },
    setPosition: function modelSet(factions, pos, model) {
      model.state = R.pipe(
        R.assoc('x', pos.x),
        R.assoc('y', pos.y),
        modelService.checkState$(factions)
      )(model.state);
    },
    setOrientation: function modelSet(factions, orientation, model) {
      model.state = R.pipe(
        R.assoc('r', orientation),
        modelService.checkState$(factions)
      )(model.state);
    },
    orientTo: function modelSet(factions, other, model) {
      model.state = R.pipe(
        R.assoc('r', pointService.directionTo(other.state, model.state)),
        modelService.checkState$(factions)
      )(model.state);
    },
    shiftPosition: function modelSet(factions, shift, model) {
      model.state = R.pipe(
        R.assoc('x', model.state.x + shift.x),
        R.assoc('y', model.state.y + shift.y),
        modelService.checkState$(factions)
      )(model.state);
    },
    moveFront: function modelMoveFront(factions, small, model) {
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      model.state = R.pipe(
        pointService.moveFront$(dist),
        modelService.checkState$(factions)
      )(model.state);
    },
    moveBack: function modelMoveBack(factions, small, model) {
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      model.state = R.pipe(
        pointService.moveBack$(dist),
        modelService.checkState$(factions)
      )(model.state);
    },
    rotateLeft: function modelRotateLeft(factions, small, model) {
      var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
      model.state = R.pipe(
        pointService.rotateLeft$(angle),
        modelService.checkState$(factions)
      )(model.state);
    },
    rotateRight: function modelRotateRight(factions, small, model) {
      var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
      model.state = R.pipe(
        pointService.rotateRight$(angle),
        modelService.checkState$(factions)
      )(model.state);
    },
    shiftLeft: function modelShiftLeft(factions, small, model) {
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftLeft$(dist),
        modelService.checkState$(factions)
      )(model.state);
    },
    shiftRight: function modelShiftRight(factions, small, model) {
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftRight$(dist),
        modelService.checkState$(factions)
      )(model.state);
    },
    shiftUp: function modelShiftUp(factions, small, model) {
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftUp$(dist),
        modelService.checkState$(factions)
      )(model.state);
    },
    shiftDown: function modelShiftDown(factions, small, model) {
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftDown$(dist),
        modelService.checkState$(factions)
      )(model.state);
    },
    resetDamage: function modelResetDamage(model) {
      model.state.dmg = R.pipe(
        R.keys,
        R.reduce(function(mem, key) {
          var value = model.state.dmg[key];
          if('Array' === R.type(value)) {
            value = R.map(R.always(0), value);
          }
          else {
            value = 0;
          }
          return R.assoc(key, value, mem);
        }, {})
      )(model.state.dmg);
    },
    setWarriorDamage: function modelSetWarriorDamage(factions, i, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var value = R.defaultTo(0, model.state.dmg.n);
      value = (value === i) ? 0 : i;
      value = Math.min(value, info.damage.n);
      model.state.dmg = R.pipe(
        R.assoc('n', value),
        R.assoc('t', value)
      )(model.state.dmg);
    },
    setFieldDamage: function modelSetFieldDamage(factions, i, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var value = R.defaultTo(0, model.state.dmg.f);
      value = (value === i) ? 0 : i;
      value = Math.min(value, info.damage.field);
      model.state.dmg = R.assoc('f', value, model.state.dmg);
    },
    setGridDamage: function modelSetGridDamage(factions, line, col, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var value = model.state.dmg[col][line];
      value = (value === 0) ? 1 : 0;
      value = R.exists(info.damage[col][line]) ? value : 0;
      model.state.dmg[col][line] = value;
      model.state.dmg.t = computeTotalGridDamage(model.state.dmg);
    },
    setGridColDamage: function modelSetGridColDamage(factions, col, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var full = R.pipe(
        R.filterIndexed(function(val, line) {
          return R.exists(info.damage[col][line]);
        }),
        R.reject(R.eq(1)),
        R.isEmpty
      )(model.state.dmg[col]);
      var value = full ? 0 : 1;
      model.state.dmg[col] = R.mapIndexed(function(val, line) {
        return R.exists(info.damage[col][line]) ? value : 0;
      }, model.state.dmg[col]);
      model.state.dmg.t = computeTotalGridDamage(model.state.dmg);
    },
    addLabel: function modelAddLabel(label, model) {
      model.state.l = R.uniq(R.append(label, model.state.l));
    },
    removeLabel: function modelRemoveLabel(label, model) {
      model.state.l = R.reject(R.eq(label), model.state.l);
    },
    fullLabel: function modelFullLabel(model) {
      return model.state.l.join(' ');
    },
    isCounterDisplayed: function modelIsCounterDisplayed(counter, model) {
      return !!R.find(R.eq(counter), model.state.dsp);
    },
    incrementCounter: function modelIncrementCounter(counter, model) {
      var value = R.defaultTo(0, model.state[counter]) + 1;
      model.state = R.assoc(counter, value, model.state);
    },
    decrementCounter: function modelDecrementCounter(counter, model) {
      var value = Math.max(0, R.defaultTo(0, model.state[counter]) - 1);
      model.state = R.assoc(counter, value, model.state);
    },
    toggleCounterDisplay: function modelToggleCounterDisplay(counter, model) {
      if(modelService.isCounterDisplayed(counter, model)) {
        model.state.dsp = R.reject(R.eq(counter), model.state.dsp);
      }
      else {
        model.state.dsp = R.append(counter, model.state.dsp);
      }
    },
    isLeaderDisplayed: function modelIsLeaderDisplayed(model) {
      return !!R.find(R.eq('l'), model.state.dsp);
    },
    toggleLeaderDisplay: function modelToggleLeaderDisplay(model) {
      if(modelService.isLeaderDisplayed(model)) {
        model.state.dsp = R.reject(R.eq('l'), model.state.dsp);
      }
      else {
        model.state.dsp = R.append('l', model.state.dsp);
      }
    },
    isEffectDisplayed: function modelIsEffectDisplayed(effect, model) {
      return !!R.find(R.eq(effect), R.defaultTo([], model.state.eff));
    },
    toggleEffectDisplay: function modelToggleEffectDisplay(effect, model) {
      if(modelService.isEffectDisplayed(effect, model)) {
        model.state.eff = R.reject(R.eq(effect), R.defaultTo([], model.state.eff));
      }
      else {
        model.state.eff = R.append(effect, R.defaultTo([], model.state.eff));
      }
    },
    isAuraDisplayed: function modelIsAuraDisplayed(model) {
      return R.exists(model.state.aur);
    },
    toggleAuraDisplay: function modelToggleAuraDisplay(aura, model) {
      model.state.aur = (aura === model.state.aur) ? null : aura;
    },
    isCtrlAreaDisplayed: function modelIsCtrlAreaDisplayed(factions, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      return ( info.type === 'wardude' &&
               ( 'Number' === R.type(info.focus) ||'Number' === R.type(info.fury) ) &&
               !!R.find(R.eq('a'), model.state.dsp)
             );
    },
    toggleCtrlAreaDisplay: function modelToggleCtrlAreaDisplay(model) {
      if(!!R.find(R.eq('a'), model.state.dsp)) {
        model.state.dsp = R.reject(R.eq('a'), model.state.dsp);
      }
      else {
        model.state.dsp = R.append('a', model.state.dsp);
      }
    },
    isAreaDisplayed: function modelIsAreaDisplayed(model) {
      return R.exists(model.state.are);
    },
    toggleAreaDisplay: function modelToggleAreaDisplay(area, model) {
      model.state.are = (area === model.state.are) ? null : area;
    },
    shortestLineTo: function modelShortestLineTo(factions, other, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var other_info = gameFactionsService.getModelInfo(other.state.info, factions);
      
      var direction = pointService.directionTo(other.state, model.state);
      var start = pointService.translateInDirection(info.base_radius,
                                                    direction,
                                                    model.state);
      var end = pointService.translateInDirection(other_info.base_radius,
                                                  direction+180,
                                                  other.state);
      return { start: R.pick(['x','y'], start),
               end: R.pick(['x','y'], end)
             };
    },
    rulerMaxLength: function modelRulerMaxLength(model) {
      return R.path(['state','rml'], model);
    },
    setRulerMaxLength: function modelSetRulerMaxLength(value, model) {
      model.state = R.assoc('rml', value, model.state);
    },
    isMeleeDisplayed: function modelIsMeleeDisplayed(melee, model) {
      return !!R.find(R.eq(melee), model.state.dsp);
    },
    toggleMeleeDisplay: function modelToggleMeleeDisplay(melee, model) {
      if(modelService.isMeleeDisplayed(melee, model)) {
        model.state.dsp = R.reject(R.eq(melee), model.state.dsp);
      }
      else {
        model.state.dsp = R.append(melee, model.state.dsp);
      }
    },
    baseEdgeInDirection: function modelBaseEdgeInDirection(factions, dir, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      return R.pipe(
        pointService.translateInDirection$(info.base_radius, dir),
        R.pick(['x','y'])
      )(model.state);
    },
    isUnitDisplayed: function modelIsUnitDisplayed(model) {
      return !!R.find(R.eq('u'), model.state.dsp);
    },
    unit: function modelUnit(model) {
      return R.prop('u', model.state);
    },
    setUnit: function modelSetUnit(unit, model) {
      model.state = R.assoc('u', unit, model.state);
    },
    toggleUnitDisplay: function modelToggleUnitDisplay(model) {
      if(modelService.isUnitDisplayed(model)) {
        model.state.dsp = R.reject(R.eq('u'), model.state.dsp);
      }
      else {
        model.state.dsp = R.append('u', model.state.dsp);
      }
    },
  };
  function initDamage(info) {
    if(info.type === 'warrior') {
      return { n: 0, t: 0 };
    }
    return R.pipe(
      R.keys,
      R.reject(R.eq('type')),
      R.reject(R.eq('field')),
      R.reject(R.eq('total')),
      R.reject(R.eq('depth')),
      R.reduce(function(mem, key) {
        return R.assoc(key, R.map(R.always(0), info[key]), mem);
      }, {}),
      R.assoc('f', 0),
      R.assoc('t', 0)
    )(info);
  }
  function computeTotalGridDamage(damage) {
    return R.pipe(
      R.keys,
      R.reject(R.eq('t')),
      R.reject(R.eq('f')),
      R.reject(R.eq('n')),
      R.reduce(function(mem, col) {
        return mem + R.reduce(R.add, 0, damage[col]);
      }, 0)
    )(damage);
  }
  R.curryService(modelService);
  return modelService;
};
