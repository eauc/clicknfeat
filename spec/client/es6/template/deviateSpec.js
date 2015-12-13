'use strict';

describe('deviate template', function() {
  describe('rollDeviationCommand service', function() {
    beforeEach(inject([ 'rollDeviationCommand', function(rollDeviationCommand) {
      this.rollDeviationCommandService = rollDeviationCommand;
    }]));

    describe('execute(<sides>, <dice>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        var fake_dice = [5,4];
        var ndie = 0;
        spyOn(R, 'randomRange')
          .and.callFake(function() { return fake_dice[ndie++]; });

        this.game = { dice: [] };
        this.ctxt = this.rollDeviationCommandService.execute(this.scope, this.game);
      });
      
      it('should add dice command to dice rolls', function() {
        expect(this.game.dice).toEqual([{
          desc: 'AoE deviation : direction 5, distance 4"',
          r: 5, d: 4
        }]);
      });
      
      it('should send diceRoll event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('diceRoll');
      });

      it('should return context', function() {
        expect(this.ctxt).toEqual({
          desc: 'AoE deviation : direction 5, distance 4"',
          r: 5, d: 4
        });
      });
    });

    describe('replay(<ctxt>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.ctxt = {
          desc: 'AoE deviation : direction 5, distance 4"',
          r: 5, d: 4
        };
        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        this.game = { dice: [] };

        this.rollDeviationCommandService.replay(this.ctxt, this.scope, this.game);
      });
      
      it('should add ctxt to game dice rolls', function() {
        expect(this.game.dice).toEqual([{
          desc: 'AoE deviation : direction 5, distance 4"',
          r: 5, d: 4
        }]);
      });
      
      it('should send diceRoll event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('diceRoll');
      });
    });

    describe('undo(<ctxt>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.ctxt = {
          stamp: 'ctxt'
        };
        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        this.game = { dice: [
          { stamp: 'other1' },
          { stamp: 'ctxt' },
          { stamp: 'other2' },
        ] };

        this.rollDeviationCommandService.undo(this.ctxt, this.scope, this.game);
      });
      
      it('should remove ctxt from game dice rolls', function() {
        expect(this.game.dice).toEqual([
          { stamp: 'other1' },
          { stamp: 'other2' },
        ]);
      });
      
      it('should send diceRoll event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('diceRoll');
      });
    });
  });

  describe('aoeTemplateMode service', function() {
    beforeEach(inject([
      'aoeTemplateMode',
      function(aoeTemplateModeService) {
        this.aoeTemplateModeService = aoeTemplateModeService;
        this.gameService = spyOnService('game');
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection',
                  templates: 'templates' },
          gameEvent: jasmine.createSpy('gameEvent'),
        };
      }
    ]));

    when('user deviates template selection', function() {
      this.ret = this.aoeTemplateModeService.actions.deviate(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
        mockReturnPromise(this.gameService.executeCommand);
        this.gameService.executeCommand.resolveWith = function(c) {
          if(c === 'rollDeviation') {
            return self.Promise.resolve({ r: 4, d: 2 });
          }
          return 'game.executeCommand.returnValue';
        };
      });

      it('should get current selection', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute rollDeviation command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('rollDeviation',
                                this.scope, this.scope.game);
      });

      it('should execute onTemplates/deviate command', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onTemplates', 'deviate', 4, 2, ['stamp'],
                                  this.scope, this.scope.game);
        });
      });
    });

    describe('when user set max deviation', function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
        mockReturnPromise(this.gameTemplatesService.onStamps);
        this.gameTemplatesService.onStamps.resolveWith = [42];

        this.ret = this.aoeTemplateModeService.actions
          .setMaxDeviation(this.scope);
      });

      it('should get current selection max deviation', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameTemplatesService.onStamps)
          .toHaveBeenCalledWith('maxDeviation', ['stamp'], 'templates');
      });

      it('should prompt user for max deviation', function() {
        this.thenExpect(this.gameTemplatesService.onStamps.promise, function() {
          expect(this.promptService.prompt)
            .toHaveBeenCalledWith('prompt',
                                  'Set AoE max deviation :',
                                  42);
        });
      });

      describe('when user set max deviation', function() {
        beforeEach(function() {
          this.promptService.prompt.resolveWith = 42;
        });

        it('should set max deviation', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameTemplatesService.onStamps)
              .toHaveBeenCalledWith('setMaxDeviation', 42, ['stamp'], 'templates');
          });
        });
      });

      describe('when user reset max deviation', function() {
        beforeEach(function() {
          this.promptService.prompt.resolveWith = 0;
        });

        it('should set max deviation', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameTemplatesService.onStamps)
              .toHaveBeenCalledWith('setMaxDeviation', null, ['stamp'], 'templates');
          });
        });
      });

      describe('when user cancels prompt', function() {
        beforeEach(function() {
          this.promptService.prompt.rejectWith = 'canceled';
        });

        it('should reset max deviation', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameTemplatesService.onStamps)
              .toHaveBeenCalledWith('setMaxDeviation', null, ['stamp'], 'templates');
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

    describe('deviate(<dir>, <len>)', function() {
      beforeEach(function() {
        this.template = {
          state: { x: 240, y:240, r: 30 }
        };
      });

      using([
        [ 'dir', 'len' , 'result' ],
        [ 1     , 2    , { x: 250, y: 222.67949192431124, r: 30 } ],
        [ 2     , 3    , { x: 270, y: 240, r: 90 } ],
        [ 3     , 4    , { x: 260, y: 274.6410161513775, r: 150 } ],
        [ 4     , 5    , { x: 215, y: 283.30127018922195, r: 210 } ],
        [ 5     , 6    , { x: 180, y: 240, r: 270 } ],
        [ 6     , 1    , { x: 235, y: 231.3397459621556, r: 330 } ],
      ], function(e, d) {
        it('should deviate template, '+d, function() {
          this.aoeTemplateService.deviate(e.dir, e.len, this.template);
          expect(this.template.state)
            .toEqual(e.result);
        });
      });

      describe('enforces max deviation', function() {
        using([
          [ 'max', 'dir', 'len' , 'result' ],
          [ 10   , 1     , 2    , { x: 240, y: 260, r: 180, m:10 } ],
          [ 3    , 1     , 3    , { x: 240, y: 270, r: 180, m:3 } ],
          [ 2    , 1     , 4    , { x: 240, y: 260, r: 180, m:2 } ],
        ], function(e, d) {
          beforeEach(function() {
            this.template.state.r = 180;
          });

          it('should deviate template, '+d, function() {
            this.aoeTemplateService.setMaxDeviation(e.max, this.template);
            expect(this.aoeTemplateService.maxDeviation(this.template))
              .toBe(e.max);

            this.aoeTemplateService.deviate(e.dir, e.len, this.template);
            expect(this.template.state)
              .toEqual(e.result);
          });
        });
      });

      when('aoe is locked', function() {
      }, function() {
        it('should not deviate template', function() {
          this.template.state.lk = true;
          this.aoeTemplateService.deviate(42, 71, this.template);
          expect(this.template.state)
            .toEqual({ x: 240, y: 240, r: 30, lk: true });
        });
      });
    });
  });
});
