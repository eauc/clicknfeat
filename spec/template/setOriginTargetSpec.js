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

    when('user ctrl+click on model', function() {
      this.aoeTemplateModeService.actions.clickModel(this.scope, this.event, { ctrlKey: true });
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
        this.event = { target: { state: { stamp: 'origin' } } };
      });
      
      it('should set origin for current template selection', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onTemplates', 'setOrigin', 'factions', this.event.target,
                                ['stamp'], this.scope, this.scope.game);
      });
    });

    when('user shift+click on model', function() {
      this.aoeTemplateModeService.actions.clickModel(this.scope, this.event, { shiftKey: true });
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
        this.event = { target: { state: { stamp: 'target' } } };
      });
      
      it('should set target for current template selection', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onTemplates', 'setTarget', 'factions', null, this.event.target,
                                ['stamp'], this.scope, this.scope.game);
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
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
        this.gameModelsService = spyOnService('gameModels');

        this.scope = {
          factions: 'factions',
          game: { template_selection: 'selection',
                  templates: 'templates',
                  models: 'models'
                },
        };
      }
    ]));

    when('user ctrl+click on model', function() {
      this.sprayTemplateModeService.actions.clickModel(this.scope, this.event, { ctrlKey: true });
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
        this.event = { target: { state: { stamp: 'origin' } } };
      });
      
      it('should set origin for current template selection', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onTemplates', 'setOrigin', 'factions', this.event.target,
                                ['stamp'], this.scope, this.scope.game);
      });
    });

    when('user shift+click on model', function() {
      this.sprayTemplateModeService.actions.clickModel(this.scope, this.event, { shiftKey: true });
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
        this.sprayTemplateService.origin._retVal = null;
        this.event = { target: { state: { stamp: 'target' } } };
      });

      it('should check whether current spray selection has an origin', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameTemplatesService.findStamp)
          .toHaveBeenCalledWith('stamp', 'templates');
        expect(this.sprayTemplateService.origin)
          .toHaveBeenCalledWith('gameTemplates.findStamp.returnValue');
      });

      when('spray does not have an origin', function() {
        this.sprayTemplateService.origin._retVal = null;
      }, function() {        
        it('should do nothing', function() {
          expect(this.gameService.executeCommand)
            .not.toHaveBeenCalled();
        });
      });

      when('spray has an origin', function() {
        this.sprayTemplateService.origin._retVal = 'origin';
      }, function() {        
        it('should set spray target to clicked model', function() {
          expect(this.gameModelsService.findStamp)
            .toHaveBeenCalledWith('origin', 'models');
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onTemplates', 'setTarget', 'factions',
                                  'gameModels.findStamp.returnValue', this.event.target,
                                  ['stamp'], this.scope, this.scope.game);
        });
      });
    });

    using([
      ['action', 'small'],
      ['rotateLeft', false ],
      ['rotateLeftSmall', true ],
    ], function(e, d) {
      when('user rotate left, '+d, function() {
        this.sprayTemplateModeService.actions[e.action](this.scope);
      }, function() {
        beforeEach(function() {
          this.gameTemplateSelectionService.get._retVal = ['stamp'];
          this.sprayTemplateService.origin._retVal = 'origin';
          this.event = { target: { state: { stamp: 'target' } } };
        });
        
        it('should rotate spray left', function() {
          expect(this.gameTemplateSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameTemplatesService.findStamp)
            .toHaveBeenCalledWith('stamp', 'templates');
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

  describe('aoeTemplate service', function() {
    beforeEach(inject([
      'aoeTemplate',
      function(aoeTemplateService) {
        this.aoeTemplateService = aoeTemplateService;
        this.modelService = spyOnService('model');
      }
    ]));

    when('setOrigin(<factions>, <origin>), ', function() {
      this.aoeTemplateService.setOrigin('factions', this.origin, this.template);
    }, function() {
      beforeEach(function() {
        this.template = {
          state: { x: 240, y: 240, r: 0 }
        };
        this.origin = {
          state: { x: 120, y: 120 }
        };
        this.modelService.baseEdgeInDirection._retVal = {
          x: 124, y: 124
        };
      });
      
      it('should set template orientation away from <origin>', function() {
        expect(this.template.state.r)
          .toEqual(135);
      });
      
      it('should calculate max deviation from <origin>', function() {
        expect(this.modelService.baseEdgeInDirection)
          .toHaveBeenCalledWith('factions', 135, this.origin);
        expect(this.template.state.m)
          .toEqual(8.202438661763951);
      });

      when('aoe is locked', function() {
        this.template.state.lk = true;
      }, function() {
        it('should no set template orientation', function() {
          expect(this.template.state.r)
            .toEqual(0);
        });
      });
    });

    when('setTarget(<factions>, <origin>, <target>), ', function() {
      this.aoeTemplateService.setTarget('factions', null, this.target, this.template);
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
        it('should center template on <target>', function() {
          expect(this.template.state)
            .toEqual({ x: 240, y: 240, r: 0, lk: true });
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
      this.sprayTemplateService.setOrigin('factions', this.origin, this.template);
    }, function() {
      beforeEach(function() {
        this.template = {
          state: { x: 240, y: 240, r: 42 }
        };
        this.origin = {
          state: { stamp: 'origin' }
        };
        this.modelService.baseEdgeInDirection._retVal = {
          x: 124, y: 124
        };
      });
      
      it('should set template position to <origin> base edge', function() {
        expect(this.modelService.baseEdgeInDirection)
          .toHaveBeenCalledWith('factions', 42, this.origin);
        
        expect(R.pick(['x','y','r'], this.template.state))
          .toEqual({ x: 124, y: 124, r: 42 });
      });
      
      it('should set template origin', function() {
        expect(this.sprayTemplateService.origin(this.template))
          .toEqual('origin');
      });

      when('spray is locked', function() {
        this.template.state.lk = true;
      }, function() {
        it('should set template position to <origin> base edge', function() {
          expect(R.pick(['x','y','r'], this.template.state))
            .toEqual({ x: 240, y: 240, r: 42 });
        });
      });
    });

    when('setTarget(<factions>, <origin>, <target>), ', function() {
      this.sprayTemplateService.setTarget('factions', this.origin, this.target, this.template);
    }, function() {
      beforeEach(function() {
        this.template = {
          state: { x: 240, y: 240, r: 0 }
        };
        this.origin = {
          state: { x: 240, y: 240 }
        };
        this.modelService.baseEdgeInDirection._retVal = {
          x: 236, y: 236
        };
        this.target = {
          state: { x: 120, y: 120 }
        };
      });
      
      it('should center template on <target>', function() {
        expect(this.modelService.baseEdgeInDirection)
          .toHaveBeenCalledWith('factions', -45, this.origin);
        
        expect(this.template.state)
          .toEqual({ x: 236, y: 236, r: -45 });
      });

      when('spray is locked', function() {
        this.template.state.lk = true;
      }, function() {
        it('should not center template on <target>', function() {
          expect(R.pick(['x','y','r'], this.template.state))
            .toEqual({ x: 240, y: 240, r: 0 });
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
        this.sprayTemplateService[e.move](true, this.template);
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
          it('should forward to templateService', function() {
            expect(this.templateService[e.move])
              .not.toHaveBeenCalled();
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
        this.sprayTemplateService[e.move]('factions', this.origin,
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
          it('should rotate <template> around <origin> base edge', function() {
            expect(this.modelService.baseEdgeInDirection)
              .toHaveBeenCalledWith('factions', e.new_dir, 'origin');
            expect(this.templateService.setPosition)
              .toHaveBeenCalledWith('model.baseEdgeInDirection.returnValue',
                                    this.template);
          });
        });

        when('spray is locked', function() {
          this.origin = null;
          this.templateService.isLocked._retVal = true;
        }, function() {
          it('should not forward to templateService', function() {
            expect(this.templateService[e.move])
              .not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});
