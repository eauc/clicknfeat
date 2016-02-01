angular.module('clickApp.services')
  .factory('aoeTemplate', [
    'template',
    'model',
    'point',
    function aoeTemplateServiceFactory(templateService,
                                       modelService,
                                       pointService) {
      var aoeTemplateService = Object.create(templateService);
      aoeTemplateService.create = function aoeTemplateCreate(temp) {    
        return R.assocPath(['state','s'], 15, temp);
      };
      aoeTemplateService.setSize = function aoeTemplateSetSize(size, temp) {
        if(R.isNil(R.find(R.equals(size), [3,4,5]))) {
          return self.Promise.reject('Invalid size for an AoE');
        }
        return R.assocPath(['state','s'], size * 5, temp);
      };
      aoeTemplateService.size = function aoeTemplateSize(temp) {
        return R.path(['state','s'], temp);
      };
      aoeTemplateService.deviate = function aoeTemplateDeviate(dir, len, temp) {
        if(templateService.isLocked(temp)) {
          return self.Promise.reject('Template is locked');
        }
        dir = temp.state.r + 60 * (dir-1);
        var max_len = R.defaultTo(len, R.path(['state','m'], temp));
        len = Math.min(len, max_len);
        return R.pipe(
          R.over(R.lensProp('state'),
                 pointService.translateInDirection$(len * 10, dir)),
          R.assocPath(['state','r'], dir),
          templateService.checkState
        )(temp);
      };
      aoeTemplateService.maxDeviation = function aoeTemplateMaxDeviation(temp) {
        return R.pathOr(0, ['state','m'], temp);
      };
      aoeTemplateService.setMaxDeviation = function aoeTemplateSetMaxDeviation(max, temp) {
        return R.assocPath(['state','m'], max, temp);
      };
      aoeTemplateService.setToRuler = function aoeTemplateSetToRuler(pos, temp) {
        if(templateService.isLocked(temp)) {
          return self.Promise.reject('Template is locked');
        }
        let state = R.pipe(
          R.assoc('x', pos.x),
          R.assoc('y', pos.y),
          R.assoc('r', pos.r),
          R.assoc('m', pos.m)
        )(temp.state);
        return R.pipe(
          R.assoc('state', state),
          templateService.checkState
        )(temp);
      };
      aoeTemplateService.setTarget = function aoeTemplateSetTarget(factions, origin, target, temp) {
        return templateService.setPosition(target.state, temp);
      };
      templateService.registerTemplate('aoe', aoeTemplateService);
      R.curryService(aoeTemplateService);
      return aoeTemplateService;
    }
  ])
  .factory('wallTemplate', [
    'template',
    self.wallTemplateServiceFactory = function wallTemplateServiceFactory(templateService) {
      var wallTemplateService = Object.create(templateService);
      wallTemplateService.create = function wallTemplateCreate(temp) {    
        return temp;
      };
      templateService.registerTemplate('wall', wallTemplateService);
      R.curryService(wallTemplateService);
      return wallTemplateService;
    }
  ])
  .factory('sprayTemplate', [
    'template',
    'model',
    'point',
    self.sprayTemplateServiceFactory = function sprayTemplateServiceFactory(templateService,
                                                                            modelService,
                                                                            pointService) {
      var sprayTemplateService = Object.create(templateService);
      sprayTemplateService.create = function sprayTemplateCreate(temp) {    
        return R.assocPath(['state','s'], 6, temp);
      };
      sprayTemplateService.setSize = function sprayTemplateSetSize(size, temp) {
        if(R.isNil(R.find(R.equals(size), [6,8,10]))) {
          return self.Promise.reject('Invalid size for a Spray');
        }
        return R.assocPath(['state','s'], size, temp);
      };
      sprayTemplateService.size = function sprayTemplateSize(temp) {
        return R.path(['state','s'], temp);
      };
      sprayTemplateService.origin = function sprayTemplateOrigin(temp) {
        return R.path(['state','o'], temp);
      };
      sprayTemplateService.setOrigin = function sprayTemplateSetOrigin(factions, origin, temp) {
        if(templateService.isLocked(temp)) {
          return self.Promise.reject('Template is locked');
        }
        return R.pipeP(
          modelService.baseEdgeInDirection$(factions, temp.state.r),
          (position) => {
            return R.pipe(
              R.assocPath(['state','o'], origin.state.stamp),
              templateService.setPosition$(position)
            )(temp);
          }
        )(origin);
      };
      sprayTemplateService.setTarget = function sprayTemplateSetTarget(factions, origin, target, temp) {
        if(templateService.isLocked(temp)) {
          return self.Promise.reject('Template is locked');
        }
        var direction = pointService.directionTo(target.state, origin.state);
        return R.pipeP(
          modelService.baseEdgeInDirection$(factions, direction),
          (position) => {
            return R.pipe(
              R.assocPath(['state','r'], direction),
              templateService.setPosition$(position)
            )(temp);
          }
        )(origin);
      };
      var FORWARD_MOVES = [
        'moveFront',
        'moveBack',
        'shiftLeft',
        'shiftRight',
        'shiftUp',
        'shiftDown',
        'setPosition',
      ];
      R.forEach(function(move) {
        sprayTemplateService[move] = function sprayTemplateForwardMove(small, template) {
          if(templateService.isLocked(template)) {
            return self.Promise.reject('Template is locked');
          }
          return R.pipePromise(
            R.assocPath(['state','o'], null),
            (template) => {
              return templateService[move](small, template);
            }
          )(template);
        };
      }, FORWARD_MOVES);
      sprayTemplateService.rotateLeft = function sprayTemplateRotateLeft(factions, origin,
                                                                         small, template) {
        if(templateService.isLocked(template)) {
          return self.Promise.reject('Template is locked');
        }
        if(R.isNil(origin)) return templateService.rotateLeft(small, template);
        
        var angle = templateService.moves()[small ? 'RotateSmall' : 'Rotate'];
        template = R.over(R.lensProp('state'),
                          pointService.rotateLeft$(angle),
                          template);
        return R.pipeP(
          modelService.baseEdgeInDirection$(factions, template.state.r),
          (base_edge) => {
            return templateService.setPosition(base_edge, template);
          }
        )(origin);
      };
      sprayTemplateService.rotateRight = function sprayTemplateRotateRight(factions, origin,
                                                                           small, template) {
        if(templateService.isLocked(template)) {
          return self.Promise.reject('Template is locked');
        }
        if(R.isNil(origin)) return templateService.rotateRight(small, template);
        
        var angle = templateService.moves()[small ? 'RotateSmall' : 'Rotate'];
        template = R.over(R.lensProp('state'),
                          pointService.rotateRight$(angle),
                          template);
        return R.pipeP(
          modelService.baseEdgeInDirection$(factions, template.state.r),
          (base_edge) => {
            return templateService.setPosition(base_edge, template);
          }
        )(origin);
      };
      templateService.registerTemplate('spray', sprayTemplateService);
      R.curryService(sprayTemplateService);
      return sprayTemplateService;
    }
  ])
  .factory('template', [
    'settings',
    'point',
    self.templateServiceFactory = function templateServiceFactory(settingsService,
                                                                  pointService) {
      let TEMP_REGS = {};
      let DEFAULT_MOVES = {
        Move: 10,
        MoveSmall: 1,
        Rotate: 60,
        RotateSmall: 6,
        Shift: 10,
        ShiftSmall: 1
      };
      let MOVES = R.clone(DEFAULT_MOVES);
      settingsService.register('Moves',
                               'Template',
                               DEFAULT_MOVES,
                               (moves) => {
                                 R.extend(MOVES, moves);
                               });
      var templateService = {
        registerTemplate: function templateRegister(type, service) {
          TEMP_REGS[type] = service;
        },
        moves: function templateMoves() {
          return MOVES;
        },
        create: function templateCreate(temp) {
          return R.pipePromise(
            R.prop(temp.type),
            R.rejectIf(R.isNil, `Create unknown template type ${temp.type}`),
            (service) => {
              var template = {
                state: {
                  type: temp.type,
                  x: 0, y: 0, r: 0,
                  l: [],
                  stamp: R.guid()
                }
              };
              return service.create(template);
            },
            (template) => {
              template.state = R.deepExtend(template.state, temp);
              return template;
            }
          )(TEMP_REGS);
        },
        state: function templateState(template) {
          return R.prop('state', template);
        },
        saveState: function templateSaveState(template) {
          return R.clone(R.prop('state', template));
        },
        setState: function templateSetState(state, template) {
          return R.assoc('state', R.clone(state), template);
        },
        respondTo: function templateAnswerTo(method, template) {
          return ( R.exists(TEMP_REGS[template.state.type]) &&
                   R.exists(TEMP_REGS[template.state.type][method])
                 );
        },
        call: function templateCall(method, args, template) {
          return new self.Promise((resolve, reject) => {
            if(!templateService.respondTo(method, template)) {
              reject(`Unknown call ${method} on ${template.state.type} template`);
              return;
            }
            resolve(TEMP_REGS[template.state.type][method]
                    .apply(null, [...args, template]));
          });
        },
        checkState: function templateCheckState(template) {
          return R.pipe(
            R.over(R.lensPath(['state','x']),
                   R.compose(R.max(0), R.min(480))),
            R.over(R.lensPath(['state','y']),
                   R.compose(R.max(0), R.min(480)))
          )(template);
        },
        isLocked: function templateIsLocked(template) {
          return R.path(['state','lk'], template);
        },
        setLock: function templateIsLocked(lock, template) {
          return R.assocPath(['state','lk'], lock, template);
        },
        setPosition: function templateSet(pos, template) {
          if(templateService.isLocked(template)) {
            return self.Promise.reject('Template is locked');
          }
          return R.pipe(
            R.assocPath(['state','x'], pos.x),
            R.assocPath(['state','y'], pos.y),
            templateService.checkState
          )(template);
        },
        moveFront: function templateMoveFront(small, template) {
          if(templateService.isLocked(template)) {
            return self.Promise.reject('Template is locked');
          }
          var dist = MOVES[small ? 'MoveSmall' : 'Move'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.moveFront$(dist)),
            templateService.checkState
          )(template);
        },
        moveBack: function templateMoveBack(small, template) {
          if(templateService.isLocked(template)) {
            return self.Promise.reject('Template is locked');
          }
          var dist = MOVES[small ? 'MoveSmall' : 'Move'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.moveBack$(dist)),
            templateService.checkState
          )(template);
        },
        rotateLeft: function templateRotateLeft(small, template) {
          if(templateService.isLocked(template)) {
            return self.Promise.reject('Template is locked');
          }
          var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.rotateLeft$(angle)),
            templateService.checkState
          )(template);
        },
        rotateRight: function templateRotateRight(small, template) {
          if(templateService.isLocked(template)) {
            return self.Promise.reject('Template is locked');
          }
          var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.rotateRight$(angle)),
            templateService.checkState
          )(template);
        },
        shiftLeft: function templateShiftLeft(small, template) {
          if(templateService.isLocked(template)) {
            return self.Promise.reject('Template is locked');
          }
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.shiftLeft$(dist)),
            templateService.checkState
          )(template);
        },
        shiftRight: function templateShiftRight(small, template) {
          if(templateService.isLocked(template)) {
            return self.Promise.reject('Template is locked');
          }
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.shiftRight$(dist)),
            templateService.checkState
          )(template);
        },
        shiftUp: function templateShiftUp(small, template) {
          if(templateService.isLocked(template)) {
            return self.Promise.reject('Template is locked');
          }
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.shiftUp$(dist)),
            templateService.checkState
          )(template);
        },
        shiftDown: function templateShiftDown(small, template) {
          if(templateService.isLocked(template)) {
            return self.Promise.reject('Template is locked');
          }
          var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
          return R.pipe(
            R.over(R.lensProp('state'),
                   pointService.shiftDown$(dist)),
            templateService.checkState
          )(template);
        },
        eventName: function templateEventName(template) {
          return R.path(['state','stamp'], template);
        },
        addLabel: function templateAddLabel(label, template) {
          return R.over(R.lensPath(['state','l']),
                        R.compose(R.uniq, R.append(label)),
                        template);
        },
        removeLabel: function templateRemoveLabel(label, template) {
          return R.over(R.lensPath(['state','l']),
                        R.reject(R.equals(label)),
                        template);
        },
        fullLabel: function templateFullLabel(template) {
          return R.pathOr([], ['state','l'], template).join(' ');
        }
      };
      R.curryService(templateService);
      return templateService;
    }
  ])
  .factory('allTemplates', [
    'aoeTemplate',
    'sprayTemplate',
    'wallTemplate',
    () => { return {}; }
  ]);
