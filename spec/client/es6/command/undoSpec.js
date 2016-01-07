describe('undo commands', function() {
  describe('stateService', function() {
    beforeEach(inject([
      'stateGame',
      function(stateGameService) {
        this.stateGameService = stateGameService;

        this.gameService = spyOnService('game');
        mockReturnPromise(this.gameService.undoCommand);
        this.gameService.undoCommand
          .resolveWith = 'game.undoCommand.returnValue';
        mockReturnPromise(this.gameService.undoLastCommand);
        this.gameService.undoLastCommand
          .resolveWith = 'game.undoLastCommand.returnValue';
      }
    ]));

    function expectGameUpdate(ctxt, game) {
      expect(ctxt.state.game)
        .toBe(game);
      expect(ctxt.state.changeEvent)
        .toHaveBeenCalledWith('Game.change');
    }

    describe('onGameCommandUndo(<cmd>)', function() {
      beforeEach(function() {
        this.state = {
          game: 'game',
          changeEvent: jasmine.createSpy('changeEvent')
        };
      });

      it('should undo game command', function() {
        this.ret = this.stateGameService
          .onGameCommandUndo(this.state, 'event', 'cmd');

        this.thenExpect(this.ret, () => {
          expect(this.gameService.undoCommand)
            .toHaveBeenCalledWith('cmd', this.state, 'game');
          expectGameUpdate(this, 'game.undoCommand.returnValue');
        });
      });
    });

    describe('onGameCommandUndoLast()', function() {
      beforeEach(function() {
        this.state = {
          game: 'game',
          changeEvent: jasmine.createSpy('changeEvent')
        };
      });

      it('should undo last game command', function() {
        this.ret = this.stateGameService
          .onGameCommandUndoLast(this.state, 'event');

        this.thenExpect(this.ret, () => {
          expect(this.gameService.undoLastCommand)
            .toHaveBeenCalledWith(this.state, 'game');
          expectGameUpdate(this, 'game.undoLastCommand.returnValue');
        });
      });
    });
  });
  
  describe('gameService', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;

      this.commandsService = spyOnService('commands');
      mockReturnPromise(this.commandsService.undo);
      
      this.gameConnectionService = spyOnService('gameConnection');
      this.gameConnectionService.active._retVal = false;
      this.gameConnectionService.sendUndoCommand
        .and.callFake((c,g)=>g);
    }]));

    when('undoCommand(<cmd>, <state>, <game>)', function() {
      this.ret = this.gameService
        .undoCommand(this.cmd, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { undo: [ { stamp: 'cmd1' }
                            ],
                      undo_log: [ { stamp: 'cmd2' },
                                  { stamp: 'cmd3' }
                                ],
                      commands: []
                    };

        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);

        this.cmd = { stamp: 'stamp' };

        this.commandsService.undo
          .resolveWith = this.game;
      });

      when('<cmd> is in undo log', function() {
        this.cmd = { stamp: 'cmd2' };
      }, function() {
        it('should swith <cmd> to undo history', function() {
          this.thenExpect(this.ret, function(game) {
            expect(game).toEqual({
              undo: [ { stamp: 'cmd1' },
                      { stamp: 'cmd2' }
                    ],
              undo_log: [ { stamp: 'cmd3' }
                        ],
              commands: []
            });
          });
        });
      });

      it('should undo next undo', function() {
        this.thenExpect(this.ret, () => {
          expect(this.commandsService.undo)
            .toHaveBeenCalledWith(this.cmd, this.state, this.game);
        });
      });

      when('undo fails', function() {
        this.commandsService.undo.rejectWith = 'reason';
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
            undo: [ { stamp: 'cmd1' },
                    { stamp: 'stamp' }
                  ],
            undo_log: [ { stamp: 'cmd2' },
                        { stamp: 'cmd3' }
                      ],
            commands: []
          });
        });
      });
      
      it('should send undo event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.command.undo');
        });
      });
    });

    when('undoLastCommand(<scope>, <game>)', function() {
      this.ret = this.gameService
        .undoLastCommand(this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: ['cmd1','cmd2'],
                      undo: ['cmd3'],
                      undo_log: []
                    };

        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);
        this.commandsService.undo
          .resolveWith = this.game;
      });

      when('command history is empty', function() {
        this.game.commands = [];
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Command history empty');
          });
        });
      });
      
      it('should undo last command', function() {
        this.thenExpect(this.ret, () => {
          expect(this.commandsService.undo)
            .toHaveBeenCalledWith('cmd2', this.state, this.game);
        });
      });

      when('undo fails', function() {
        this.commandsService.undo.rejectWith = 'reason';
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
        it('should send undoCmd event on connection', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameConnectionService.sendUndoCommand)
              .toHaveBeenCalledWith('cmd2', {
                commands: ['cmd1' ],
                undo: ['cmd3'],
                undo_log: []
              });
          });
        });

        it('should remove cmd from history', function() {
          this.thenExpect(this.ret, (result) => {
            expect(result)
              .toEqual({
                commands: [ 'cmd1' ],
                undo: [ 'cmd3' ],
                undo_log: [  ]
              });
          });
        });

        it('should send undo event', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.command.undo');
          });
        });
      });
      
      it('should switch cmd to undo queue', function() {
        this.thenExpect(this.ret, (result) => {
          expect(result)
            .toEqual({
              commands: [ 'cmd1' ],
              undo: [ 'cmd3', 'cmd2' ],
              undo_log: [  ]
            });
        });
      });

      it('should send undo event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.command.undo');
        });
      });
    });
  });
  
  describe('gameConnectionService', function() {
    beforeEach(inject([ 'gameConnection', function(gameConnectionService) {
      this.gameConnectionService = gameConnectionService;
    }]));

    when('sendUndoCommand(<cmd>, <game>)', function() {
      this.ret = this.gameConnectionService
        .sendUndoCommand(this.cmd, this.game);
    }, function() {
      beforeEach(function() {
        this.cmd = 'cmd';
        this.game = { undo_log: [ 'log1' ] };

        spyOn(this.gameConnectionService, 'sendEvent');
        this.gameConnectionService.sendEvent$ =
          R.curryN(2, this.gameConnectionService.sendEvent);
        mockReturnPromise(this.gameConnectionService.sendEvent);
        this.gameConnectionService.sendEvent
          .resolveWith = this.game;
      });

      it('should send "undoCmd" event', function() {
        expect(this.gameConnectionService.sendEvent)
          .toHaveBeenCalledWith({
            type: 'undoCmd',
            cmd: 'cmd'
          }, this.game);
      });

      it('should append <cmd> to undo log', function() {
        this.thenExpect(this.ret, (result) => {
          expect(result)
            .toEqual({
              undo_log: [ 'log1', 'cmd' ]
            });
        });
      });
    });
  });
  
  describe('commandsService', function() {
    beforeEach(inject([ 'commands', function(commandsService) {
      this.commandsService = commandsService;

      this.cmd1 = jasmine.createSpyObj('cmd1', [
        'execute', 'replay', 'undo'
      ]);
      this.cmd1.undo.and.returnValue('cmd1.undo.returnValue');
      this.cmd2 = jasmine.createSpyObj('cmd2', [
        'execute', 'replay', 'undo'
      ]);
      this.cmd2.undo.and.returnValue('cmd2.undo.returnValue');

      this.commandsService.registerCommand('cmd1',this.cmd1);
      this.commandsService.registerCommand('cmd2',this.cmd2);
    }]));

    describe('undo(<ctxt>, <state>, <arg>)', function() {
      when('<ctxt.type> is unknown', function() {
        this.ret = this.commandsService.undo({
          type: 'unknown'
        }, 'state', 'game');
      }, function() {
        it('should discard command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('undo unknown command "unknown"');
          });
        });
      });

      using([
        [ 'cmd' ],
        [ 'cmd1' ],
        [ 'cmd2' ],
      ], function(e, d) {
        when('<ctxt.type> is known, '+d, function() {
          this.ret = this.commandsService.undo({
            type: e.cmd
          }, 'state', 'game');
        }, function() {
          it('should proxy <ctxt.type>.undo', function() {
            this.thenExpect(this.ret, function(value) {
              expect(this[e.cmd].undo)
                .toHaveBeenCalledWith({
                  type: e.cmd
                }, 'state', 'game');

              expect(value).toBe(e.cmd+'.undo.returnValue');
            });
          });
        });
      });

      describe('when undo fails', function() {
        beforeEach(function() {
          mockReturnPromise(this.cmd1.undo);
          this.cmd1.undo.rejectWith = 'reason';
          this.ret = this.commandsService
            .undo({ type: 'cmd1' }, 'state', 'game');
        });

        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });
    });
  });
});
