describe('appGames service', function() {
  beforeEach(inject([ 'appGames', function(appGamesService) {
    this.appGamesService = appGamesService;

    this.appActionService = spyOnService('appAction');
    this.fileImportService = spyOnService('fileImport');
    this.gameModel = spyOnService('game');
    this.gamesModel = spyOnService('games');
  }]));

  context('localSet(<games>)', function() {
    return this.appGamesService
      .localSet({}, 'games');
  }, function() {
    it('should set local games', function() {
      expect(this.context)
        .toEqual({ local_games: 'games' });
    });
  });

  context('localCreate()', function() {
    return this.appGamesService
      .localCreate({ user: { state: 'user_state' },
                     local_games: 'games' });
  }, function() {
    beforeEach(function() {
      spyOn(this.appGamesService.load.local, 'send');

      this.gamesModel.newLocalGame.returnValue = [
        { local_stamp: 'game' },
        { local_stamp: 'new_game' }
      ];
      this.gamesModel.newLocalGame
        .and.returnValue(this.gamesModel.newLocalGame.returnValue);
    });

    it('should create game', function() {
      expect(this.gameModel.create)
        .toHaveBeenCalledWith('user_state');
    });

    it('should append create game to local games', function() {
      expect(this.gamesModel.newLocalGame)
        .toHaveBeenCalledWith('game.create.returnValue', 'games');
      expect(this.context.local_games)
        .toBe(this.gamesModel.newLocalGame.returnValue);
    });

    it('should send load local signal', function() {
      expect(this.appGamesService.load.local.send)
        .toHaveBeenCalledWith('new_game');
    });
  });

  context('localLoadFile(<file>)', function() {
    return this.appGamesService
      .localLoadFile({}, 'file');
  }, function() {
    beforeEach(function() {
      spyOn(this.appActionService.action, 'send');
    });

    it('should read file', function() {
      expect(this.fileImportService.readP)
        .toHaveBeenCalledWith('json', 'file');
    });

    it('should send Game.local.loadNew action', function() {
      expect(this.appActionService.action.send)
        .toHaveBeenCalledWith([
          'Games.local.loadNew',
          'fileImport.readP.returnValue'
        ]);
    });
  });

  context('localLoadNew(<game>)', function() {
    return this.appGamesService
      .localLoadNew({ local_games: 'games' }, 'game');
  }, function() {
    beforeEach(function() {
      spyOn(this.appGamesService.load.local, 'send');

      this.gamesModel.newLocalGame.returnValue = [
        { local_stamp: 'game' },
        { local_stamp: 'new_game' }
      ];
      this.gamesModel.newLocalGame
        .and.returnValue(this.gamesModel.newLocalGame.returnValue);
    });

    it('should append game to local games', function() {
      expect(this.gamesModel.newLocalGame)
        .toHaveBeenCalledWith('game', 'games');
      expect(this.context.local_games)
        .toBe(this.gamesModel.newLocalGame.returnValue);
    });

    it('should send load local signal', function() {
      expect(this.appGamesService.load.local.send)
        .toHaveBeenCalledWith('new_game');
    });
  });

  context('localLoad', function() {
    return this.appGamesService
      .localLoad({}, 'index');
  }, function() {
    beforeEach(function() {
      spyOn(this.appGamesService.load.local, 'send');
    });

    it('should send load local signal', function() {
      expect(this.appGamesService.load.local.send)
        .toHaveBeenCalledWith('index');
    });
  });

  context('localDelete(<id>)', function() {
    return this.appGamesService
      .localDelete({ local_games: 'games' }, 'id');
  }, function() {
    it('should remove game <id> from local games', function() {
      expect(this.gamesModel.removeLocalGame)
        .toHaveBeenCalledWith('id', 'games');
      expect(this.context.local_games)
        .toBe('games.removeLocalGame.returnValue');
    });
  });

  context('onlineCreate()', function() {
    return this.appGamesService
      .onlineCreate({ user: { state: 'user_state' } });
  }, function() {
    beforeEach(function() {
      spyOn(this.appGamesService.load.online, 'send');
      this.gamesModel.newOnlineGameP
        .and.returnValue({ private_stamp: 'private_stamp' });
    });

    it('should create new game', function() {
      expect(this.gameModel.create)
        .toHaveBeenCalledWith('user_state');
    });

    it('should upload new game online', function() {
      expect(this.gamesModel.newOnlineGameP)
        .toHaveBeenCalledWith('game.create.returnValue');
    });

    it('should send load online signal', function() {
      expect(this.appGamesService.load.online.send)
        .toHaveBeenCalledWith(['private','private_stamp']);
    });
  });

  context('onlineLoad(<index>)', function() {
    return this.appGamesService
      .onlineLoad({ user: { connection: { games: [
        { public_stamp: 'game1' },
        { public_stamp: 'game2' }
      ] } } }, 1);
  }, function() {
    beforeEach(function() {
      spyOn(this.appGamesService.load.online, 'send');
    });

    it('should send load online signal', function() {
      expect(this.appGamesService.load.online.send)
        .toHaveBeenCalledWith(['public','game2']);
    });
  });

  context('onlineLoadFile(<file>)', function() {
    return this.appGamesService
      .onlineLoadFile('state', 'file');
  }, function() {
    beforeEach(function() {
      spyOn(this.appGamesService.load.online, 'send');
      this.gamesModel.newOnlineGameP
        .and.returnValue({ private_stamp: 'private_stamp' });
    });

    it('should read file data', function() {
      expect(this.fileImportService.readP)
        .toHaveBeenCalledWith('json', 'file');
    });

    it('should upload new game online', function() {
      expect(this.gamesModel.newOnlineGameP)
        .toHaveBeenCalledWith('fileImport.readP.returnValue');
    });

    it('should send load online signal', function() {
      expect(this.appGamesService.load.online.send)
        .toHaveBeenCalledWith(['private','private_stamp']);
    });
  });
});
