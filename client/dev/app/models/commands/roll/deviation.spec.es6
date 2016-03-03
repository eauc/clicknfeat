describe('rollDeviationCommand model', function() {
  beforeEach(inject([
    'rollDeviationCommand',
    function(rollDeviationCommand) {
      this.rollDeviationCommandModel = rollDeviationCommand;

      this.game = { dice: [] };
      this.state = jasmine.createSpyObj('state', [
        'queueChangeEventP'
      ]);
    }
  ]));

  describe('executeP(<sides>, <dice>, <state>, <game>)', function() {
    beforeEach(function() {
      const fake_dice = [5,4];
      let ndie = 0;
      spyOn(R, 'randomRange')
        .and.callFake(() => { return fake_dice[ndie++]; });

      [this.ctxt, this.game] = this.rollDeviationCommandModel
        .executeP(this.state, this.game);
    });

    it('should send diceRoll event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.dice.roll');
    });

    it('should return context', function() {
      expect(this.ctxt).toEqual({
        desc: 'AoE deviation : direction 5, distance 4"',
        r: 5, d: 4
      });
    });
  });

  describe('replayP(<ctxt>, <state>, <game>)', function() {
    beforeEach(function() {
      this.ctxt = {
        desc: 'AoE deviation : direction 5, distance 4"',
        r: 5, d: 4
      };

      this.game = this.rollDeviationCommandModel
        .replayP(this.ctxt, this.state, this.game);
    });

    it('should add ctxt to game dice rolls', function() {
      expect(this.game.dice).toEqual([{
        desc: 'AoE deviation : direction 5, distance 4"',
        r: 5, d: 4
      }]);
    });

    it('should send diceRoll event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.dice.roll');
    });
  });

  describe('undoP(<ctxt>, <state>, <game>)', function() {
    beforeEach(function() {
      this.ctxt = {
        stamp: 'ctxt'
      };
      this.game = { dice: [
        { stamp: 'other1' },
        { stamp: 'ctxt' },
        { stamp: 'other2' },
      ] };

      this.game = this.rollDeviationCommandModel
        .undoP(this.ctxt, this.state, this.game);
    });

    it('should remove ctxt from game dice rolls', function() {
      expect(this.game.dice).toEqual([
        { stamp: 'other1' },
        { stamp: 'other2' },
      ]);
    });

    it('should send diceRoll event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.dice.roll');
    });
  });
});
