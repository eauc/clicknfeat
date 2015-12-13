'use strict';

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
      }
    ]));

    describe('loadLocalGames()', function() {
      it('should retrieve local games from local storage', function() {
        this.thenExpect(this.gamesService.loadLocalGames(), function(games) {
          expect(this.localStorageService.load)
            .toHaveBeenCalledWith('clickApp.local_games');
                          
          expect(games)
            .toEqual(['game1','game2']);
        });

        this.localStorageService.load.resolve(['game1','game2']);
      });
    });

    describe('storeLocalGames(<games>)', function() {
      it('should store games', function() {
        this.thenExpect(this.gamesService.storeLocalGames(['game1','game2']), function(games) {
          expect(this.localStorageService.save)
            .toHaveBeenCalledWith('clickApp.local_games', ['game1','game2']);
          
          expect(games).toEqual(['game1','game2']);
        });
        
        this.localStorageService.save.resolve(['game1','game2']);
      });
    }); 
    
    describe('removeLocalGame(<game>)', function() {
      it('should store modified games list', function() {
        this.thenExpect(this.gamesService.removeLocalGame(1, ['game1','game2','game3']), function(games) {
          expect(this.localStorageService.save)
            .toHaveBeenCalledWith('clickApp.local_games', ['game1','game3']);

          expect(games).toEqual(['game1','game3']);
        });
        
        this.localStorageService.save.resolve(['game1','game3']);
      });
    });

    describe('newLocalGame(<game>)', function() {
      it('should store appended games list', function() {
        this.thenExpect(this.gamesService.newLocalGame('game3', ['game1','game2']), function(games) {
          expect(this.localStorageService.save)
            .toHaveBeenCalledWith('clickApp.local_games', ['game1','game2','game3']);

          expect(games).toEqual(['game1','game2','game3']);
        });

        this.localStorageService.save.resolve(['game1','game2','game3']);
      });
    });
  });
});
