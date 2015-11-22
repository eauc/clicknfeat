'use strict';

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
        [ { description: 'gameDesc' }, 'gameDesc' ],
        [ { players: { p1: { name: 'p1' },
                       p2: { name: null } } }, 'p1 vs John Doe' ],
        [ { players: { p1: { name: null },
                       p2: { name: 'p2' } } }, 'John Doe vs p2' ],
        [ { players: { p1: { name: 'p1' },
                       p2: { name: 'p2' } } }, 'p1 vs p2' ],
      ], function(e, d) {
        it('should build description string for the game, '+d, function() {
          expect(this.gameService.description(e.game))
            .toEqual(e.desc);
        });
      });
    });
    
    describe('toJson()', function() {
      it('should pick selected keys', function() {
        this.thenExpect(this.gameService.toJson({
          players: 'players',
          commands: 'commands',
          undo: 'undo',
          other: 'other',
        }), function(json) {
          expect(this.jsonStringifierService.stringify)
            .toHaveBeenCalledWith({"players":"players","commands":"commands","undo":"undo"});

          expect(json).toEqual('jsonStringifier.stringify.returnValue');
        });

        this.jsonStringifierService.stringify
          .resolve('jsonStringifier.stringify.returnValue');
      });
    });
  });
});