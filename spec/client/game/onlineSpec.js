'use strict';

describe('local game', function() {
  describe('games service', function() {
    beforeEach(inject([
      'games',
      function(gamesService) {
        this.gamesService = gamesService;

        this.httpService = spyOnService('http');
      }
    ]));

    when('newOnlineGame(<game>)', function() {
      this.ret = this.gamesService.newOnlineGame(this.game);
    }, function() {
      beforeEach(function() {
        this.game = {
          players: 'players',
          commands: 'commands',
          undo: 'undo',
          chat: 'chat',
          other: 'other',
        }
      });

      it('should create game online', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.httpService.post)
            .toHaveBeenCalledWith('/api/games', {
              players: 'players',
              commands: 'commands',
              undo: 'undo',
              chat: 'chat',
            });

          expect(result).toBe('http.post.returnValue');
        });
      });
    });

    when('loadOnlineGame(<is_private>, <id>)', function() {
      this.ret = this.gamesService
        .loadOnlineGame(this.is_private, this.id);
    }, function() {
      beforeEach(function() {
        this.id = 'id';
        mockReturnPromise(this.httpService.get);
        this.httpService.get.resolveWith = 'http.get.returnValue';
      });

      using([
        [ 'is_private', 'url'                   ],
        [ true        , '/api/games/private/id' ],
        [ false       , '/api/games/public/id'  ],
      ], function(e, d) {
        when(d, function() {
          this.is_private = e.is_private;
        }, function() {
          it('should get game online', function() {
            this.thenExpect(this.ret, function(result) {
              expect(this.httpService.get)
                .toHaveBeenCalledWith(e.url);
              expect(result).toBe('http.get.returnValue');
            });
          });
        });
      });
    });
  });
});
