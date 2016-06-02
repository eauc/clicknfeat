describe('rollDiceCommand model', function() {
  beforeEach(inject([
    'rollDiceCommand',
    function(rollDiceCommand) {
      this.rollDiceCommandModel = rollDiceCommand;

      this.game = 'game';
    }
  ]));

  context('executeP(<sides>, <dice>, <state>, <game>)', function() {
    return this.rollDiceCommandModel
      .executeP(6, 4, this.game);
  }, function() {
    beforeEach(function() {
      const fake_dice = [5,4,2,6];
      let ndie = 0;
      spyOn(R, 'randomRange')
        .and.callFake(() => { return fake_dice[ndie++]; });
    });

    it('should return context', function() {
      expect(this.context[0]).toEqual({
        desc: 'd6[5,4,2,6] = 17',
        s: 6, n: 4,
        d: [ 5, 4, 2, 6 ]
      });
    });
  });

  context('replayP(<ctxt>, <state>, <game>)', function() {
    return this.rollDiceCommandModel
      .replayP(this.ctxt, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        desc: 'd6[5,4,2,6] = 17',
        s: 6, n: 4,
        d: [ 5, 4, 2, 6 ]
      };
    });

    it('should return same game', function() {
      expect(this.context)
        .toBe('game');
    });
  });

  context('undoP(<ctxt>, <state>, <game>)', function() {
    return this.rollDiceCommandModel
      .undoP(this.ctxt, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        stamp: 'ctxt'
      };
    });

    it('should same game', function() {
      expect(this.context).toBe('game');
    });
  });
});
