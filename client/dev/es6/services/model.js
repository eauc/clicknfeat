'use strict';

angular.module('clickApp.services')
  .factory('model', [
    'settings',
    'point',
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
    'modelLabel',
    'modelLeader',
    'modelMelee',
    'modelMove',
    'modelPlace',
    'modelRuler',
    'modelUnit',
    'modelWreck',
    function modelServiceFactory(settingsService,
                                 pointService,
                                 gameFactionsService,
                                 modelAreaService,  
                                 modelAuraService,  
                                 modelChargeService,  
                                 modelCounterService,  
                                 modelDamageService, 
                                 modelEffectService,  
                                 modelGeomService,  
                                 modelImageService,
                                 modelIncorporealService,
                                 modelLabelService,
                                 modelLeaderService,
                                 modelMeleeService,
                                 modelMoveService,
                                 modelPlaceService,
                                 modelRulerService,
                                 modelUnitService,
                                 modelWreckService) {
      let DEFAULT_MOVES = {
        Move: 10,
        MoveSmall: 5,
        Rotate: 15,
        RotateSmall: 5,
        Shift: 10,
        ShiftSmall: 1,
        RotateCharge: 10,
        RotateChargeSmall: 2
      };
      let MOVES = R.clone(DEFAULT_MOVES);
      settingsService.register('Moves',
                               'Model',
                               DEFAULT_MOVES,
                               (moves) => {
                                 R.extend(MOVES, moves);
                               });
      var modelService = {
        create: function modelCreate(factions, temp) {
          return R.pipeP(
            gameFactionsService.getModelInfo$(temp.info),
            (info) => {
              let model = {
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
              return modelService.checkState(factions, null, model);
            }
          )(factions);
        },
        stamp: function modelStamp(model) {
          return R.path(['state','stamp'], model);
        },
        eventName: function modelEventName(model) {
          return R.path(['state','stamp'], model);
        },
        user: function modelUser(model) {
          return R.path(['state', 'user'], model);
        },
        userIs: function modelUser(user, model) {
          return R.pathEq(['state', 'user'], user, model);
        },
        state: function modelState(model) {
          return R.prop('state', model);
        },
        saveState: function modelSaveState(model) {
          return R.clone(R.prop('state', model));
        },
        setState: function modelSetState(state, model) {
          return R.assoc('state', R.clone(state), model);
        },
        state_checkers: [],
        state_updaters: [],
        checkState: function modelCheckState(factions, target, model) {
          return R.pipeP(
            gameFactionsService.getModelInfo$(model.state.info),
            (info) => {
              var radius = info.base_radius;
              return R.pipe(
                R.assoc('x', Math.max(0+radius, Math.min(480-radius, model.state.x))),
                R.assoc('y', Math.max(0+radius, Math.min(480-radius, model.state.y))),
                (state) => {
                  return R.reduce((state, checker) => {
                    return checker(info, target, state);
                  }, state, modelService.state_checkers);
                },
                (state) => {
                  return R.reduce(function(state, updater) {
                    return updater(state);
                  }, state, modelService.state_updaters);
                }
              )(model.state);
            },
            (state) => {
              return R.assoc('state', state, model);
            }
          )(factions);
        },
        isLocked: function modelIsLocked(model) {
          return R.pipe(
            R.pathOr([], ['state', 'dsp']),
            R.find(R.equals('lk')),
            R.exists
          )(model);
        },
        setLock: function modelSetLock(set, model) {
          if(set) {
            return R.over(R.lensPath(['state','dsp']),
                          R.compose(R.uniq, R.append('lk')),
                          model);
          }
          else {
            return R.over(R.lensPath(['state','dsp']),
                          R.reject(R.equals('lk')),
                          model);
          }
        },
        modeFor: function modelModeFor(model) {
          if(modelService.isCharging(model)) {
            return 'ModelCharge';
          }
          if(modelService.isPlacing(model)) {
            return 'ModelPlace';
          }
          return 'Model';
        },
        descriptionFromInfo: function modelDescriptionFromInfo(info, model) {
          return R.pipe(
            R.props(['unit_name', 'name']),
            R.prepend(modelService.user(model)),
            R.reject(R.isNil),
            R.join('/')
          )(info);
        }
      };
      function initDamage(info) {
        if(info.type === 'warrior') {
          return { n: 0, t: 0 };
        }
        return R.pipe(
          R.keys,
          R.reject(R.equals('type')),
          R.reject(R.equals('field')),
          R.reject(R.equals('total')),
          R.reject(R.equals('depth')),
          R.reduce(function(mem, key) {
            return R.assoc(key, R.map(R.always(0), info[key]), mem);
          }, {}),
          R.assoc('f', 0),
          R.assoc('t', 0)
        )(info);
      }
      R.extend(
        modelService,
        modelAreaService(modelService),
        modelAuraService(modelService),
        modelChargeService(MOVES, modelService),
        modelCounterService(modelService),
        modelDamageService(modelService),
        modelEffectService(modelService),
        modelGeomService(modelService),
        modelImageService(modelService),
        modelIncorporealService(modelService),
        modelLabelService(modelService),
        modelLeaderService(modelService),
        modelPlaceService(MOVES, modelService),
        modelMeleeService(modelService),
        modelMoveService(MOVES, modelService),
        modelRulerService(modelService),
        modelUnitService(modelService),
        modelWreckService(modelService)
      );
      R.curryService(modelService);
      return modelService;
    }
  ]);
