describe('game', function() {
  describe('game service', function() {
    beforeEach(inject([
      'game',
      function(gameService) {
        this.gameService = gameService;
      }
    ]));

    describe('description()', function() {
      using([
        [ 'game', 'desc' ],
        [ { players: { p1: { name: 'p1' },
                       p2: { name: null } } }, 'P1 vs John Doe' ],
        [ { players: { p1: { name: null },
                       p2: { name: 'p2' } } }, 'John Doe vs P2' ],
        [ { players: { p1: { name: 'p1' },
                       p2: { name: 'p2' } } }, 'P1 vs P2' ],
      ], function(e, d) {
        it('should build description string for the game, '+d, function() {
          expect(this.gameService.description(e.game))
            .toEqual(e.desc);
        });
      });
    });
    
    when('toJson()', function() {
      this.ret = this.gameService.toJson({
        players: 'players',
        commands: 'commands',
        undo: 'undo',
        other: 'other'
      });
    }, function() {
      beforeEach(function() {
        this.jsonStringifierService.stringify
          .resolveWith = 'jsonStringifier.stringify.returnValue';
      });
      
      it('should pick selected keys', function() {
        this.thenExpect(this.ret, (json) => {
          expect(this.jsonStringifierService.stringify)
            .toHaveBeenCalledWith({
              players:'players',
              commands:'commands',
              undo:'undo'
            });

          expect(json).toEqual('jsonStringifier.stringify.returnValue');
        });
      });
    });
  });
});
