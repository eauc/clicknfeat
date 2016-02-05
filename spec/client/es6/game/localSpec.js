describe('local game', function() {
  describe('games service', function() {
    beforeEach(inject([
      'games',
      function(gamesService) {
        this.gamesService = gamesService;

        this.gameService = spyOnService('game');
        this.gameService.pickForJson
          .and.callFake((g) => { return g+'_JSON'; });
      }
    ]));

    when('updateLocalGame(<game>)', function() {
      this.ret = this.gamesService
        .updateLocalGame(this.game, this.games);
    }, function() {
      beforeEach(function() {
        this.game = {
          game: 'game',
          local_stamp: 'stamp'
        };
        this.games = [
          { local_stamp: 'other2' },
          { local_stamp: 'stamp' },
          { local_stamp: 'other1' }
        ];
        this.localStorageService.save
          .resolveWith = (k,g) => g;
      });

      it('should update game in storage', function() {
        this.thenExpect(this.ret, () => {
          expect(this.localStorageService.save)
            .toHaveBeenCalledWith('clickApp.game.stamp',
                                  this.game);
        });
      });

      it('should update game in list', function() {
        this.thenExpect(this.ret, (games) => {
          expect(games)
            .toEqual([
              { local_stamp: 'other2' },
              this.game,
              { local_stamp: 'other1' }
            ]);
        });
      });
    });
  });
});
