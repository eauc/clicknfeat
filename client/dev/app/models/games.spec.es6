describe('games model', function() {
  beforeEach(inject([
    'games',
    function(gamesModel) {
      this.gamesModel = gamesModel;

      this.localStorageService = spyOnService('localStorage');
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

  context('saveLocalGame(<games>)', function() {
    return this.gamesModel.saveLocalGame(this.game);
  }, function() {
    beforeEach(function() {
      this.game = { local_stamp: 'stamp' };
      this.localStorageService.save
        .and.callFake((k,g) => g);
    });

    it('should store game', function() {
      expect(this.localStorageService.save)
        .toHaveBeenCalledWith('clickApp.game.stamp', this.game);

      expect(this.context).toEqual(this.game);
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
        .and.callFake((k,g) => g);
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
});
