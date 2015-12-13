'use strict';

describe('execute commands', function() {
  describe('gameService', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;

      this.commandsService = spyOnService('commands');

      this.gameConnectionService = spyOnService('gameConnection');
      this.gameConnectionService.active._retVal = false;
      mockReturnPromise(this.gameConnectionService.sendEvent);
      this.gameConnectionService.sendEvent
        .resolveWith = 'gameConnection.sendEvent.returnValue';
      
      this.scope = jasmine.createSpyObj('scope', [
        'saveGame', 'gameEvent'
      ]);
      mockReturnPromise(this.scope.saveGame);
      this.scope.saveGame.resolveWith = R.identity;
      this.scope.user = { state: { name: 'user' } };
    }]));

    when('executeCommand(<...args...>, <scope>, <game>)', function() {
      this.ret = this.gameService
        .executeCommand('arg1', 'arg2', this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: [],
                      commands_log: [],
                    };

        mockReturnPromise(this.commandsService.execute);
        this.commandsService.execute.resolveWith = { command: 'ctxt' };

      });

      it('should proxy commandsService.execute', function() {
        expect(this.commandsService.execute)
          .toHaveBeenCalledWith('arg1', 'arg2', this.scope, this.game);
      });

      when('commandsService.execute fails', function() {
        this.commandsService.execute.rejectWith  = 'reason';
      }, function() {
        it('should discard command', function() {
          this.thenExpectError(this.ret, function() {
            expect(this.game.commands).toEqual([]);
            expect(this.scope.saveGame).not.toHaveBeenCalled();
          });
        });
      });

      when('game connection is active', function() {
        this.gameConnectionService.active._retVal = true;
      }, function() {
        beforeEach(function() {
          spyOn(R, 'guid').and.returnValue('stamp');
        });
        
        it('should store command in log', function() {
          this.thenExpect(this.ret, function() {
            expect(this.game.commands_log)
              .toEqual([
                { user: 'user', command: 'ctxt', stamp: 'stamp' }
              ]);
          });
        });

        it('should send replayCmd event on connection', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameConnectionService.sendEvent)
              .toHaveBeenCalledWith({
                type: 'replayCmd',
                cmd: { command: 'ctxt',
                       user: 'user',
                       stamp: 'stamp'
                     }
              }, this.game);
          });
        });

        it('should not change game', function() {
          this.thenExpect(this.ret, function() {
            expect(this.game.commands).toEqual([]);
            expect(this.scope.saveGame)
              .not.toHaveBeenCalled();
          });
        });
      });
      
      when('command is loggable', function() {
        this.commandsService.execute.resolveWith = { do_not_log: false };
      }, function() {
        it('should register command', function() {
          this.thenExpect(this.ret, function() {
            expect(this.game.commands[0].user)
              .toBe('user');
            expect(this.game.commands[0].stamp)
              .toMatch(/[0-9a-f-]{10,}/);
          });
        });
      });
      
      when('command is not loggable', function() {
        this.commandsService.execute.resolveWith = { do_not_log: true };
      }, function() {
        it('should not register command', function() {
          this.thenExpect(this.ret, function() {
            expect(this.game.commands)
              .toEqual([]);
          });
        });
      });
        
      it('should save game', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.saveGame)
            .toHaveBeenCalledWith(this.game);
        });
      });
        
      it('should send execute event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('command','execute');
        });
      });
        
      it('should return a copy of command context', function() {
        this.thenExpect(this.ret, function(cmd) {
          expect(cmd)
            .toEqual(this.game.commands[0]);
          expect(cmd)
            .not.toBe(this.game.commands[0]);
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
      this.cmd1.execute.and.returnValue({ 'returnValue': 'cmd1' });
      this.cmd2 = jasmine.createSpyObj('cmd2', [
        'execute', 'replay', 'undo'
      ]);
      this.cmd2.execute.and.returnValue({ 'returnValue': 'cmd2' });

      this.commandsService.registerCommand('cmd1',this.cmd1);
      this.commandsService.registerCommand('cmd2',this.cmd2);
    }]));

    describe('execute(<name>, <...args...>)', function() {
      when('<name> is unknown', function() {
        this.ret = this.commandsService.execute('unknown');
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('execute unknown command unknown');
          });
        });
      });

      using([
        [ 'cmd' ],
        [ 'cmd1' ],
        [ 'cmd2' ],
      ], function(e, d) {
        when('<name> is known, '+d, function() {
          this.ret = this.commandsService.execute(e.cmd, 'arg1', 'arg2');
        }, function() {
          it('should proxy <name>.execute', function() {
            this.thenExpect(this.ret, function() {
              expect(this[e.cmd].execute)
                .toHaveBeenCalledWith('arg1', 'arg2');
            });
          });

          it('should return context', function() {
            this.thenExpect(this.ret, function(ctxt) {
              expect(ctxt).toEqual({
                type: e.cmd,
                returnValue: e.cmd
              });
            });
          });
        });
      });

      when('<name>.execute reject promise', function() {
        mockReturnPromise(this.cmd1.execute);
        this.ret = this.commandsService.execute('cmd1');
        self.setTimeout(() => {
          this.cmd1.execute.reject('reason');
        }, 0);
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
