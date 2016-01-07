describe('set aoe to ruler', function() {
  describe('aoeTemplateMode service', function() {
    beforeEach(inject([
      'aoeTemplateMode',
      function(aoeTemplateModeService) {
        this.aoeTemplateModeService = aoeTemplateModeService;

        this.gameRulerService = spyOnService('gameRuler');
        mockReturnPromise(this.gameRulerService.targetAoEPosition);
        this.gameRulerService.targetAoEPosition
          .resolveWith = 'gameRuler.targetAoEPosition.returnValue';
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.state = {
          game: { template_selection: 'selection',
                  ruler:'ruler',
                  models: 'models' },
          event: jasmine.createSpy('event')
        };
      }
    ]));

    when('user set aoe to ruler target', function() {
      this.ret = this.aoeTemplateModeService.actions.
        setToRulerTarget(this.state);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
      });

      when('ruler is not displayed', function() {
        this.gameRulerService.isDisplayed._retVal = false;
      }, function() {
        it('should not execute command', function() {
          expect(this.state.event)
            .not.toHaveBeenCalled();
        });
      });

      when('ruler is displayed', function() {
        this.gameRulerService.isDisplayed._retVal = true;
      }, function() {
        it('should get current selection', function() {
          expect(this.gameTemplateSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });
      
        it('should get ruler target position', function() {
          expect(this.gameRulerService.targetAoEPosition)
            .toHaveBeenCalledWith('models', 'ruler');
        });

        it('should execute onTemplates/setToRuler command', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onTemplates', [ 'setToRuler',
                                                     ['gameRuler.targetAoEPosition.returnValue'],
                                                     ['stamp']
                                                   ]);
          });
        });
      });
    });
  });

  describe('rulerMode service', function() {
    beforeEach(inject([
      'rulerMode',
      function(rulerModeService) {
        this.rulerModeService = rulerModeService;

        this.gameRulerService = spyOnService('gameRuler');
        mockReturnPromise(this.gameRulerService.targetAoEPosition);
        this.gameRulerService.targetAoEPosition
          .resolveWith = 'gameRuler.targetAoEPosition.returnValue';

        this.state = {
          game: { template_selection: 'selection',
                  ruler:'ruler',
                  models: 'models' },
          event: jasmine.createSpy('event')
        };
      }
    ]));

    when('user create aoe on ruler\'s target', function() {
      this.ret = this.rulerModeService.actions
        .createAoEOnTarget(this.state);
    }, function() {
      beforeEach(function() {
        this.gameRulerService.targetAoEPosition.resolveWith = {
          x: 42, y: 71, r: 45
        };
      });
      
      it('should get ruler target position', function() {
        expect(this.gameRulerService.targetAoEPosition)
          .toHaveBeenCalledWith('models', 'ruler');
      });
      
      it('should execute createTemplate command', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'createTemplate', [ { base: { x: 0, y: 0, r: 0 },
                                                        templates: [ { x: 42, y: 71, r: 45,
                                                                       type: 'aoe' } ]
                                                      }, false ]);
        });
      });
    });
  });

  describe('gameRuler service', function() {
    beforeEach(inject([
      'gameRuler',
      function(gameRulerService) {
        this.gameRulerService = gameRulerService;
        this.gameModelsService = spyOnService('gameModels');
      }
    ]));

    when('targetAoEPosition(<models>)', function() {
      this.ret = this.gameRulerService
        .targetAoEPosition('models', this.ruler);
    }, function() {
        beforeEach(function() {
          this.ruler = {
            remote: { start: { x:0, y: 0 },
                      end: { x: 240, y: 240 },
                      length: 4.5
                    }
          };
          mockReturnPromise(this.gameModelsService.findStamp);
          this.gameModelsService.findStamp.resolveWith = {
            state: { x: 320, y: 320 }
          };
        });

      when('ruler target is not set', function() {
        this.ruler.remote.target = null;
      }, function() {
        it('should return end of ruler position', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result).toEqual({
              x: 240, y: 240, r: 135, m: 2.25
            });
          });
        });
      });

      when('ruler target is set but not reached', function() {
        this.ruler.remote.target = 'target';
        this.ruler.remote.reached = false;
      }, function() {
        it('should return end of ruler position', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result).toEqual({
              x: 240, y: 240, r: 135, m: 2.25
            });
          });
        });
      });

      when('ruler target is set and reached', function() {
        this.ruler.remote.target = 'target';
        this.ruler.remote.reached = true;
      }, function() {
        it('should return end of ruler position', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result).toEqual({
              x: 320, y: 320, r: 135, m: 2.25
            });
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
      }
    ]));

    when('setToRuler(<position>)', function() {
      this.ret = this.aoeTemplateService.setToRuler({
        x: 42, y: 71, r: 83, m: 32
      }, this.template);
    }, function() {
      beforeEach(function() {
        this.template = {
          state: { stamp: 'stamp', x: 240, y: 240, r: 180, m: null }
        };
      });
      
      when('aoe is locked', function() {
        this.template.state.lk = true;
      }, function() {
        it('should reject set to ruler', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Template is locked');
          });
        });
      });
    });
  });
});
