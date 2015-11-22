'use strict';

describe('execute commands', function() {
  describe('gameService', function(c) {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
      this.commandsService = spyOnService('commands');
    }]));

    when('executeCommand(<...args...>, <scope>, <game>)', function() {
      this.ret = this.gameService.executeCommand('arg1', 'arg2', this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: [] };
        this.scope = jasmine.createSpyObj('scope', [
          'saveGame', 'gameEvent'
        ]);
        this.scope.user = { name: 'user' };
        mockReturnPromise(this.commandsService.execute);
        mockReturnPromise(this.scope.saveGame);
      });

      it('should proxy commandsService.execute', function() {
        expect(this.commandsService.execute)
          .toHaveBeenCalledWith('arg1', 'arg2', this.scope, this.game);
      });

      describe('when commandsService.execute fails', function() {
        it('should discard command', function() {
          this.commandsService.execute.reject('reason');

          this.thenExpectError(this.ret, function() {
            expect(this.game.commands).toEqual([]);
            expect(this.scope.saveGame).not.toHaveBeenCalled();
          });
        });
      });

      describe('when commandsService.execute succeeds', function() {
        describe('when command is loggable', function() {
          it('should register command', function(done) {
            this.commandsService.execute.resolve({ do_not_log: false });

            this.commandsService.execute.promise
              .then(R.bind(function() {
                expect(this.game.commands[0].user)
                  .toBe('user');
                expect(this.game.commands[0].stamp)
                  .toMatch(/[0-9a-f-]{10,}/);

                done();
              }, this));
          });
        });

        describe('command is not loggable', function() {
          it('should not register command', function(done) {
            this.commandsService.execute.resolve({ do_not_log: true });

            this.commandsService.execute.promise
              .then(R.bind(function() {
                expect(this.game.commands)
                  .toEqual([]);

                done();
              }, this));
          });
        });
        
        it('should save game', function(done) {
          this.commandsService.execute.resolve({ do_not_log: true });

          this.commandsService.execute.promise
            .then(R.bind(function() {
              expect(this.scope.saveGame)
                .toHaveBeenCalledWith(this.game);

              done();
            }, this));
        });
        
        it('should send execute event', function() {
          this.commandsService.execute.resolve({ do_not_log: true });
          this.commandsService.execute.promise
            .then(R.bind(function() {
              this.scope.saveGame.resolve('game');
            }, this));
          
          this.thenExpect(this.ret, function(cmd) {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('command','execute');
          });
        });
        
        it('should return a copy of command context', function() {
          this.commandsService.execute.resolve({ do_not_log: false });
          this.commandsService.execute.promise
            .then(R.bind(function() {
              this.scope.saveGame.resolve('game');
            }, this));
          
          this.thenExpect(this.ret, function(cmd) {
            expect(cmd)
              .toEqual(this.game.commands[0]);
            expect(cmd)
              .not.toBe(this.game.commands[0]);
          });
        });
      });
    });
  });

  describe('commandsService', function(c) {
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
        self.setTimeout(R.bind(function() {
          this.cmd1.execute.reject('reason');
        }, this), 0);
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
