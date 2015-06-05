'use strict';

describe('roll dice', function() {
  describe('gameMainCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.gameBoardService = spyOnService('gameBoard');
        this.gameService = spyOnService('game');

        this.createController = function() {
          this.scope = $rootScope.$new();
          this.scope.onGameEvent = jasmine.createSpy('onGameEvent');
          this.scope.digestOnGameEvent = jasmine.createSpy('digestOnGameEvent');
          this.scope.game = { 'this': 'game' };

          $controller('gameMainCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    when('user roll dice', function() {
      this.scope.doRollDice(6, 4);
    }, function() {
      it('should execute rollDice command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('rollDice',
                                6, 4,
                                this.scope, this.scope.game);
      });
    });
  });

  describe('rollDiceCommand service', function() {
    beforeEach(inject([ 'rollDiceCommand', function(rollDiceCommand) {
      this.rollDiceCommandService = rollDiceCommand;
    }]));

    describe('execute(<sides>, <dice>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        var fake_dice = [5,4,2,6];
        var ndie = 0;
        spyOn(R, 'randomRange')
          .and.callFake(function() { return fake_dice[ndie++]; });

        this.game = { dice: [] };
        this.ctxt = this.rollDiceCommandService.execute(6, 4, this.scope, this.game);
      });
      
      it('should add dice command to dice rolls', function() {
        expect(this.game.dice).toEqual([{
          desc: 'd6[5,4,2,6] =  17',
          s: 6, n: 4,
          d: [ 5, 4, 2, 6 ]
        }]);
      });
      
      it('should send diceRoll event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('diceRoll');
      });

      it('should return context', function() {
        expect(this.ctxt).toEqual({
          desc: 'd6[5,4,2,6] =  17',
          s: 6, n: 4,
          d: [ 5, 4, 2, 6 ]
        });
      });
    });

    describe('replay(<ctxt>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.ctxt = {
          desc: 'd6[5,4,2,6] =  17',
          s: 6, n: 4,
          d: [ 5, 4, 2, 6 ]
        };
        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        this.game = { dice: [] };

        this.rollDiceCommandService.replay(this.ctxt, this.scope, this.game);
      });
      
      it('should add ctxt to game dice rolls', function() {
        expect(this.game.dice).toEqual([{
          desc: 'd6[5,4,2,6] =  17',
          s: 6, n: 4,
          d: [ 5, 4, 2, 6 ]
        }]);
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

        this.rollDiceCommandService.undo(this.ctxt, this.scope, this.game);
      });
      
      it('should remove ctxt from game dice rolls', function() {
        expect(this.game.dice).toEqual([
          { stamp: 'other1' },
          { stamp: 'other2' },
        ]);
      });
    });
  });
});
