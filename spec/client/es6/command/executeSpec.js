describe('execute commands', function() {
  describe('stateService', function() {
    beforeEach(inject([
      'stateGame',
      function(stateGameService) {
        this.stateGameService = stateGameService;

        this.gameService = spyOnService('game');
        mockReturnPromise(this.gameService.executeCommand);
        this.gameService.executeCommand
          .resolveWith = 'game.executeCommand.returnValue';
      }
    ]));

    function expectGameUpdate(ctxt, game) {
      expect(ctxt.state.game)
        .toBe(game);
      expect(ctxt.state.changeEvent)
        .toHaveBeenCalledWith('Game.change');
    }

    describe('onGameCommandExecute(<cmd>, <args>)', function() {
      beforeEach(function() {
        this.state = {
          game: 'game',
          changeEvent: jasmine.createSpy('changeEvent')
        };
      });

      it('should execute game command', function() {
        this.ret = this.stateGameService
          .onGameCommandExecute(this.state, 'event', 'cmd', 'args');

        this.thenExpect(this.ret, () => {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('cmd', 'args', this.state, 'game');
          expectGameUpdate(this, 'game.executeCommand.returnValue');
        });
      });
    });
  });

  describe('gameService', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;

      this.commandsService = spyOnService('commands');

      this.gameConnectionService = spyOnService('gameConnection');
      this.gameConnectionService.active._retVal = false;
      mockReturnPromise(this.gameConnectionService.sendReplayCommand);
      this.gameConnectionService.sendReplayCommand
        .resolveWith = 'gameConnection.sendReplayCommand.returnValue';
      
      this.state = jasmine.createSpyObj('state', [
        'changeEvent'
      ]);
      this.state.user = { state: { name: 'user' } };
    }]));

    when('executeCommand(<...args...>, <scope>, <game>)', function() {
      this.ret = this.gameService
        .executeCommand('cmd', ['arg1', 'arg2'], this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: [],
                      commands_log: [],
                      dice: []
                    };

        mockReturnPromise(this.commandsService.execute);
        this.commandsService.execute.resolveWith = [
          { command: 'ctxt' },
          this.game
        ];
        spyOn(R, 'guid').and.returnValue('stamp');
      });

      it('should proxy commandsService.execute', function() {
        expect(this.commandsService.execute)
          .toHaveBeenCalledWith('cmd', ['arg1', 'arg2'], this.state, this.game);
      });

      when('commandsService.execute fails', function() {
        this.commandsService.execute.rejectWith  = 'reason';
      }, function() {
        it('should discard command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe(reason);
          });
        });
      });

      when('game connection is active', function() {
        this.gameConnectionService.active._retVal = true;
      }, function() {
        beforeEach(function() {
          this.gameConnectionService.sendReplayCommand
            .resolveWith = this.game;
        });
        
        it('should send replay command', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameConnectionService.sendReplayCommand)
              .toHaveBeenCalledWith({ command: 'ctxt',
                                      user: 'user',
                                      stamp: 'stamp'
                                    }, this.game);
          });
        });

        it('should send "Game.command.execute" changeEvent', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.command.execute');
          });
        });

        it('should not change game', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result.commands).toEqual([]);
          });
        });
      });
      
      when('command is loggable', function() {
        this.commandsService.execute
          .resolveWith = [
            { do_not_log: false },
            this.game
          ];
      }, function() {
        it('should register command', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result.commands)
              .toEqual([
                { do_not_log: false, user: 'user', stamp: 'stamp' }
              ]);
          });
        });
      });

      using([
        [ 'type' ],
        [ 'rollDice' ],
        [ 'rollDeviation' ],
      ], function(e) {
        when('command type is '+e.type, function() {
          this.commandsService.execute
            .resolveWith = [
              { type: e.type },
              this.game
            ];
        }, function() {
          it('should append command to game dice', function() {
            this.thenExpect(this.ret, function(result) {
              expect(result.dice)
                .toEqual([
                  { type: e.type, user: 'user', stamp: 'stamp' }
                ]);
            });
          });
        });
      });
      
      when('command is not loggable', function() {
        this.commandsService.execute
          .resolveWith = [
            { do_not_log: true },
            this.game
          ];
      }, function() {
        it('should not register command', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result.commands)
              .toEqual([]);
          });
        });
      });

      it('should send "Game.command.execute" changeEvent', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.command.execute');
        });
      });

      it('should return updated game', function() {
        this.thenExpect(this.ret, function(game) {
          expect(game)
            .toEqual({
              commands: [ { command: 'ctxt', user: 'user', stamp: 'stamp' } ],
              commands_log: [],
              dice: []
            });
        });
      });
    });
  });

  describe('commandsService', function() {
    beforeEach(inject([ 'commands', function(commandsService) {
      this.commandsService = commandsService;

      this.state = { state: 'state' };
      this.game = { game: 'game' };
      this.cmd1 = jasmine.createSpyObj('cmd1', [
        'execute', 'replay', 'undo'
      ]);
      this.cmd1.execute.and.returnValue([
        { returnValue: 'cmd1' },
        this.game
      ]);
      this.cmd2 = jasmine.createSpyObj('cmd2', [
        'execute', 'replay', 'undo'
      ]);
      this.cmd2.execute.and.returnValue([
        { 'returnValue': 'cmd2' },
        this.game
      ]);

      this.commandsService.registerCommand('cmd1',this.cmd1);
      this.commandsService.registerCommand('cmd2',this.cmd2);
    }]));

    describe('execute(<name>, <args>, <state>, <game>)', function() {
      when('<name> is unknown', function() {
        this.ret = this.commandsService
          .execute('unknown', [], this.state, this.game);
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('execute unknown command "unknown"');
          });
        });
      });

      using([
        [ 'cmd' ],
        [ 'cmd1' ],
        [ 'cmd2' ],
      ], function(e, d) {
        when('<name> is known, '+d, function() {
          this.ret = this.commandsService
            .execute(e.cmd, ['arg1', 'arg2'], this.state, this.game);
        }, function() {
          it('should proxy <name>.execute', function() {
            this.thenExpect(this.ret, function() {
              expect(this[e.cmd].execute)
                .toHaveBeenCalledWith('arg1', 'arg2', this.state, this.game);
            });
          });

          it('should return context', function() {
            this.thenExpect(this.ret, function(ctxt) {
              expect(ctxt).toEqual([
                { type: e.cmd, returnValue: e.cmd },
                this.game
              ]);
            });
          });
        });
      });

      when('<name>.execute reject promise', function() {
        mockReturnPromise(this.cmd1.execute);
        this.cmd1.execute.rejectWith = 'reason';
          this.ret = this.commandsService
            .execute('cmd1', ['arg1', 'arg2'], this.state, this.game);
      }, function() {
        it('should also reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });
    });
  });
});
