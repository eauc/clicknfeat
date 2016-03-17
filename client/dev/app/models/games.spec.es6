describe('games model', function() {
  beforeEach(inject([
    'games',
    function(gamesModel) {
      this.gamesModel = gamesModel;

      this.localStorageService = spyOnService('localStorage');
      this.httpService = spyOnService('http');
    }
  ]));

  context('loadLocalGamesP()', function() {
    return this.gamesModel.loadLocalGamesP();
  }, function() {
    beforeEach(function() {
      this.localStorageService.keys
        .and.returnValue([
          'clickApp.game.1',
          'clickApp.other',
          'clickApp.game.2'
        ]);
      this.localStorageService.loadP
        .resolveWith((k) => {
          return k+'Data';
        });
    });

    it('should retrieve keys from local storage', function() {
      expect(this.localStorageService.keys)
        .toHaveBeenCalled();
    });

    it('should retrieve all local games from local storage', function() {
      expect(this.localStorageService.loadP)
        .toHaveBeenCalledWith('clickApp.game.1');
      expect(this.localStorageService.loadP)
        .toHaveBeenCalledWith('clickApp.game.2');
    });

    it('should return loaded games', function() {
      expect(this.context)
        .toEqual([ 'clickApp.game.1Data',
                   'clickApp.game.2Data'
                 ]);
    });
  });

  context('loadLocalGame(<games>)', function() {
    return this.gamesModel.loadLocalGameP('stamp');
  }, function() {
    beforeEach(function() {
      this.game = { local_stamp: 'stamp' };
      this.localStorageService.loadP
        .resolveWith(this.game);
    });

    it('should store game', function() {
      expect(this.localStorageService.loadP)
        .toHaveBeenCalledWith('clickApp.game.stamp');

      expect(this.context).toEqual(this.game);
    });
  });

  context('saveLocalGame(<games>)', function() {
    return this.gamesModel.saveLocalGame(this.game);
  }, function() {
    beforeEach(function() {
      this.game = { local_stamp: 'stamp' };
      this.localStorageService.save
        .and.callFake((_k_,g) => g);
    });

    it('should store game', function() {
      expect(this.localStorageService.save)
        .toHaveBeenCalledWith('clickApp.game.stamp', this.game);

      expect(this.context).toEqual(this.game);
    });
  });

  context('updateLocalGame(<game>)', function() {
    return this.gamesModel
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
        .and.callFake((_k_,g) => g);
    });

    it('should update game in storage', function() {
      expect(this.localStorageService.save)
        .toHaveBeenCalledWith('clickApp.game.stamp',
                              this.game);
    });

    it('should update game in list', function() {
      expect(this.context)
        .toEqual([
          { local_stamp: 'other2' },
          this.game,
          { local_stamp: 'other1' }
        ]);
    });
  });

  context('newLocalGame(<game>)', function() {
    return this.gamesModel
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
        .and.callFake((_k_,g) => g);
    });

    it('should store new game', function() {
      expect(this.localStorageService.save)
        .toHaveBeenCalledWith('clickApp.game.stamp', {
          game: 'game',
          local_stamp: 'stamp'
        });
    });

    it('should add game to list', function() {
      expect(this.context)
        .toEqual([
          { local_stamp: 'other2' },
          { local_stamp: 'other1' },
          { game: 'game',
            local_stamp: 'stamp'
          }
        ]);
    });
  });

  context('removeLocalGame(<game>)', function() {
    return this.gamesModel
      .removeLocalGame('stamp', this.games);
  }, function() {
    beforeEach(function() {
      this.games = [
        { local_stamp: 'other2' },
        { local_stamp: 'stamp' },
        { local_stamp: 'other1' }
      ];
    });

    it('should remove game from storage', function() {
      expect(this.localStorageService.removeItem)
        .toHaveBeenCalledWith('clickApp.game.stamp');
    });

    it('should drop game from list', function() {
      expect(this.context)
        .toEqual([
          { local_stamp: 'other2' },
          { local_stamp: 'other1' }
        ]);
    });
  });

  context('newOnlineGame(<game>)', function() {
    return this.gamesModel
      .newOnlineGameP(this.game);
  }, function() {
    beforeEach(function() {
      this.game = {
        players: 'players',
        commands: 'commands',
        undo: 'undo',
        chat: 'chat',
        other: 'other'
      };
    });

    it('should create game online', function() {
      expect(this.httpService.postP)
        .toHaveBeenCalledWith('/api/games', {
          players: 'players',
          commands: 'commands',
          undo: 'undo',
          chat: 'chat'
        });

      expect(this.context).toBe('http.postP.returnValue');
    });
  });

  context('loadOnlineGameP(<is_private>, <id>)', function() {
    return this.gamesModel
      .loadOnlineGameP(this.is_private, this.id);
  }, function() {
    beforeEach(function() {
      this.id = 'id';
    });

    example(function(e, d) {
      context(d, function() {
        this.is_private = e.is_private;
      }, function() {
        it('should get game online', function() {
          expect(this.httpService.getP)
            .toHaveBeenCalledWith(e.url);
          expect(this.context).toBe('http.getP.returnValue');
        });
      });
    }, [
      [ 'is_private' , 'url'                   ],
      [ true         , '/api/games/private/id' ],
      [ false        , '/api/games/public/id'  ],
    ]);
  });
});
