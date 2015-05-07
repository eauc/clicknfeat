'use strict';

describe('game', function() {

  beforeEach(function() {
    module('clickApp.controllers');
    module('clickApp.services');
  });

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
  });
});
