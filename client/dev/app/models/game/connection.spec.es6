describe('gameConnection model', function() {
  beforeEach(inject([ 'gameConnection', function(gameConnectionModel) {
    this.gameConnectionModel = gameConnectionModel;

    this.websocketService = spyOnService('websocket');
  }]));

  context('create()', function() {
    return this.gameConnectionModel
      .create({});
  }, function() {
    it('should initialize a connection state', function() {
      expect(this.context.connection)
        .toBeAn('Object');
    });
  });

  context('openP()', function() {
    return this.gameConnectionModel
      .openP(this.user_name, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.user_name = 'user';
      this.state = {};

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
                                'game', jasmine.any(Object));
      });
    });

    context('when game doesn\'t have private stamp', function() {
      this.game.private_stamp = null;
    }, function() {
      it('should open watcher websocket', function() {
        expect(this.websocketService.createP)
          .toHaveBeenCalledWith('/api/games/public/public_stamp?name=user',
                                'game', jasmine.any(Object));
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
    return this.gameConnectionModel
      .close(this.game);
  }, function() {
    beforeEach(function() {
      this.game = this.gameConnectionModel.create({
        public_stamp: 'public_stamp'
      });
      return this.gameConnectionModel
        .openP('user', {}, this.game)
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

  context('sendEventP(<event>)', function() {
    return this.gameConnectionModel
      .sendEventP(this.event, this.game);
  }, function() {
    beforeEach(function() {
      this.game = this.gameConnectionModel.create({
        public_stamp: 'public_stamp'
      });
      this.event = 'event';
      return this.gameConnectionModel
        .openP('user', {}, this.game)
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

  describe('socket event handlers', function() {
    beforeEach(function() {
      this.game = this.gameConnectionModel.create({
        public_stamp: 'public_stamp'
      });
      this.state = jasmine.createSpyObj('state', [
        'queueEventP'
      ]);
      return this.gameConnectionModel
        .openP('user', this.state, this.game)
        .then(() => {
          this.handlers = this.websocketService.createP
            .calls.first().args[2];
        });
    });

    context('on replayCmd message', function() {
      return this.handlers.replayCmd(this.msg);
    }, function() {
      beforeEach(function() {
        this.msg = { cmd: 'cmd' };
      });

      it('should send "Game.command.replay" event', function() {
        expect(this.state.queueEventP)
          .toHaveBeenCalledWith('Game.command.replay', this.msg.cmd);
      });
    });

    context('on cmdBatch message', function() {
      return this.handlers.cmdBatch(this.msg);
    }, function() {
      beforeEach(function() {
        this.msg = { cmds: 'cmds' };
      });

      it('should send "Game.command.replayBatch" event', function() {
        expect(this.state.queueEventP)
          .toHaveBeenCalledWith('Game.command.replayBatch', this.msg.cmds);
      });
    });

    context('on undoCmd message', function() {
      return this.handlers.undoCmd(this.msg);
    }, function() {
      beforeEach(function() {
        this.msg = { cmd: 'cmd' };
      });

      it('should send "Game.command.undo" event', function() {
        expect(this.state.queueEventP)
          .toHaveBeenCalledWith('Game.command.undo', this.msg.cmd);
      });
    });

    context('on chat message', function() {
      return this.handlers.chat(this.msg);
    }, function() {
      beforeEach(function() {
        this.msg = { chat: 'chat' };
      });

      it('should send "Game.newChatMsg" event', function() {
        expect(this.state.queueEventP)
          .toHaveBeenCalledWith('Game.newChatMsg', this.msg);
      });
    });

    context('on setCmds message', function() {
      return this.handlers.setCmds(this.msg);
    }, function() {
      beforeEach(function() {
        this.msg = { where: 'where', cmds: 'cmds' };
      });

      it('should send "Game.setCmds" event', function() {
        expect(this.state.queueEventP)
          .toHaveBeenCalledWith('Game.setCmds', this.msg);
      });
    });

    context('on players message', function() {
      return this.handlers.players(this.msg);
    }, function() {
      beforeEach(function() {
        this.msg = { players: 'players' };
      });

      it('should send "Game.setPlayers" event', function() {
        expect(this.state.queueEventP)
          .toHaveBeenCalledWith('Game.setPlayers', this.msg.players);
      });
    });

    context('on close', function() {
      return this.handlers.close();
    }, function() {
      it('should send "Game.connection.close" event', function() {
        expect(this.state.queueEventP)
          .toHaveBeenCalledWith('Game.connection.close');
      });
    });
  });

  context('sendReplayCommandP(<cmd>, <game>)', function() {
    return this.gameConnectionModel
      .sendReplayCommandP(this.cmd, this.game);
  }, function() {
    beforeEach(function() {
      this.cmd = 'cmd';
      this.game = { commands_log: [ 'log1' ] };

      spyOn(this.gameConnectionModel, 'sendEventP');
      this.gameConnectionModel.sendEventP$ =
        R.curryN(2, this.gameConnectionModel.sendEventP);
      spyReturnPromise(this.gameConnectionModel.sendEventP);
      this.gameConnectionModel.sendEventP
        .resolveWith(this.game);
    });

    it('should send "replayCmd" event', function() {
      expect(this.gameConnectionModel.sendEventP)
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

  context('sendUndoCommandP(<cmd>, <game>)', function() {
    return this.gameConnectionModel
      .sendUndoCommandP(this.cmd, this.game);
  }, function() {
    beforeEach(function() {
      this.cmd = 'cmd';
      this.game = { undo_log: [ 'log1' ] };

      spyOn(this.gameConnectionModel, 'sendEventP');
      this.gameConnectionModel.sendEventP$ =
        R.curryN(2, this.gameConnectionModel.sendEventP);
      spyReturnPromise(this.gameConnectionModel.sendEventP);
      this.gameConnectionModel.sendEventP
        .resolveWith(this.game);
    });

    it('should send "undoCmd" event', function() {
      expect(this.gameConnectionModel.sendEventP)
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
