'use strict';

angular.module('clickApp.services')
  .factory('model', [
    'settings',
    'point',
    'gameFactions',
    'modelArea',
    'modelAura',
    // 'modelCharge',
    'modelCounter',
    // 'modelDamage',
    'modelEffect',
    'modelGeom',
    'modelImage',
    'modelIncorporeal',
    'modelLabel',
    'modelLeader',
    'modelMelee',
    'modelMove',
    // 'modelPlace',
    // 'modelRuler',
    'modelUnit',
    'modelWreck',
    function modelServiceFactory(settingsService,
                                 pointService,
                                 gameFactionsService,
                                 modelAreaService,  
                                 modelAuraService,  
                                 // modelChargeService,  
                                 modelCounterService,  
                                 // modelDamageService, 
                                 modelEffectService,  
                                 modelGeomService,  
                                 modelImageService,
                                 modelIncorporealService,
                                 modelLabelService,
                                 modelLeaderService,
                                 modelMeleeService,
                                 modelMoveService,
                                 // modelPlaceService,
                                 // modelRulerService,
                                 modelUnitService,
                                 modelWreckService) {
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
          return R.pipeP(
            gameFactionsService.getModelInfo$(temp.info),
            function(info) {
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
          model.state = R.clone(state);
        },
        state_checkers: [],
        state_updaters: [],
        checkState: function modelCheckState(factions, target, model) {
          return R.pipeP(
            gameFactionsService.getModelInfo$(model.state.info),
            function(info) {
              var radius = info.base_radius;
              return R.pipe(
                R.assoc('x', Math.max(0+radius, Math.min(480-radius, model.state.x))),
                R.assoc('y', Math.max(0+radius, Math.min(480-radius, model.state.y))),
                function(state) {
                  return R.reduce(function(state, checker) {
                    return checker(info, target, state);
                  }, state, modelService.state_checkers);
                },
                function(state) {
                  return R.reduce(function(state, updater) {
                    return updater(state);
                  }, state, modelService.state_updaters);
                }
              )(model.state);
            },
            function(state) {
              model.state = state;
              return model;
            }
          )(factions);
        },
        isLocked: function modelIsLocked(model) {
          return !!R.find(R.equals('lk'), R.defaultTo([], R.path(['state', 'dsp'], model)));
        },
        setLock: function modelSetLock(set, model) {
          if(set) {
            model.state.dsp = R.uniq(R.append('lk', model.state.dsp));
          }
          else {
            model.state.dsp = R.reject(R.equals('lk'), model.state.dsp);
          }
        },
        modeFor: function modelModeFor(model) {
          // if(modelService.isCharging(model)) {
          //   return 'ModelCharge';
          // }
          // if(modelService.isPlacing(model)) {
          //   return 'ModelPlace';
          // }
          return 'Model';
        },
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
        // modelChargeService(MOVES, modelService),
        modelCounterService(modelService),
        // modelDamageService(modelService),
        modelEffectService(modelService),
        modelGeomService(modelService),
        modelImageService(modelService),
        modelIncorporealService(modelService),
        modelLabelService(modelService),
        modelLeaderService(modelService),
        // modelPlaceService(MOVES, modelService),
        modelMeleeService(modelService),
        modelMoveService(MOVES, modelService),
        // modelRulerService(modelService),
        modelUnitService(modelService),
        modelWreckService(modelService)
      );
      R.curryService(modelService);
      return modelService;
    }
  ]);
