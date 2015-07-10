'use strict';

self.modelServiceFactory = function modelServiceFactory(settingsService,
                                                        pointService,
                                                        gameFactionsService) {
  var CHARGE_EPSILON = 0.1;
  var DEFAULT_MOVES = {
    Move: 10,
    MoveSmall: 5,
    Rotate: 15,
    RotateSmall: 5,
    Shift: 10,
    ShiftSmall: 1,
    RotateCharge: 10,
    RotateChargeSmall: 2,
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
        model.state.dsp = R.append('lk', model.state.dsp);
      }
      model.state = R.deepExtend(model.state, temp);
      return model;
    },
    stamp: function modelStamp(model) {
      return R.path(['state','stamp'], model);
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
    user: function modelUser(model) {
      return R.path(['state', 'user'], model);
    },
    userIs: function modelUser(user, model) {
      return R.pathEq(['state', 'user'], user, model);
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
      var imgs = R.filter(R.propEq('type','default'), info.img);
      var img = imgs[model.state.img];
      if(modelService.isLeaderDisplayed(model)) {
        var leaders = R.filter(R.propEq('type','leader'), info.img);
        if(!R.isEmpty(leaders)) {
          img = R.head(leaders);
        }
      }
      if(modelService.isIncorporealDisplayed(model)) {
        var incorps = R.filter(R.propEq('type','incorporeal'), info.img);
        if(!R.isEmpty(incorps)) {
          img = R.head(incorps);
        }
      }
      var link = modelService.isImageDisplayed(model) ? img.link : null;
      return R.assoc('link', link, img);
    },
    setNextImage: function modelSetNextImage(factions, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var imgs = R.filter(R.propEq('type','default'), info.img);
      var next_img = (model.state.img >= imgs.length-1) ? 0 : model.state.img+1;
      model.state = R.assoc('img', next_img, model.state);
    },
    setImageDisplay: function modelSetImageDisplay(set, model) {
      if(set) {
        model.state.dsp = R.uniq(R.append('i', model.state.dsp));
      }
      else {
        model.state.dsp = R.reject(R.eq('i'), model.state.dsp);
      }
    },
    toggleImageDisplay: function modelToggleImageDisplay(model) {
      if(modelService.isImageDisplayed(model)) {
        model.state.dsp = R.reject(R.eq('i'), model.state.dsp);
      }
      else {
        model.state.dsp = R.append('i', model.state.dsp);
      }
    },
    isWreckDisplayed: function modelIsWreckDisplayed(model) {
      return !!R.find(R.eq('w'), model.state.dsp);
    },
    getWreckImage: function modelGetWreckImage(factions, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var img = R.find(R.propEq('type','wreck'), info.img);
      if(R.isNil(img)) {
        img = R.find(R.propEq('type','default'), info.img);
        img = R.assoc('link', null, img);
      }
      var link = modelService.isImageDisplayed(model) ? img.link : null;
      return R.assoc('link', link, img);
    },
    setWreckDisplay: function modelSetWreckDisplay(set, model) {
      if(set) {
        model.state.dsp = R.uniq(R.append('w', model.state.dsp));
      }
      else {
        model.state.dsp = R.reject(R.eq('w'), model.state.dsp);
      }
    },
    toggleWreckDisplay: function modelToggleWreckDisplay(model) {
      if(modelService.isWreckDisplayed(model)) {
        model.state.dsp = R.reject(R.eq('w'), model.state.dsp);
      }
      else {
        model.state.dsp = R.append('w', model.state.dsp);
      }
    },
    checkState: function modelCheckState(factions, target, state) {
      var info = gameFactionsService.getModelInfo(state.info, factions);
      var radius = info.base_radius;
      return R.pipe(
        R.assoc('x', Math.max(0+radius, Math.min(480-radius, state.x))),
        R.assoc('y', Math.max(0+radius, Math.min(480-radius, state.y))),
        ensurePlaceLength$(info),
        ensureChargeLength,
        ensureChargeOrientation$(target),
        updatePlaceDirection,
        updateChargeDirection
      )(state);
    },
    setPosition: function modelSet(factions, pos, model) {
      if(modelService.isLocked(model)) return;
      model.state = R.pipe(
        R.assoc('x', pos.x),
        R.assoc('y', pos.y),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    setOrientation: function modelSet(factions, orientation, model) {
      if(modelService.isLocked(model)) return;
      model.state = R.pipe(
        R.assoc('r', orientation),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    orientTo: function modelSet(factions, other, model) {
      if(modelService.isLocked(model)) return;
      model.state = R.pipe(
        R.assoc('r', pointService.directionTo(other.state, model.state)),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    shiftPosition: function modelSet(factions, shift, model) {
      if(modelService.isLocked(model)) return;
      model.state = R.pipe(
        R.assoc('x', model.state.x + shift.x),
        R.assoc('y', model.state.y + shift.y),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    moveFront: function modelMoveFront(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      model.state = R.pipe(
        pointService.moveFront$(dist),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    moveBack: function modelMoveBack(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      model.state = R.pipe(
        pointService.moveBack$(dist),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    rotateLeft: function modelRotateLeft(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
      model.state = R.pipe(
        pointService.rotateLeft$(angle),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    rotateRight: function modelRotateRight(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
      model.state = R.pipe(
        pointService.rotateRight$(angle),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    shiftLeft: function modelShiftLeft(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftLeft$(dist),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    shiftRight: function modelShiftRight(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftRight$(dist),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    shiftUp: function modelShiftUp(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftUp$(dist),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    shiftDown: function modelShiftDown(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftDown$(dist),
        modelService.checkState$(factions, null)
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
    setCounterDisplay: function modelSetCounterDisplay(counter, set, model) {
      if(set) {
        model.state.dsp = R.uniq(R.append(counter, model.state.dsp));
      }
      else {
        model.state.dsp = R.reject(R.eq(counter), model.state.dsp);
      }
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
    setLeaderDisplay: function modelSetLeaderDisplay(set, model) {
      if(set) {
        model.state.dsp = R.uniq(R.append('l', model.state.dsp));
      }
      else {
        model.state.dsp = R.reject(R.eq('l'), model.state.dsp);
      }
    },
    toggleLeaderDisplay: function modelToggleLeaderDisplay(model) {
      if(modelService.isLeaderDisplayed(model)) {
        model.state.dsp = R.reject(R.eq('l'), model.state.dsp);
      }
      else {
        model.state.dsp = R.append('l', model.state.dsp);
      }
    },
    isIncorporealDisplayed: function modelIsIncorporealDisplayed(model) {
      return !!R.find(R.eq('in'), model.state.dsp);
    },
    setIncorporealDisplay: function modelSetIncorporealDisplay(set, model) {
      if(set) {
        model.state.dsp = R.uniq(R.append('in', model.state.dsp));
      }
      else {
        model.state.dsp = R.reject(R.eq('in'), model.state.dsp);
      }
    },
    toggleIncorporealDisplay: function modelToggleIncorporealDisplay(model) {
      if(modelService.isIncorporealDisplayed(model)) {
        model.state.dsp = R.reject(R.eq('in'), model.state.dsp);
      }
      else {
        model.state.dsp = R.append('in', model.state.dsp);
      }
    },
    isEffectDisplayed: function modelIsEffectDisplayed(effect, model) {
      return !!R.find(R.eq(effect), R.defaultTo([], model.state.eff));
    },
    setEffectDisplay: function modelSetEffectDisplay(effect, set, model) {
      if(set) {
        model.state.eff = R.uniq(R.append(effect, R.defaultTo([], model.state.eff)));
      }
      else {
        model.state.eff = R.reject(R.eq(effect), R.defaultTo([], model.state.eff));
      }
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
    auraDisplay: function modelAuraDisplay(model) {
      return model.state.aur;
    },
    setAuraDisplay: function modelSetAuraDisplay(aura, model) {
      model.state.aur = aura;
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
    setCtrlAreaDisplay: function modelSetCtrlAreaDisplay(set, model) {
      if(set) {
        model.state.dsp = R.uniq(R.append('a', model.state.dsp));
      }
      else {
        model.state.dsp = R.reject(R.eq('a'), model.state.dsp);
      }
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
    areaDisplay: function modelAreaDisplay(model) {
      return model.state.are;
    },
    setAreaDisplay: function modelSetAreaDisplay(area, model) {
      model.state.are = area;
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
    setMeleeDisplay: function modelSetMeleeDisplay(melee, set, model) {
      if(set) {
        model.state.dsp = R.uniq(R.append(melee, model.state.dsp));
      }
      else {
        model.state.dsp = R.reject(R.eq(melee), model.state.dsp);
      }
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
    unitIs: function modelUnit(unit, model) {
      return R.propEq('u', unit, model.state);
    },
    setUnit: function modelSetUnit(unit, model) {
      model.state = R.assoc('u', unit, model.state);
    },
    setUnitDisplay: function modelSetUnitDisplay(set, model) {
      if(set) {
        model.state.dsp = R.uniq(R.append('u', model.state.dsp));
      }
      else {
        model.state.dsp = R.reject(R.eq('u'), model.state.dsp);
      }
    },
    toggleUnitDisplay: function modelToggleUnitDisplay(model) {
      if(modelService.isUnitDisplayed(model)) {
        model.state.dsp = R.reject(R.eq('u'), model.state.dsp);
      }
      else {
        model.state.dsp = R.append('u', model.state.dsp);
      }
    },
    startCharge: function modelStartCharge(model) {
      if(modelService.isLocked(model)) return;
      model.state = R.assoc('cha', {
        s: R.pick(['x','y','r'], model.state),
        t: null
      }, model.state);
    },
    isCharging: function modelIsCharging(model) {
      return R.exists(model.state.cha);
    },
    chargeTarget: function modelChargeTarget(model) {
      if(!modelService.isCharging(model)) return null;
      return R.path(['state','cha','t'], model);
    },
    endCharge: function modelEndCharge(model) {
      model.state = R.assoc('cha', null, model.state);
    },
    setChargeTarget: function modelSetChargeTarget(factions, other, model) {
      if(modelService.isLocked(model)) return;
      model.state.cha = R.assoc('t', other.state.stamp, model.state.cha);
      model.state = R.pipe(
        R.assoc('r', pointService.directionTo(other.state, model.state)),
        modelService.checkState$(factions, other)
      )(model.state);
    },
    chargeMaxLength: function modelChargeMaxLength(model) {
      return R.path(['state','cml'], model);
    },
    setChargeMaxLength: function modelSetChargeMaxLength(value, model) {
      model.state = R.assoc('cml', value, model.state);
    },
    moveFrontCharge: function modelMoveFrontCharge(factions, target, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      var direction = model.state.cha.s.r;
      var distance = pointService.distanceTo(model.state, model.state.cha.s);
      model.state = R.pipe(
        pointService.translateInDirection$(dist, direction), 
        modelService.checkState$(factions, target)
      )(model.state);
    },
    moveBackCharge: function modelMoveBackCharge(factions, target, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      var direction = model.state.cha.s.r+180;
      var distance = pointService.distanceTo(model.state, model.state.cha.s);
      if(dist > distance) dist = distance;
      model.state = R.pipe(
        pointService.translateInDirection$(dist, direction),
        modelService.checkState$(factions, target)
      )(model.state);
    },
    rotateLeftCharge: function modelRotateLeftCharge(factions, target, small, model) {
      if(modelService.isLocked(model)) return;
      var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
      model.state = R.pipe(
        pointService.rotateLeftAround$(angle, model.state.cha.s),
        R.assocPath(['cha','s','r'], model.state.cha.s.r-angle),
        modelService.checkState$(factions, target)
      )(model.state);
    },
    rotateRightCharge: function modelRotateRightCharge(factions, target, small, model) {
      if(modelService.isLocked(model)) return;
      var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
      model.state = R.pipe( 
        pointService.rotateRightAround$(angle, model.state.cha.s),
        R.assocPath(['cha','s','r'], model.state.cha.s.r+angle),
        modelService.checkState$(factions, target)
      )(model.state);
    },
    shiftLeftCharge: function modelShiftLeftCharge(factions, target, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftLeft$(dist),
        modelService.checkState$(factions, target)
      )(model.state);
    },
    shiftRightCharge: function modelShiftRightCharge(factions, target, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftRight$(dist),
        modelService.checkState$(factions, target)
      )(model.state);
    },
    shiftUpCharge: function modelShiftUpCharge(factions, target, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftUp$(dist),
        modelService.checkState$(factions, target)
      )(model.state);
    },
    shiftDownCharge: function modelShiftDownCharge(factions, target, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftDown$(dist),
        modelService.checkState$(factions, target)
      )(model.state);
    },
    startPlace: function modelStartPlace(model) {
      if(modelService.isLocked(model)) return;
      model.state = R.assoc('pla', {
        s: R.pick(['x','y','r'], model.state)
      }, model.state);
    },
    isPlacing: function modelIsPlarging(model) {
      return R.exists(model.state.pla);
    },
    endPlace: function modelEndPlace(model) {
      model.state = R.assoc('pla', null, model.state);
    },
    setPlaceOrigin: function modelSetPlaceOrigin(factions, other, model) {
      if(modelService.isLocked(model)) return;
      var direction = pointService.directionTo(model.state.pla.s, other.state);
      model.state = R.pipe(
        pointService.rotateAroundTo$(direction, model.state.pla.s),
        R.assocPath(['pla','s','r'], direction),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    setPlaceTarget: function modelSetPlaceTarget(factions, other, model) {
      if(modelService.isLocked(model)) return;
      var direction = pointService.directionTo(other.state, model.state.pla.s);
      model.state = R.pipe(
        pointService.rotateAroundTo$(direction, model.state.pla.s),
        R.assocPath(['pla','s','r'], direction),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    placeMaxLength: function modelPlaceMaxLength(model) {
      return R.head(R.path(['state','pml'], model));
    },
    setPlaceMaxLength: function modelSetPlaceMaxLength(value, model) {
      model.state = R.assoc('pml', [ value, model.state.pml[1] ], model.state);
    },
    placeWithin: function modelPlaceWithin(model) {
      return R.nth(1, R.defaultTo([], R.path(['state','pml'], model)));
    },
    setPlaceWithin: function modelSetPlaceWithin(value, model) {
      model.state = R.assoc('pml', [ model.state.pml[0], value ], model.state);
    },
    moveFrontPlace: function modelMoveFrontPlace(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      var direction = model.state.pla.s.r;
      var distance = pointService.distanceTo(model.state, model.state.pla.s);
      model.state = R.pipe(
        pointService.translateInDirection$(dist, direction), 
        modelService.checkState$(factions, null)
      )(model.state);
    },
    moveBackPlace: function modelMoveBackPlace(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      var direction = model.state.pla.s.r+180;
      var distance = pointService.distanceTo(model.state, model.state.pla.s);
      if(dist > distance) dist = distance;
      model.state = R.pipe(
        pointService.translateInDirection$(dist, direction),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    rotateLeftPlace: function modelRotateLeftPlace(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
      model.state = R.pipe(
        pointService.rotateLeftAround$(angle, model.state.pla.s),
        R.assocPath(['pla','s','r'], model.state.pla.s.r - angle),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    rotateRightPlace: function modelRotateRightPlace(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var angle = MOVES[small ? 'RotateChargeSmall' : 'RotateCharge'];
      model.state = R.pipe( 
        pointService.rotateRightAround$(angle, model.state.pla.s),
        R.assocPath(['pla','s','r'], model.state.pla.s.r + angle),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    shiftLeftPlace: function modelShiftLeftPlace(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftLeft$(dist),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    shiftRightPlace: function modelShiftRightPlace(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftRight$(dist),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    shiftUpPlace: function modelShiftUpPlace(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftUp$(dist),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    shiftDownPlace: function modelShiftDownPlace(factions, small, model) {
      if(modelService.isLocked(model)) return;
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      model.state = R.pipe(
        pointService.shiftDown$(dist),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    distanceTo: function modelDistanceTo(factions, other, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var other_info = gameFactionsService.getModelInfo(other.state.info, factions);
      return ( pointService.distanceTo(other.state, model.state) -
               info.base_radius -
               other_info.base_radius
             );
    },
    distanceToAoE: function modelDistanceToAoE(factions, aoe, model) {
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var aoe_size = aoe.state.s;
      return ( pointService.distanceTo(aoe.state, model.state) -
               info.base_radius -
               aoe_size
             );
    },
    setB2B: function modelSetB2B(factions, other, model) {
      if(modelService.isLocked(model)) return;
      var direction = pointService.directionTo(model.state, other.state); 
      var info = gameFactionsService.getModelInfo(model.state.info, factions);
      var other_info = gameFactionsService.getModelInfo(other.state.info, factions);
      var distance = info.base_radius + other_info.base_radius;
      var position = pointService.translateInDirection(distance, direction,
                                                       other.state);
      model.state = R.pipe(
        R.assoc('x', position.x),
        R.assoc('y', position.y),
        modelService.checkState$(factions, null)
      )(model.state);
    },
    isLocked: function modelIsLocked(model) {
      return !!R.find(R.eq('lk'), R.defaultTo([], R.path(['state', 'dsp'], model)));
    },
    setLock: function modelSetLock(set, model) {
      if(set) {
        model.state.dsp = R.uniq(R.append('lk', model.state.dsp));
      }
      else {
        model.state.dsp = R.reject(R.eq('lk'), model.state.dsp);
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
  function ensurePlaceLength(info, state) {
    if(R.exists(state.pla) &&
       R.exists(state.pml) &&
       state.pml > 0) {
      var distance = pointService.distanceTo(state, state.pla.s);
      var max_dist = state.pml[0] * 10 + (state.pml[1] ? info.base_radius * 2 : 0);
      if(distance > max_dist) {
        var direction = pointService.directionTo(state, state.pla.s);
        var position = pointService.translateInDirection(max_dist, direction,
                                                         state.pla.s);
        return R.pipe(
          R.assoc('x', position.x),
          R.assoc('y', position.y)
        )(state);
      }
    }
    return state;
  }
  var ensurePlaceLength$ = R.curry(ensurePlaceLength);
  function ensureChargeLength(state) {
    if(R.exists(state.cha) &&
       R.exists(state.cml) &&
       state.cml > 0) {
      var distance = pointService.distanceTo(state, state.cha.s);
      if(distance > state.cml*10) {
        var direction = pointService.directionTo(state, state.cha.s);
        var position = pointService.translateInDirection(state.cml*10, direction,
                                                         state.cha.s);
        return R.pipe(
          R.assoc('x', position.x),
          R.assoc('y', position.y)
        )(state);
      }
    }
    return state;
  }
  function ensureChargeOrientation(target, state) {
    if(R.exists(state.cha)) {
      if(R.exists(target)) {
        return R.assoc('r', pointService.directionTo(target.state, state), state);
      }
      var distance = pointService.distanceTo(state, state.cha.s);
      var direction = CHARGE_EPSILON > distance ? state.r :
          pointService.directionTo(state, state.cha.s);
      return R.assoc('r', direction, state);
    }
    return state;
  }
  function updateChargeDirection(state) {
    if(R.exists(state.cha)) {
      var distance = pointService.distanceTo(state, state.cha.s);
      if(distance > CHARGE_EPSILON) {
        var direction = pointService.directionTo(state, state.cha.s);
        return R.assocPath(['cha','s','r'], direction, state);
      }
    }
    return state;
  }
  function updatePlaceDirection(state) {
    if(R.exists(state.pla)) {
      var distance = pointService.distanceTo(state, state.pla.s);
      if(distance > CHARGE_EPSILON) {
        var direction = pointService.directionTo(state, state.pla.s);
        return R.assocPath(['pla','s','r'], direction, state);
      }
    }
    return state;
  }
  var ensureChargeOrientation$ = R.curry(ensureChargeOrientation);
  R.curryService(modelService);
  return modelService;
};
