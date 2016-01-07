describe('replay commands', function() {
  describe('stateService', function() {
    beforeEach(inject([
      'stateGame',
      function(stateGameService) {
        this.stateGameService = stateGameService;

        this.gameService = spyOnService('game');
        mockReturnPromise(this.gameService.replayCommand);
        this.gameService.replayCommand
          .resolveWith = 'game.replayCommand.returnValue';
        mockReturnPromise(this.gameService.replayCommandsBatch);
        this.gameService.replayCommandsBatch
          .resolveWith = 'game.replayCommandsBatch.returnValue';
        mockReturnPromise(this.gameService.replayNextCommand);
        this.gameService.replayNextCommand
          .resolveWith = 'game.replayNextCommand.returnValue';
      }
    ]));

    function expectGameUpdate(ctxt, game) {
      expect(ctxt.state.game)
        .toBe(game);
      expect(ctxt.state.changeEvent)
        .toHaveBeenCalledWith('Game.change');
    }

    describe('onGameCommandReplay(<cmd>)', function() {
      beforeEach(function() {
        this.state = {
          game: 'game',
          changeEvent: jasmine.createSpy('changeEvent')
        };
      });

      it('should replay game command', function() {
        this.ret = this.stateGameService
          .onGameCommandReplay(this.state, 'event', 'cmd');

        this.thenExpect(this.ret, () => {
          expect(this.gameService.replayCommand)
            .toHaveBeenCalledWith('cmd', this.state, 'game');
          expectGameUpdate(this, 'game.replayCommand.returnValue');
        });
      });
    });

    describe('onGameCommandReplayBatch(<cmds>)', function() {
      beforeEach(function() {
        this.state = {
          game: 'game',
          changeEvent: jasmine.createSpy('changeEvent')
        };
      });

      it('should replay game command', function() {
        this.ret = this.stateGameService
          .onGameCommandReplayBatch(this.state, 'event', 'cmds');

        this.thenExpect(this.ret, () => {
          expect(this.gameService.replayCommandsBatch)
            .toHaveBeenCalledWith('cmds', this.state, 'game');
          expectGameUpdate(this, 'game.replayCommandsBatch.returnValue');
        });
      });
    });

    describe('onGameCommandReplayNext()', function() {
      beforeEach(function() {
        this.state = {
          game: 'game',
          changeEvent: jasmine.createSpy('changeEvent')
        };
      });

      it('should replay game next command', function() {
        this.ret = this.stateGameService
          .onGameCommandReplayNext(this.state);

        this.thenExpect(this.ret, () => {
          expect(this.gameService.replayNextCommand)
            .toHaveBeenCalledWith(this.state, 'game');
          expectGameUpdate(this, 'game.replayNextCommand.returnValue');
        });
      });
    });
  });

  describe('gameService', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;

      this.commandsService = spyOnService('commands');
      mockReturnPromise(this.commandsService.replay);
      
      this.gameConnectionService = spyOnService('gameConnection');
      this.gameConnectionService.active._retVal = false;
      mockReturnPromise(this.gameConnectionService.sendReplayCommand);
    }]));

    when('replayCommand(<cmd>, <state>, <game>)', function() {
      this.ret = this.gameService
        .replayCommand(this.cmd, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: [ { stamp: 'cmd1' }
                                ],
                      commands_log: [ { stamp: 'cmd2' },
                                      { stamp: 'cmd3' }
                                    ],
                      undo: []
                    };

        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);

        this.cmd = { stamp: 'stamp' };

        this.commandsService.replay
          .resolveWith = this.game;
      });

      when('<cmd> is in command log', function() {
        this.cmd = { stamp: 'cmd2' };
      }, function() {
        it('should swith <cmd> to history', function() {
          this.thenExpect(this.ret, function(game) {
            expect(game).toEqual({
              commands: [ { stamp: 'cmd1' },
                          { stamp: 'cmd2' }
                        ],
              commands_log: [ { stamp: 'cmd3' }
                            ],
              undo: []
            });
          });
        });
      });

      it('should replay next undo', function() {
        this.thenExpect(this.ret, () => {
          expect(this.commandsService.replay)
            .toHaveBeenCalledWith(this.cmd, this.state, this.game);
        });
      });

      when('undo fails', function() {
        this.commandsService.replay.rejectWith = 'reason';
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });

      it('should swith <cmd> to history', function() {
        this.thenExpect(this.ret, function(game) {
          expect(game).toEqual({
            commands: [ { stamp: 'cmd1' },
                        { stamp: 'stamp' }
                      ],
            commands_log: [ { stamp: 'cmd2' },
                            { stamp: 'cmd3' }
                          ],
            undo: []
          });
        });
      });
      
      it('should send replay event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.command.replay');
        });
      });
    });

    when('replayCommandsBatch(<cmds>, <state>, <game>)', function() {
      this.ret = this.gameService
        .replayCommandsBatch(this.cmds, 'state', 'game');
    }, function() {
      beforeEach(function() {
        mockReturnPromise(this.commandsService.replayBatch);
        this.commandsService.replayBatch
          .resolveWith = { commands: ['cmd1'] };
        this.cmds = [ 'cmd2', 'cmd3' ];
      });

      it('should replay command batch', function() {
        expect(this.commandsService.replayBatch)
          .toHaveBeenCalledWith(this.cmds, 'state','game');
      });

      it('should append batch to game\'s commands', function() {
        this.thenExpect(this.ret, (result) => {
          expect(result.commands)
            .toEqual([ 'cmd1', 'cmd2', 'cmd3' ]);
        });
      });
    });

    when('replayNextCommand(<state>, <game>)', function() {
      this.ret = this.gameService
        .replayNextCommand(this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: [ 'cmd1' ],
                      undo: ['cmd3', 'cmd2' ]
                    };

        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);

        this.commandsService.replay
          .resolveWith = this.game;
        this.gameConnectionService.sendReplayCommand
          .resolveWith = (c,g) => g;
      });

      when('undo history is empty', function() {
        this.game.undo = [];
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Undo history empty');
          });
        });
      });

      it('should replay next undo', function() {
        this.thenExpect(this.ret, () => {
          expect(this.commandsService.replay)
            .toHaveBeenCalledWith('cmd2', this.state, this.game);
        });
      });

      when('undo fails', function() {
        this.commandsService.replay.rejectWith = 'reason';
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });

      when('game connection is active', function() {
        this.gameConnectionService.active._retVal = true;
      }, function() {
        it('should send replayCommand event on connection', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameConnectionService.sendReplayCommand)
              .toHaveBeenCalledWith('cmd2', {
                commands: [ 'cmd1' ],
                undo: [ 'cmd3' ]
              });
          });

          it('should send replay event', function() {
            this.thenExpect(this.ret, function() {
              expect(this.state.changeEvent)
                .toHaveBeenCalledWith('Game.command.replay');
            });
          });
        });

        it('should update game', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result).toEqual({
              commands: [ 'cmd1' ],
              undo: [ 'cmd3' ]
            });
          });
        });
      });
      
      it('should switch undo to cmd queue', function() {
        this.thenExpect(this.ret, function(result) {
          expect(result)
            .toEqual({
              commands: [ 'cmd1', 'cmd2' ],
              undo: [ 'cmd3' ]
            });
        });
      });

      it('should send replay event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.command.replay');
        });
      });
    });
  });
  
  describe('gameConnectionService', function() {
    beforeEach(inject([ 'gameConnection', function(gameConnectionService) {
      this.gameConnectionService = gameConnectionService;
    }]));

    when('sendReplayCommand(<cmd>, <game>)', function() {
      this.ret = this.gameConnectionService
        .sendReplayCommand(this.cmd, this.game);
    }, function() {
      beforeEach(function() {
        this.cmd = 'cmd';
        this.game = { commands_log: [ 'log1' ] };

        spyOn(this.gameConnectionService, 'sendEvent');
        this.gameConnectionService.sendEvent$ =
          R.curryN(2, this.gameConnectionService.sendEvent);
        mockReturnPromise(this.gameConnectionService.sendEvent);
        this.gameConnectionService.sendEvent
          .resolveWith = this.game;
      });

      it('should send "replayCmd" event', function() {
        expect(this.gameConnectionService.sendEvent)
          .toHaveBeenCalledWith({
            type: 'replayCmd',
            cmd: 'cmd'
          }, this.game);
      });

      it('should append <cmd> to replay log', function() {
        this.thenExpect(this.ret, (result) => {
          expect(result)
            .toEqual({
              commands_log: [ 'log1', 'cmd' ]
            });
        });
      });
    });
  });

  describe('commandsService', function() {
    beforeEach(inject([ 'commands', function(commandsService) {
      this.commandsService = commandsService;

      this.game = { game: 'game' };
      this.cmd1 = jasmine.createSpyObj('cmd1', [
        'execute', 'replay', 'undo'
      ]);
      this.cmd1.replay.and.returnValue('cmd1.returnValue');
      this.cmd2 = jasmine.createSpyObj('cmd2', [
        'execute', 'replay', 'undo'
      ]);
      this.cmd2.replay.and.returnValue('cmd2.returnValue');

      this.commandsService.registerCommand('cmd1',this.cmd1);
      this.commandsService.registerCommand('cmd2',this.cmd2);
    }]));

    describe('replay(<ctxt>, <scope>, <game>)', function() {
      when('<ctxt.type> is unknown', function() {
        this.ret = this.commandsService
          .replay({ type: 'unknown' }, 'state', 'game');
      }, function() {
        it('should discard command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('replay unknown command unknown');
          });
        });
      });

      using([
        [ 'cmd'  ],
        [ 'cmd1' ],
        [ 'cmd2' ],
      ], function(e, d) {
        when('<ctxt.type> is known, '+d, function() {
          this.ret = this.commandsService
            .replay({ type: e.cmd }, 'state', 'game');
        }, function() {
          it('should proxy <name>.replay', function() {
            this.thenExpect(this.ret, function(value) {
              expect(this[e.cmd].replay)
                .toHaveBeenCalledWith({ type: e.cmd }, 'state', 'game');

              expect(value).toBe(e.cmd+'.returnValue');
            });
          });
        });
      });

      describe('when replay fails', function() {
        beforeEach(function() {
          mockReturnPromise(this.cmd1.replay);
          this.cmd1.replay.rejectWith = 'reason';
          this.ret = this.commandsService
            .replay({ type: 'cmd1' }, 'scope', 'game');
        });
        
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });
    });
    
    when('replayBatch(<cmds>, <scope>, <game>)', function() {
      this.ret = this.commandsService
        .replayBatch(this.cmds, 'state', 'game');
    }, function() {
      beforeEach(function() {
        spyOn(this.commandsService, 'replay');
        mockReturnPromise(this.commandsService.replay);

        this.replay = '';
        this.commandsService.replay.resolveWith = (c) => {
          this.replay += c;
          return 'game';
        };

        this.cmds = [ 'cmd1', 'cmd2', 'cmd3' ];
      });

      it('should replay each command in batch in order', function() {
        this.thenExpect(this.ret, function() {
          expect(this.commandsService.replay)
            .toHaveBeenCalledWith('cmd1', 'state', 'game');
          expect(this.commandsService.replay)
            .toHaveBeenCalledWith('cmd2', 'state', 'game');
          expect(this.commandsService.replay)
            .toHaveBeenCalledWith('cmd3', 'state', 'game');

          expect(this.replay).toBe('cmd1cmd2cmd3');
        });
      });

      when('some command fails', function() {
        this.commandsService.replay.resolveWith = function(c) {
          return ( c === 'cmd2' ?
                   self.Promise.reject('reason') :
                   'game'
                 );
        };
      }, function() {
        it('should still replay all commands in batch', function() {
          this.thenExpect(this.ret, function() {
            expect(this.commandsService.replay)
              .toHaveBeenCalledWith('cmd1', 'state', 'game');
            expect(this.commandsService.replay)
              .toHaveBeenCalledWith('cmd2', 'state', 'game');
            expect(this.commandsService.replay)
              .toHaveBeenCalledWith('cmd3', 'state', 'game');
          });
        });
      });
    });
  });
});
