'use strict';

describe('execute commands', function() {
  describe('gameService', function(c) {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
      this.commandsService = spyOnService('commands');
    }]));

    when('executeCommand(<...args...>, <scope>, <game>)', function() {
      this.gameService.executeCommand('arg1', 'arg2', this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: [] };
        this.scope = jasmine.createSpyObj('scope', [
          'saveGame', 'gameEvent'
        ]);
        this.scope.user = { name: 'user' };
        this.commandsService.execute._retVal = {
          returnValue: 'commands.execute.returnValue'
        };
      });

      it('should proxy commandsService.execute', function() {
        expect(this.commandsService.execute)
          .toHaveBeenCalledWith('arg1', 'arg2', this.scope, this.game);
      });

      when('commandsService.execute fails', function() {
        this.commandsService.execute._retVal = undefined;
      }, function() {
        it('should discard command', function() {
          expect(this.game.commands).toEqual([]);
          expect(this.scope.saveGame).not.toHaveBeenCalled();
        });
      });

      when('commandsService.execute succeeds', function() {
      }, function() {
        it('should register command', function() {
          expect(this.game.commands[0].user)
            .toBe('user');
          expect(this.game.commands[0].returnValue)
            .toBe('commands.execute.returnValue');
          expect(this.game.commands[0].stamp)
            .toMatch(/[1-9a-f-]{10,}/);
        });
        it('should save game', function() {
          expect(this.scope.saveGame)
            .toHaveBeenCalledWith(this.game);
        });
        it('should send execute event', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('command','execute');
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
        it('should not return a context', function() {
          expect(this.ret).toBe(undefined);
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
            expect(this[e.cmd].execute)
              .toHaveBeenCalledWith('arg1', 'arg2');
          });

          it('should return context', function() {
            expect(this.ret)
              .toEqual({
                type: e.cmd,
                returnValue: e.cmd
              });
          });
        });
      });

      when('<name>.execute returns Nil', function() {
        this.cmd1.execute.and.returnValue(null);
        this.ret = this.commandsService.execute('cmd1');
      }, function() {
        it('should not return a context', function() {
          expect(this.ret).toBe(undefined);
        });
      });
    });
  });
});
