'use strict';

describe('set aoe to ruler', function() {
  describe('aoeTemplateMode service', function() {
    beforeEach(inject([
      'aoeTemplateMode',
      function(aoeTemplateModeService) {
        this.aoeTemplateModeService = aoeTemplateModeService;
        this.gameService = spyOnService('game');
        this.gameRulerService = spyOnService('gameRuler');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection',
                  ruler:'ruler',
                  models: 'models' },
        };
      }
    ]));

    when('user set aoe to ruler target', function() {
      this.aoeTemplateModeService.actions['setToRulerTarget'](this.scope);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = 'stamp';
      });

      when('ruler is not displayed', function() {
        this.gameRulerService.isDisplayed._retVal = false;
      }, function() {
        it('should not execute command', function() {
          expect(this.gameService.executeCommand)
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
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onTemplates', 'setToRuler',
                                  'gameRuler.targetAoEPosition.returnValue', ['stamp'],
                                  this.scope, this.scope.game);
        });
      });
    });
  });

  describe('rulerMode service', function() {
    beforeEach(inject([
      'rulerMode',
      function(rulerModeService) {
        this.rulerModeService = rulerModeService;
        this.gameService = spyOnService('game');
        this.gameRulerService = spyOnService('gameRuler');

        this.scope = {
          game: { template_selection: 'selection',
                  ruler:'ruler',
                  models: 'models' },
        };
      }
    ]));

    when('user set aoe to ruler target', function() {
      this.rulerModeService.actions['createAoEOnTarget'](this.scope);
    }, function() {
      beforeEach(function() {
        this.gameRulerService.targetAoEPosition._retVal = {
          position: 'gameRuler.targetAoEPosition.returnValue'
        };
      });
      
      it('should get ruler target position', function() {
        expect(this.gameRulerService.targetAoEPosition)
          .toHaveBeenCalledWith('models', 'ruler');
      });
      
      it('should execute createTemplate command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('createTemplate', {
            position: 'gameRuler.targetAoEPosition.returnValue',
            type: 'aoe'
          }, this.scope, this.scope.game);
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

    describe('targetAoEPosition()', function() {
        beforeEach(function() {
          this.ruler = {
            remote: { start: { x:0, y: 0 },
                      end: { x: 240, y: 240 },
                      length: 4.5
                    }
          };
          this.gameModelsService.findStamp._retVal = {
            state: { x: 320, y: 320 }
          };
        });

      when('ruler target is not set', function() {
        this.ruler.remote.target = null;
      }, function() {
        it('should return end of ruler position', function() {
          expect(this.gameRulerService.targetAoEPosition('models', this.ruler))
            .toEqual({
              x: 240, y: 240, r: 135, m: 2.25
            });
        });
      });

      when('ruler target is set but not reached', function() {
        this.ruler.remote.target = 'target';
        this.ruler.remote.reached = false;
      }, function() {
        it('should return end of ruler position', function() {
          expect(this.gameRulerService.targetAoEPosition('models', this.ruler))
            .toEqual({
              x: 240, y: 240, r: 135, m: 2.25
            });
        });
      });

      when('ruler target is set and reached', function() {
        this.ruler.remote.target = 'target';
        this.ruler.remote.reached = true;
      }, function() {
        it('should return end of ruler position', function() {
          expect(this.gameRulerService.targetAoEPosition('models', this.ruler))
            .toEqual({
              x: 320, y: 320, r: 135, m: 2.25
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

    describe('setToRuler(<position>)', function() {
        beforeEach(function() {
          this.template = {
            state: { stamp: 'stamp', x: 240, y: 240, r: 180, m: null }
          };
        });

      it('should set aoe to ruler position', function() {
        this.aoeTemplateService.setToRuler({
          x: 42, y: 71, r: 83, m: 32
        }, this.template);
        expect(this.template.state)
          .toEqual({
            stamp: 'stamp', x: 42, y: 71, r: 83, m: 32
          });
      });
    });
  });
});
