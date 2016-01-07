describe('roll dice', function() {
  describe('rollDiceCommand service', function() {
    beforeEach(inject([ 'rollDiceCommand', function(rollDiceCommand) {
      this.rollDiceCommandService = rollDiceCommand;
    }]));

    describe('execute(<sides>, <dice>, <state>, <game>)', function() {
      beforeEach(function() {
        this.state = jasmine.createSpyObj('state', ['changeEvent']);
        var fake_dice = [5,4,2,6];
        var ndie = 0;
        spyOn(R, 'randomRange')
          .and.callFake(function() { return fake_dice[ndie++]; });

        let game = { dice: [] };
        [this.ctxt,this.game] = this.rollDiceCommandService
          .execute(6, 4, this.state, game);
      });
      
      it('should send diceRoll event', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.dice.roll');
      });

      it('should return context', function() {
        expect(this.ctxt).toEqual({
          desc: 'd6[5,4,2,6] = 17',
          s: 6, n: 4,
          d: [ 5, 4, 2, 6 ]
        });
      });
    });

    describe('replay(<ctxt>, <state>, <game>)', function() {
      beforeEach(function() {
        this.ctxt = {
          desc: 'd6[5,4,2,6] = 17',
          s: 6, n: 4,
          d: [ 5, 4, 2, 6 ]
        };
        this.state = jasmine.createSpyObj('state', ['changeEvent']);

        let game = { dice: [] };
        this.game = this.rollDiceCommandService
          .replay(this.ctxt, this.state, game);
      });
      
      it('should add ctxt to game dice rolls', function() {
        expect(this.game.dice).toEqual([{
          desc: 'd6[5,4,2,6] = 17',
          s: 6, n: 4,
          d: [ 5, 4, 2, 6 ]
        }]);
      });
    });

    describe('undo(<ctxt>, <state>, <game>)', function() {
      beforeEach(function() {
        this.ctxt = {
          stamp: 'ctxt'
        };
        this.state = jasmine.createSpyObj('state', ['changeEvent']);

        let game = { dice: [
          { stamp: 'other1' },
          { stamp: 'ctxt' },
          { stamp: 'other2' },
        ] };
        this.game = this.rollDiceCommandService
          .undo(this.ctxt, this.state, game);
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
