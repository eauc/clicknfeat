'use strict';

angular.module('clickApp.services').factory('aoeTemplate', ['template', 'model', 'point', function aoeTemplateServiceFactory(templateService, modelService, pointService) {
  var aoeTemplateService = Object.create(templateService);
  aoeTemplateService.create = function aoeTemplateCreate(temp) {
    temp.state = R.assoc('s', 15, temp.state);
    return temp;
  };
  aoeTemplateService.setSize = function aoeTemplateSetSize(size, temp) {
    if (R.isNil(R.find(R.equals(size), [3, 4, 5]))) {
      return self.Promise.reject('Invalid size for an AoE');
    }
    temp.state = R.assoc('s', size * 5, temp.state);
  };
  aoeTemplateService.size = function aoeTemplateSize(temp) {
    return R.path(['state', 's'], temp);
  };
  aoeTemplateService.deviate = function aoeTemplateDeviate(dir, len, temp) {
    if (templateService.isLocked(temp)) {
      return self.Promise.reject('Template is locked');
    }
    dir = temp.state.r + 60 * (dir - 1);
    var max_len = R.defaultTo(len, R.path(['state', 'm'], temp));
    len = Math.min(len, max_len);
    temp.state = pointService.translateInDirection(len * 10, dir, temp.state);
    temp.state = R.assoc('r', dir, temp.state);
    templateService.checkState(temp.state);
  };
  aoeTemplateService.maxDeviation = function aoeTemplateMaxDeviation(temp) {
    return R.defaultTo(0, R.path(['state', 'm'], temp));
  };
  aoeTemplateService.setMaxDeviation = function aoeTemplateSetMaxDeviation(max, temp) {
    temp.state = R.assoc('m', max, temp.state);
  };
  aoeTemplateService.setToRuler = function aoeTemplateSetToRuler(pos, temp) {
    if (templateService.isLocked(temp)) {
      return self.Promise.reject('Template is locked');
    }
    temp.state = R.pipe(R.assoc('x', pos.x), R.assoc('y', pos.y), R.assoc('r', pos.r), R.assoc('m', pos.m), templateService.checkState)(temp.state);
  };
  aoeTemplateService.setTarget = function aoeTemplateSetTarget(factions, origin, target, temp) {
    return templateService.setPosition(target.state, temp);
  };
  templateService.registerTemplate('aoe', aoeTemplateService);
  return aoeTemplateService;
}]).factory('wallTemplate', ['template', self.wallTemplateServiceFactory = function wallTemplateServiceFactory(templateService) {
  var wallTemplateService = Object.create(templateService);
  wallTemplateService.create = function wallTemplateCreate(temp) {
    return temp;
  };
  templateService.registerTemplate('wall', wallTemplateService);
  return wallTemplateService;
}]).factory('sprayTemplate', ['template', 'model', 'point', self.sprayTemplateServiceFactory = function sprayTemplateServiceFactory(templateService, modelService, pointService) {
  var sprayTemplateService = Object.create(templateService);
  sprayTemplateService.create = function sprayTemplateCreate(temp) {
    temp.state = R.assoc('s', 6, temp.state);
    return temp;
  };
  sprayTemplateService.setSize = function sprayTemplateSetSize(size, temp) {
    if (R.isNil(R.find(R.equals(size), [6, 8, 10]))) {
      return self.Promise.reject('Invalid size for a Spray');
    }
    temp.state = R.assoc('s', size, temp.state);
  };
  sprayTemplateService.size = function sprayTemplateSize(temp) {
    return R.path(['state', 's'], temp);
  };
  sprayTemplateService.origin = function sprayTemplateOrigin(temp) {
    return R.path(['state', 'o'], temp);
  };
  sprayTemplateService.setOrigin = function sprayTemplateSetOrigin(factions, origin, temp) {
    if (templateService.isLocked(temp)) {
      return self.Promise.reject('Template is locked');
    }
    return R.pipeP(modelService.baseEdgeInDirection$(factions, temp.state.r), function (position) {
      temp.state = R.assoc('o', origin.state.stamp, temp.state);

      return templateService.setPosition(position, temp);
    })(origin);
  };
  sprayTemplateService.setTarget = function sprayTemplateSetTarget(factions, origin, target, temp) {
    if (templateService.isLocked(temp)) {
      return self.Promise.reject('Template is locked');
    }
    var direction = pointService.directionTo(target.state, origin.state);
    return R.pipeP(modelService.baseEdgeInDirection$(factions, direction), function (position) {
      temp.state = R.assoc('r', direction, temp.state);

      return templateService.setPosition(position, temp);
    })(origin);
  };
  var FORWARD_MOVES = ['moveFront', 'moveBack', 'shiftLeft', 'shiftRight', 'shiftUp', 'shiftDown', 'setPosition'];
  R.forEach(function (move) {
    sprayTemplateService[move] = function sprayTemplateForwardMove(small, template) {
      if (templateService.isLocked(template)) {
        return self.Promise.reject('Template is locked');
      }
      template.state = R.assoc('o', null, template.state);
      templateService[move](small, template);
    };
  }, FORWARD_MOVES);
  sprayTemplateService.rotateLeft = function sprayTemplateRotateLeft(factions, origin, small, template) {
    if (templateService.isLocked(template)) {
      return self.Promise.reject('Template is locked');
    }
    if (R.isNil(origin)) return templateService.rotateLeft(small, template);

    var angle = templateService.moves()[small ? 'RotateSmall' : 'Rotate'];
    template.state = pointService.rotateLeft(angle, template.state);
    return R.pipeP(modelService.baseEdgeInDirection$(factions, template.state.r), function (base_edge) {
      return templateService.setPosition(base_edge, template);
    })(origin);
  };
  sprayTemplateService.rotateRight = function sprayTemplateRotateRight(factions, origin, small, template) {
    if (templateService.isLocked(template)) {
      return self.Promise.reject('Template is locked');
    }
    if (R.isNil(origin)) return templateService.rotateRight(small, template);

    var angle = templateService.moves()[small ? 'RotateSmall' : 'Rotate'];
    template.state = pointService.rotateRight(angle, template.state);
    return R.pipeP(modelService.baseEdgeInDirection$(factions, template.state.r), function (base_edge) {
      return templateService.setPosition(base_edge, template);
    })(origin);
  };
  templateService.registerTemplate('spray', sprayTemplateService);
  return sprayTemplateService;
}]).factory('template', ['settings', 'point', self.templateServiceFactory = function templateServiceFactory(settingsService, pointService) {
  var TEMP_REGS = {};
  var DEFAULT_MOVES = {
    Move: 10,
    MoveSmall: 1,
    Rotate: 60,
    RotateSmall: 6,
    Shift: 10,
    ShiftSmall: 1
  };
  var MOVES = R.clone(DEFAULT_MOVES);
  settingsService.register('Moves', 'Template', DEFAULT_MOVES, function (moves) {
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
      return R.pipeP(R.bind(self.Promise.resolve, self.Promise), function () {
        if (R.isNil(TEMP_REGS[temp.type])) {
          console.log('Template: create unknown template type ' + temp.type);
          return self.Promise.reject('Create unknown template type ' + temp.type);
        }
      }, function () {
        var template = {
          state: {
            type: temp.type,
            x: 0, y: 0, r: 0,
            l: [],
            stamp: R.guid()
          }
        };
        return TEMP_REGS[temp.type].create(template);
      }, function (template) {
        template.state = R.deepExtend(template.state, temp);
        return template;
      })();
    },
    state: function templateState(template) {
      return R.prop('state', template);
    },
    saveState: function templateSaveState(template) {
      return R.clone(R.prop('state', template));
    },
    setState: function templateSetState(state, template) {
      template.state = R.clone(state);
    },
    respondTo: function templateAnswerTo(method, template) {
      return R.exists(TEMP_REGS[template.state.type]) && R.exists(TEMP_REGS[template.state.type][method]);
    },
    call: function templateCall(method /* ...args..., template */) {
      var args = R.tail(arguments);
      return new self.Promise(function (resolve, reject) {
        var temp = R.last(args);
        console.log('Template: call', temp, method, args);
        if (!templateService.respondTo(method, temp)) {
          console.log('Template: unknown call ' + method + ' on ' + temp.state.type + ' template');
          reject('Unknown call ' + method + ' on ' + temp.state.type + ' template');
          return;
        }
        resolve(TEMP_REGS[temp.state.type][method].apply(null, args));
      });
    },
    checkState: function templateCheckState(state) {
      state.x = Math.max(0, Math.min(480, state.x));
      state.y = Math.max(0, Math.min(480, state.y));
      return state;
    },
    isLocked: function templateIsLocked(template) {
      return template.state.lk;
    },
    setLock: function templateIsLocked(lock, template) {
      template.state.lk = lock;
    },
    setPosition: function templateSet(pos, template) {
      if (templateService.isLocked(template)) {
        return self.Promise.reject('Template is locked');
      }
      template.state = R.pipe(R.assoc('x', pos.x), R.assoc('y', pos.y), templateService.checkState)(template.state);
    },
    moveFront: function templateMoveFront(small, template) {
      if (templateService.isLocked(template)) {
        return self.Promise.reject('Template is locked');
      }
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      template.state = templateService.checkState(pointService.moveFront(dist, template.state));
    },
    moveBack: function templateMoveBack(small, template) {
      if (templateService.isLocked(template)) {
        return self.Promise.reject('Template is locked');
      }
      var dist = MOVES[small ? 'MoveSmall' : 'Move'];
      template.state = templateService.checkState(pointService.moveBack(dist, template.state));
    },
    rotateLeft: function templateRotateLeft(small, template) {
      if (templateService.isLocked(template)) {
        return self.Promise.reject('Template is locked');
      }
      var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
      template.state = templateService.checkState(pointService.rotateLeft(angle, template.state));
    },
    rotateRight: function templateRotateRight(small, template) {
      if (templateService.isLocked(template)) {
        return self.Promise.reject('Template is locked');
      }
      var angle = MOVES[small ? 'RotateSmall' : 'Rotate'];
      template.state = templateService.checkState(pointService.rotateRight(angle, template.state));
    },
    shiftLeft: function templateShiftLeft(small, template) {
      if (templateService.isLocked(template)) {
        return self.Promise.reject('Template is locked');
      }
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      template.state = templateService.checkState(pointService.shiftLeft(dist, template.state));
    },
    shiftRight: function templateShiftRight(small, template) {
      if (templateService.isLocked(template)) {
        return self.Promise.reject('Template is locked');
      }
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      template.state = templateService.checkState(pointService.shiftRight(dist, template.state));
    },
    shiftUp: function templateShiftUp(small, template) {
      if (templateService.isLocked(template)) {
        return self.Promise.reject('Template is locked');
      }
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      template.state = templateService.checkState(pointService.shiftUp(dist, template.state));
    },
    shiftDown: function templateShiftDown(small, template) {
      if (templateService.isLocked(template)) {
        return self.Promise.reject('Template is locked');
      }
      var dist = MOVES[small ? 'ShiftSmall' : 'Shift'];
      template.state = templateService.checkState(pointService.shiftDown(dist, template.state));
    },
    eventName: function templateEventName(template) {
      return R.path(['state', 'stamp'], template);
    },
    addLabel: function templateAddLabel(label, template) {
      template.state.l = R.uniq(R.append(label, template.state.l));
    },
    removeLabel: function templateRemoveLabel(label, template) {
      template.state.l = R.reject(R.equals(label), template.state.l);
    },
    fullLabel: function templateFullLabel(template) {
      return template.state.l.join(' ');
    }
  };
  R.curryService(templateService);
  return templateService;
}]).factory('allTemplates', ['aoeTemplate', 'sprayTemplate', 'wallTemplate', function () {
  return {};
}]);
//# sourceMappingURL=template.js.map
