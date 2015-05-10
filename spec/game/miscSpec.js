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
        expect(this.gameService.toJson({
          players: 'players',
          commands: 'commands',
          undo: 'undo',
          other: 'other',
        })).toEqual('{"players":"players","commands":"commands","undo":"undo"}');
      });

      it('should drop angular tags', function() {
        expect(this.gameService.toJson({
          players: { $$tag: 'tag', p1: 'p1' },
          commands: [ { $$key: 'key', cmd: 'cmd' } ],
          other: 'other',
        })).toEqual('{"players":{"p1":"p1"},"commands":[{"cmd":"cmd"}]}');
      });
    });
  });
});
