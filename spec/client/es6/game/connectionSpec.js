describe('game', function() {
  describe('gameConnection service', function() {
    beforeEach(inject([ 'gameConnection', function(gameConnectionService) {
      this.gameConnectionService = gameConnectionService;

      this.websocketService = spyOnService('websocket');
      mockReturnPromise(this.websocketService.create);
      this.websocketService.create.resolveWith = 'websocket.create.returnValue';
      mockReturnPromise(this.websocketService.close);
      this.websocketService.close.resolveWith = 'websocket.close.returnValue';
    }]));

    when('create()', function() {
      this.ret = this.gameConnectionService.create({});
    }, function() {
      it('should initialize a connection state', function() {
        expect(this.ret.connection)
          .toBeAn('Object');
      });
    });

    when('open()', function() {
      this.ret = this.gameConnectionService
        .open(this.user_name, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.user_name = 'user';
        
        this.state = {};
        
        this.game = this.gameConnectionService.create({
          public_stamp: 'public_stamp'
        });
      });

      when('game has private stamp', function() {
        this.game.private_stamp = 'private_stamp';
      }, function() {
        it('should open player websocket', function() {
          expect(this.websocketService.create)
            .toHaveBeenCalledWith('/api/games/private/private_stamp?name=user',
                                  'game', jasmine.any(Object));
        });
      });

      when('game doesn\'t have private stamp', function() {
        this.game.private_stamp = null;
      }, function() {
        it('should open watcher websocket', function() {
          expect(this.websocketService.create)
            .toHaveBeenCalledWith('/api/games/public/public_stamp?name=user',
                                  'game', jasmine.any(Object));
        });
      });
      
      when('websocket creation fails', function() {
        this.websocketService.create.rejectWith = 'reason';
      }, function() {
        it('should reject creation', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.gameConnectionService.active(this.game))
              .toBeFalsy();
          });
        });
      });

      it('should activate connection', function() {
        this.thenExpect(this.ret, function(game) {
          expect(game.connection.state.socket)
            .toBe('websocket.create.returnValue');
          expect(this.gameConnectionService.active(game))
            .toBeTruthy();
        });
      });
    });

    when('close()', function() {
      this.ret = this.gameConnectionService.close(this.game);
    }, function() {
      beforeEach(function(done) {
        this.game = this.gameConnectionService.create({
          public_stamp: 'public_stamp'
        });
        this.gameConnectionService.open('user', {}, this.game)
          .then((game) => {
            this.game = game;
            done();
          });
      });

      it('should close websocket', function() {
        this.thenExpect(this.ret, () => {
          expect(this.websocketService.close)
            .toHaveBeenCalledWith('websocket.create.returnValue');
        });
      });

      when('websocket close fails', function() {
        this.websocketService.close.rejectWith = 'reason';
      }, function() {
        it('should reject close', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.gameConnectionService.active(this.game))
              .toBeTruthy();
          });
        });
      });

      it('should disactivate connection', function() {
        this.thenExpect(this.ret, function(game) {
          expect(game.connection.state.socket)
            .toBe(null);
          expect(this.gameConnectionService.active(game))
            .toBeFalsy();
        });
      });
    });

    when('cleanup()', function() {
      this.ret = this.gameConnectionService.cleanup(this.game);
    }, function() {
      beforeEach(function() {
        this.game = {};
      });

      it('should cleanup connection websocket', function() {
        expect(this.ret.connection.state.socket)
          .toBe(null);
      });
    });

    when('sendEvent(<event>)', function() {
      this.ret = this.gameConnectionService
        .sendEvent(this.event, this.game);
    }, function() {
      beforeEach(function(done) {
        this.game = this.gameConnectionService.create({
          public_stamp: 'public_stamp'
        });
        this.gameConnectionService.open('user', {}, this.game)
          .then((game) => {
            this.game = game;
            done();
          });

        this.event = 'event';
      });

      it('should send chat msg on websocket', function() {
        this.thenExpect(this.ret, (game) => {
          expect(this.websocketService.send)
            .toHaveBeenCalledWith(this.event, 'websocket.create.returnValue');
          expect(game)
            .toBe(this.game);
        });
      });
    });

    describe('socket event handlers', function() {
      beforeEach(inject(['pubSub', function() {
        this.game = this.gameConnectionService.create({
          public_stamp: 'public_stamp'
        });
        this.state = jasmine.createSpyObj('state', [
          'event'
        ]);
        this.gameConnectionService.open('user', this.state, this.game);
        this.handlers = this.websocketService.create.calls.first().args[2];
      }]));
      
      when('replayCmd message', function() {
        this.ret = this.handlers.replayCmd(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { cmd: 'cmd' };
        });
        
        it('should send "Game.command.replay" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.replay', this.msg.cmd);
        });
      }); 
      
      when('cmdBatch message', function() {
        this.ret = this.handlers.cmdBatch(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { cmds: 'cmds' };
        });
        
        it('should send "Game.command.replayBatch" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.replayBatch', this.msg.cmds);
        });
      }); 
      
      when('undoCmd message', function() {
        this.ret = this.handlers.undoCmd(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { cmd: 'cmd' };
        });
        
        it('should send "Game.command.undo" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.undo', this.msg.cmd);
        });
      });
      
      when('chat message', function() {
        this.ret = this.handlers.chat(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { chat: 'chat' };
        });

        it('should send "Game.newChatMsg" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.newChatMsg', this.msg);
        });
      });
      
      when('setCmds message', function() {
        this.ret = this.handlers.setCmds(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { where: 'where', cmds: 'cmds' };
        });

        it('should send "Game.setCmds" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.setCmds', this.msg);
        });
      });
      
      when('players message', function() {
        this.ret = this.handlers.players(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { players: 'players' };
        });

        it('should send "Game.setPlayers" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.setPlayers', this.msg.players);
        });
      });
      
      when('close', function() {
        this.handlers.close();
      }, function() {
        it('should send "Game.connection.close" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.connection.close');
        });
      });
    });
  });
  
  describe('stateService', function() {
    beforeEach(inject([
      'stateGame',
      function(stateGameService) {
        this.stateGameService = stateGameService;
      }
    ]));

    describe('onGameNewChatMsg(<msg>)', function() {
      beforeEach(function() {
        this.state = {
          game: {},
          changeEvent: jasmine.createSpy('changeEvent')
        };
      });

      it('should append <msg> to game chat', function() {
        this.stateGameService
          .onGameNewChatMsg(this.state, 'event', { chat: 'chat' });

        expect(this.state.game.chat)
          .toEqual(['chat']);
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.change');
      });
    });

    describe('onGameSetCmds(<msg>)', function() {
      beforeEach(function() {
        this.state = {
          game: {},
          changeEvent: jasmine.createSpy('changeEvent')
        };
      });

      it('should set game.<msg.where> to <msg.cmds>', function() {
        this.stateGameService
          .onGameSetCmds(this.state, 'event', {
            where: 'where',
            cmds: 'cmds'
          });

        expect(this.state.game.where)
          .toEqual('cmds');
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.change');
      });
    });

    describe('onGameSetPlayers(<players>)', function() {
      beforeEach(function() {
        this.state = {
          game: {},
          changeEvent: jasmine.createSpy('changeEvent')
        };
      });

      it('should set game.players to <players>', function() {
        this.stateGameService
          .onGameSetPlayers(this.state, 'event', 'players');

        expect(this.state.game.players)
          .toEqual('players');
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.change');
      });
    });

    describe('onGameConnectionClose()', function() {
      beforeEach(function() {
        this.state = {
          game: 'game',
          changeEvent: jasmine.createSpy('changeEvent')
        };
        this.gameConnectionService = spyOnService('gameConnection');
      });

      it('should cleanup game connection', function() {
        this.stateGameService
          .onGameConnectionClose(this.state);

        expect(this.state.game)
          .toBe('gameConnection.cleanup.returnValue');
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.change');
      });
    });
  });
});
