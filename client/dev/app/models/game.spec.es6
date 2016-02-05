describe('game model', function() {
  beforeEach(inject([ 'game', function(gameModel) {
    this.gameModel = gameModel;
  }]));

  context('create(<user>)', function() {
    return this.gameModel.create({ name: 'user' });
  }, function() {
    it('should create default game', function() {
      expect(this.context)
        .toEqual({
          players: {
            p1: { name: 'user' },
            p2: { name: null   }
          }
        });
    });
  });

  describe('description()', function() {
    example(function(e, d) {
      it('should build description string for the game, '+d, function() {
        expect(this.gameModel.description(e.game))
          .toEqual(e.desc);
      });
    }, [
      [ 'game', 'desc' ],
      [ { players: { p1: { name: 'p1' },
                     p2: { name: null } } }, 'P1 vs John Doe' ],
      [ { players: { p1: { name: null },
                     p2: { name: 'p2' } } }, 'John Doe vs P2' ],
      [ { players: { p1: { name: 'p1' },
                       p2: { name: 'p2' } } }, 'P1 vs P2' ],
    ]);
  });

  context('toJson()', function() {
    return this.gameModel.toJson({
      players: 'players',
      commands: 'commands',
      undo: 'undo',
      other: 'other'
    });
  }, function() {
    beforeEach(function() {
      this.jsonStringifierService = spyOnService('jsonStringifier');
    });

    it('should pick selected keys', function() {
      expect(this.jsonStringifierService.stringify)
        .toHaveBeenCalledWith({
          players:'players',
          commands:'commands',
          undo:'undo'
        });

      expect(this.context)
        .toEqual('jsonStringifier.stringify.returnValue');
    });
  });
});
