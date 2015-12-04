'use strict';

describe('set origin/target template', function() {
  describe('aoeTemplateMode service', function() {
    beforeEach(inject([
      'aoeTemplateMode',
      function(aoeTemplateModeService) {
        this.aoeTemplateModeService = aoeTemplateModeService;

        this.gameService = spyOnService('game');

        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          factions: 'factions',
          game: { template_selection: 'selection' },
        };
      }
    ]));

    when('user set target model', function() {
      this.ret = this.aoeTemplateModeService.actions
        .setTargetModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
        this.target = { state: { stamp: 'target' } };
        this.event = { 'click#': { target: this.target } };
      });
      
      it('should set target for current template selection', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onTemplates',
                                'setTarget', 'factions', null, this.target,
                                ['stamp'], this.scope, this.scope.game);
        expect(this.ret).toBe('game.executeCommand.returnValue');
      });
    });
  });

  describe('sprayTemplateMode service', function() {
    beforeEach(inject([
      'sprayTemplateMode',
      function(sprayTemplateModeService) {
        this.sprayTemplateModeService = sprayTemplateModeService;

        this.gameService = spyOnService('game');

        this.sprayTemplateService = spyOnService('sprayTemplate');

        this.gameTemplatesService = spyOnService('gameTemplates');
        mockReturnPromise(this.gameTemplatesService.findStamp);
        this.gameTemplatesService.findStamp.resolveWith = 'gameTemplates.findStamp.returnValue';
        
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';

        this.scope = {
          factions: 'factions',
          game: { template_selection: 'selection',
                  templates: 'templates',
                  models: 'models'
                },
        };
      }
    ]));

    when('user set origin model', function() {
      this.ret = this.sprayTemplateModeService.actions
        .setOriginModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
        this.target = { state: { stamp: 'origin' } };
        this.event = { 'click#': { target: this.target } };
      });
      
      it('should set origin for current template selection', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onTemplates',
                                'setOrigin', 'factions', this.target,
                                ['stamp'], this.scope, this.scope.game);
        expect(this.ret).toBe('game.executeCommand.returnValue');
      });
    });

    when('user set target model', function() {
      this.ret = this.sprayTemplateModeService.actions
        .setTargetModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
        this.sprayTemplateService.origin._retVal = null;
        this.target = { state: { stamp: 'target' } };
        this.event = { 'click#': { target: this.target } };
      });

      it('should check whether current spray selection has an origin', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameTemplatesService.findStamp)
          .toHaveBeenCalledWith('stamp', 'templates');
        this.thenExpect(this.ret, function() {
          expect(this.sprayTemplateService.origin)
            .toHaveBeenCalledWith('gameTemplates.findStamp.returnValue');
        });
      });

      when('spray does not have an origin', function() {
        this.sprayTemplateService.origin._retVal = null;
      }, function() {        
        it('should do nothing', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameService.executeCommand)
              .not.toHaveBeenCalled();
          });
        });
      });

      when('spray has an origin', function() {
        this.sprayTemplateService.origin._retVal = 'origin';
      }, function() {        
        it('should set spray target to clicked model', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('origin', 'models');
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onTemplates', 'setTarget', 'factions',
                                    'gameModels.findStamp.returnValue', this.target,
                                    ['stamp'], this.scope, this.scope.game);
          });
        });
      });
    });

    using([
      ['action', 'small'],
      ['rotateLeft', false ],
      ['rotateLeftSmall', true ],
    ], function(e, d) {
      when('user rotate left, '+d, function() {
        this.ret = this.sprayTemplateModeService
          .actions[e.action](this.scope);
      }, function() {
        beforeEach(function() {
          this.gameTemplateSelectionService.get._retVal = ['stamp'];
          this.sprayTemplateService.origin._retVal = 'origin';
          this.target = { state: { stamp: 'target' } };
          this.event = { 'click#': { target: this.target } };
        });
        
        it('should rotate spray left', function() {
          expect(this.gameTemplateSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameTemplatesService.findStamp)
            .toHaveBeenCalledWith('stamp', 'templates');
          this.thenExpect(this.ret, function() {
            expect(this.sprayTemplateService.origin)
              .toHaveBeenCalledWith('gameTemplates.findStamp.returnValue');
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('origin', 'models');
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onTemplates', 'rotateLeft', 'factions',
                                    'gameModels.findStamp.returnValue', e.small,
                                    ['stamp'], this.scope, this.scope.game);
          });
        });
      });
    });
  });

  describe('aoeTemplate service', function() {
    beforeEach(inject([
      'aoeTemplate',
      function(aoeTemplateService) {
        this.aoeTemplateService = aoeTemplateService;
        this.modelService = spyOnService('model');
      }
    ]));

    when('setTarget(<factions>, <origin>, <target>), ', function() {
      this.ret = this.aoeTemplateService
        .setTarget('factions', null, this.target, this.template);
    }, function() {
      beforeEach(function() {
        this.template = {
          state: { x: 240, y: 240, r: 0 }
        };
        this.target = {
          state: { x: 120, y: 120 }
        };
      });
      
      it('should center template on <target>', function() {
        expect(this.template.state)
          .toEqual({ x: 120, y: 120, r: 0 });
      });

      when('aoe is locked', function() {
        this.template.state.lk = true;
      }, function() {
        it('should reject set target', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Template is locked');
          });
        });
      });
    });
  });

  describe('sprayTemplate service', function() {
    beforeEach(inject([
      'sprayTemplate',
      function(sprayTemplateService) {
        this.sprayTemplateService = sprayTemplateService;
        this.modelService = spyOnService('model');
      }
    ]));

    when('setOrigin(<factions>, <origin>), ', function() {
      this.ret = this.sprayTemplateService
        .setOrigin('factions', this.origin, this.template);
    }, function() {
      beforeEach(function() {
        this.template = {
          state: { x: 240, y: 240, r: 42 }
        };
        this.origin = {
          state: { stamp: 'origin' }
        };
        mockReturnPromise(this.modelService.baseEdgeInDirection);
        this.modelService.baseEdgeInDirection.resolveWith = {
          x: 124, y: 124
        };
      });
      
      it('should set template position to <origin> base edge', function() {
        expect(this.modelService.baseEdgeInDirection)
          .toHaveBeenCalledWith('factions', 42, this.origin);
        
        this.thenExpect(this.ret, function() {
          expect(R.pick(['x','y','r'], this.template.state))
            .toEqual({ x: 124, y: 124, r: 42 });
        });
      });
      
      it('should set template origin', function() {
        this.thenExpect(this.ret, function() {
          expect(this.sprayTemplateService.origin(this.template))
            .toEqual('origin');
        });
      });

      when('spray is locked', function() {
        this.template.state.lk = true;
      }, function() {
        it('should reject set origin', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Template is locked');
          });
        });
      });
    });

    when('setTarget(<factions>, <origin>, <target>), ', function() {
      this.ret = this.sprayTemplateService
        .setTarget('factions', this.origin, this.target, this.template);
    }, function() {
      beforeEach(function() {
        this.template = {
          state: { x: 240, y: 240, r: 0 }
        };
        this.origin = {
          state: { x: 240, y: 240 }
        };
        mockReturnPromise(this.modelService.baseEdgeInDirection);
        this.modelService.baseEdgeInDirection.resolveWith = {
          x: 236, y: 236
        };
        this.target = {
          state: { x: 120, y: 120 }
        };
      });
      
      it('should center template on <target>', function() {
        expect(this.modelService.baseEdgeInDirection)
          .toHaveBeenCalledWith('factions', -45, this.origin);

        this.thenExpect(this.ret, function() {
          expect(this.template.state)
            .toEqual({ x: 236, y: 236, r: -45 });
        });
      });

      when('spray is locked', function() {
        this.template.state.lk = true;
      }, function() {
        it('should reject set target', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Template is locked');
          });
        });
      });
    });
    
    using([
      ['move'],
      ['moveFront'],
      ['moveBack'],
      ['shiftLeft'],
      ['shiftRight'],
      ['shiftUp'],
      ['shiftDown'],
      ['setPosition'],
    ], function(e, d) {
      when(e.move+'(<small>)', function() {
        this.ret = this.sprayTemplateService[e.move](true, this.template);
      }, function() {
        beforeEach(function() {
          this.template = { state: { o: 'origin', stamp: 'template' } };
          this.templateService = spyOnService('template');
          this.templateService.isLocked._retVal = false;
        });
      
        it('should reset template origin', function() {
          expect(this.template.state.o)
            .toBe(null);
        });

        it('should forward to templateService', function() {
          expect(this.templateService[e.move])
            .toHaveBeenCalledWith(true, this.template);
        });

        when('spray is locked', function() {
          this.templateService.isLocked._retVal = true;
        }, function() {
          it('should reject move', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('Template is locked');
              expect(this.templateService[e.move])
                .not.toHaveBeenCalled();
            });
          });
        });
      });
    });

    using([
      ['move', 'new_dir'],
      ['rotateLeft', -6],
      ['rotateRight', 6],
    ], function(e, d) {
      when(e.move+'(<factions>, <origin>, <small>)', function() {
        this.ret = this.sprayTemplateService[e.move]('factions', this.origin,
                                                     true, this.template);
      }, function() {
        beforeEach(function() {
          this.template = { state: { o: 'origin',
                                     stamp: 'template',
                                     r: 0
                                   } };
          this.templateService = spyOnService('template');
          this.templateService.moves.and.callThrough();
          this.templateService.isLocked._retVal = false;
        });
        
        when('<origin> is Nil', function() {
          this.origin = null;
        }, function() {
          it('should forward to templateService', function() {
            expect(this.templateService[e.move])
              .toHaveBeenCalledWith(true, this.template);
          });
        });
        
        when('<origin> exists', function() {
          this.origin = 'origin';
        }, function() {
          beforeEach(function() {
            mockReturnPromise(this.modelService.baseEdgeInDirection);
            this.modelService.baseEdgeInDirection
              .resolveWith = 'model.baseEdgeInDirection.returnValue';
          });
          
          it('should rotate <template> around <origin> base edge', function() {
            this.thenExpect(this.ret, function() {
              expect(this.modelService.baseEdgeInDirection)
                .toHaveBeenCalledWith('factions', e.new_dir, 'origin');
              expect(this.templateService.setPosition)
                .toHaveBeenCalledWith('model.baseEdgeInDirection.returnValue',
                                      this.template);
            });
          });
        });

        when('spray is locked', function() {
          this.origin = null;
          this.templateService.isLocked._retVal = true;
        }, function() {
          it('should reject move', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('Template is locked');
              expect(this.templateService[e.move])
                .not.toHaveBeenCalled();
            });
          });
        });
      });
    });
  });
});
