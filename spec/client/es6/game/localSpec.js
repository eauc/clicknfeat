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

    when('loadLocalGames()', function() {
      this.ret = this.gamesService.loadLocalGames();
    }, function() {
      beforeEach(function() {
        this.localStorageService.keys._retVal = [
          'clickApp.game.1',
          'clickApp.other',
          'clickApp.game.2'
        ];
        this.localStorageService.load.resolveWith = (k) => {
          return k+'Data';
        };
      });

      it('should retrieve keys from local storage', function() {
        this.thenExpect(this.ret, () => {
          expect(this.localStorageService.keys)
            .toHaveBeenCalled();
        });
      });

      it('should retrieve all local games from local storage', function() {
        this.thenExpect(this.ret, () => {
          expect(this.localStorageService.load)
            .toHaveBeenCalledWith('clickApp.game.1');
          expect(this.localStorageService.load)
            .toHaveBeenCalledWith('clickApp.game.2');
        });
      });

      it('should return loaded games', function() {
        this.thenExpect(this.ret, (games) => {
          expect(games)
            .toEqual([ 'clickApp.game.1Data',
                       'clickApp.game.2Data'
                     ]);
        });
      });
    });

    when('saveLocalGame(<games>)', function() {
      this.ret = this.gamesService.saveLocalGame(this.game);
    }, function() {
      beforeEach(function() {
        this.game = { local_stamp: 'stamp' };
        this.localStorageService.save
          .resolveWith = (k,g) => g;
      });

      it('should store game', function() {
        this.thenExpect(this.ret, (game) => {
          expect(this.localStorageService.save)
            .toHaveBeenCalledWith('clickApp.game.stamp', this.game);

          expect(game).toEqual(this.game);
        });
      });
    });

    when('loadLocalGame(<games>)', function() {
      this.ret = this.gamesService.loadLocalGame('stamp');
    }, function() {
      beforeEach(function() {
        this.game = { local_stamp: 'stamp' };
        this.localStorageService.load
          .resolveWith = this.game;
      });

      it('should store game', function() {
        this.thenExpect(this.ret, (game) => {
          expect(this.localStorageService.load)
            .toHaveBeenCalledWith('clickApp.game.stamp');

          expect(game).toEqual(this.game);
        });
      });
    });

    when('newLocalGame(<game>)', function() {
      this.ret = this.gamesService
        .newLocalGame(this.game, this.games);
    }, function() {
      beforeEach(function() {
        this.game = { game: 'game' };
        this.games = [
          { local_stamp: 'other2' },
          { local_stamp: 'other1' }
        ];

        spyOn(R, 'guid').and.returnValue('stamp');
        this.localStorageService.save
          .resolveWith = (k,g) => g;
      });

      it('should store new game', function() {
        this.thenExpect(this.ret, function() {
          expect(this.localStorageService.save)
            .toHaveBeenCalledWith('clickApp.game.stamp', {
              game: 'game',
              local_stamp: 'stamp'
            });
        });
      });

      it('should add game to list', function() {
        this.thenExpect(this.ret, (games) => {
          expect(games)
            .toEqual([
              { local_stamp: 'other2' },
              { local_stamp: 'other1' },
              { game: 'game',
                local_stamp: 'stamp'
              }
            ]);
        });
      });
    });

    when('removeLocalGame(<game>)', function() {
      this.ret = this.gamesService
        .removeLocalGame('stamp', this.games);
    }, function() {
      beforeEach(function() {
        this.games = [
          { local_stamp: 'other2' },
          { local_stamp: 'stamp' },
          { local_stamp: 'other1' }
        ];
        this.localStorageService.removeItem
          .resolveWith = 'localStorage.removeItem.returnValue';
      });

      it('should remove game from storage', function() {
        this.thenExpect(this.ret, () => {
          expect(this.localStorageService.removeItem)
            .toHaveBeenCalledWith('clickApp.game.stamp');
        });
      });

      it('should drop game from list', function() {
        this.thenExpect(this.ret, (games) => {
          expect(games)
            .toEqual([
              { local_stamp: 'other2' },
              { local_stamp: 'other1' }
            ]);
        });
      });
    });

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
