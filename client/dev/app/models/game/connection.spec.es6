describe('gameConnection model', function() {
  beforeEach(inject([ 'gameConnection', function(gameConnectionModel) {
    this.gameConnectionModel = gameConnectionModel;

    this.websocketService = spyOnService('websocket');
    this.appStateService = spyOnService('appState');
  }]));

  context('create()', function() {
    return this.gameConnectionModel.create({});
  }, function() {
    it('should initialize a connection state', function() {
      expect(this.context.connection)
        .toBeAn('Object');
    });
  });

  context('openP()', function() {
    return this.gameConnectionModel
      .openP(this.user_name, this.game);
  }, function() {
    beforeEach(function() {
      this.user_name = 'user';

      this.game = this.gameConnectionModel.create({
        public_stamp: 'public_stamp'
      });
    });

    context('when game has private stamp', function() {
      this.game.private_stamp = 'private_stamp';
    }, function() {
      it('should open player websocket', function() {
        expect(this.websocketService.createP)
          .toHaveBeenCalledWith('/api/games/private/private_stamp?name=user',
                                'game', {
                                  close: 'Game.connection.close',
                                  chat: 'Game.connection.chat',
                                  replayCmd: 'Game.connection.replayCmd',
                                  undoCmd: 'Game.connection.undoCmd',
                                  cmdBatch: 'Game.connection.batchCmd',
                                  setCmds: 'Game.connection.setCmds',
                                  players: 'Game.connection.setPlayers'
                                });
      });
    });

    context('when game doesn\'t have private stamp', function() {
      this.game.private_stamp = null;
    }, function() {
      it('should open watcher websocket', function() {
        expect(this.websocketService.createP)
          .toHaveBeenCalledWith('/api/games/public/public_stamp?name=user',
                                'game', {
                                  close: 'Game.connection.close',
                                  chat: 'Game.connection.chat',
                                  replayCmd: 'Game.connection.replayCmd',
                                  undoCmd: 'Game.connection.undoCmd',
                                  cmdBatch: 'Game.connection.batchCmd',
                                  setCmds: 'Game.connection.setCmds',
                                  players: 'Game.connection.setPlayers'
                                });
      });
    });

    context('when websocket creation fails', function() {
      this.websocketService.createP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject creation', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    it('should activate connection', function() {
      expect(this.context.connection.state.socket)
        .toBe('websocket.createP.returnValue');
      expect(this.gameConnectionModel.active(this.context))
        .toBeTruthy();
    });
  });

  context('close()', function() {
    return this.gameConnectionModel.close(this.game);
  }, function() {
    beforeEach(function() {
      this.game = this.gameConnectionModel.create({
        public_stamp: 'public_stamp'
      });
      return this.gameConnectionModel
        .openP('user', this.game)
        .then((game) => {
          this.game = game;
        });
    });

    it('should close websocket', function() {
      expect(this.websocketService.close)
        .toHaveBeenCalledWith('websocket.createP.returnValue');
    });

    it('should disactivate connection', function() {
      expect(this.context.connection.state.socket)
        .toBe(null);
      expect(this.gameConnectionModel.active(this.context))
        .toBeFalsy();
    });
  });

  context('cleanup()', function() {
    return this.gameConnectionModel
      .cleanup(this.game);
  }, function() {
    beforeEach(function() {
      this.game = {};
    });

    it('should cleanup connection websocket', function() {
      expect(this.context.connection.state.socket)
        .toBe(null);
    });
  });

  context('sendEvent(<event>)', function() {
    return this.gameConnectionModel
      .sendEvent(this.event, this.game);
  }, function() {
    beforeEach(function() {
      this.game = this.gameConnectionModel.create({
        public_stamp: 'public_stamp'
      });
      this.event = 'event';
      return this.gameConnectionModel
        .openP('user', this.game)
        .then((game) => {
          this.game = game;
        });
    });

    it('should send chat msg on websocket', function() {
      expect(this.websocketService.send)
        .toHaveBeenCalledWith(this.event, 'websocket.createP.returnValue');
      expect(this.context)
        .toBe(this.game);
    });
  });

  context('sendReplayCommand(<cmd>, <game>)', function() {
    return this.gameConnectionModel
      .sendReplayCommand(this.cmd, this.game);
  }, function() {
    beforeEach(function() {
      this.cmd = 'cmd';
      this.game = { commands_log: [ 'log1' ] };

      spyOn(this.gameConnectionModel, 'sendEvent');
      this.gameConnectionModel.sendEvent$ =
        R.curryN(2, this.gameConnectionModel.sendEvent);
      spyReturnPromise(this.gameConnectionModel.sendEvent);
      this.gameConnectionModel.sendEvent
        .and.returnValue(this.game);
    });

    it('should send "replayCmd" event', function() {
      expect(this.gameConnectionModel.sendEvent)
        .toHaveBeenCalledWith({
          type: 'replayCmd',
          cmd: 'cmd'
        }, this.game);
    });

    it('should append <cmd> to replay log', function() {
      expect(this.context)
        .toEqual({
          commands_log: [ 'log1', 'cmd' ]
        });
    });
  });

  context('sendUndoCommand(<cmd>, <game>)', function() {
    return this.gameConnectionModel
      .sendUndoCommand(this.cmd, this.game);
  }, function() {
    beforeEach(function() {
      this.cmd = 'cmd';
      this.game = { undo_log: [ 'log1' ] };

      spyOn(this.gameConnectionModel, 'sendEvent');
      this.gameConnectionModel.sendEvent$ =
        R.curryN(2, this.gameConnectionModel.sendEvent);
      spyReturnPromise(this.gameConnectionModel.sendEvent);
      this.gameConnectionModel.sendEvent
        .and.returnValue(this.game);
    });

    it('should send "undoCmd" event', function() {
      expect(this.gameConnectionModel.sendEvent)
        .toHaveBeenCalledWith({
          type: 'undoCmd',
          cmd: 'cmd'
        }, this.game);
    });

    it('should append <cmd> to undo log', function() {
      expect(this.context)
        .toEqual({
          undo_log: [ 'log1', 'cmd' ]
        });
    });
  });
});
