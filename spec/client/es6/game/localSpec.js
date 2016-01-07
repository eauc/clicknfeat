describe('local game', function() {
  describe('game service', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
    }]));

    describe('create(<user>)', function() {
      it('should create default game', function() {
        expect(this.gameService.create({ name: 'user' }))
          .toEqual({
            players: {
              p1: { name: 'user' },
              p2: { name: null   }
            }
          });
      });
    });
  });

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

    describe('loadLocalGames()', function() {
      it('should retrieve local games from local storage', function() {
        this.localStorageService.load.resolveWith = ['game1','game2'];

        this.ret = this.gamesService.loadLocalGames();

        this.thenExpect(this.ret, (games) => {
          expect(this.localStorageService.load)
            .toHaveBeenCalledWith('clickApp.games');

          expect(games)
            .toEqual(['game1','game2']);
        });
      });
    });

    describe('storeLocalGames(<games>)', function() {
      it('should store games', function() {
        this.localStorageService.save.resolveWith = ['game1','game2'];

        this.ret = this.gamesService.storeLocalGames(['game1','game2']);

        this.thenExpect(this.ret, (games) => {
          expect(this.localStorageService.save)
            .toHaveBeenCalledWith('clickApp.games', ['game1_JSON','game2_JSON']);

          expect(games).toEqual(['game1','game2']);
        });
      });
    });

    describe('removeLocalGame(<game>)', function() {
      it('should store modified games list', function() {
        this.ret = this.gamesService
          .removeLocalGame(1, ['game1','game2','game3']);

        expect(this.ret).toEqual(['game1','game3']);
      });
    });

    describe('newLocalGame(<game>)', function() {
      it('should store appended games list', function() {
        this.ret = this.gamesService
          .newLocalGame('game3', ['game1','game2']);

        expect(this.ret).toEqual(['game1','game2','game3']);
      });
    });
  });
});
