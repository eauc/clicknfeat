'use strict';

describe('undo commands', function() {
  describe('commonModeService', function() {
    beforeEach(inject([
      'commonMode',
      function(commonModeService) {
        this.commonModeService = commonModeService;
        this.gameService = spyOnService('game');
      }
    ]));

    describe('commandUndoLast()', function() {
      beforeEach(function() {
        this.scope = { game: 'game' };
      });

      it('should undo game last command', function() {
        this.commonModeService.actions.commandUndoLast(this.scope);
        expect(this.gameService.undoLastCommand)
          .toHaveBeenCalledWith(this.scope, this.scope.game);
      });
    });
  });

  describe('gameService', function(c) {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
      this.commandsService = spyOnService('commands');
      mockReturnPromise(this.commandsService.undo);
    }]));

    when('undoLastCommand(<scope>, <game>)', function() {
      this.ret = this.gameService.undoLastCommand(this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: [ 'cmd1', 'cmd2' ],
                      undo: ['cmd3' ]
                    };
        this.scope = jasmine.createSpyObj('scope', [
          'saveGame', 'gameEvent'
        ]);
        mockReturnPromise(this.scope.saveGame);
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
        expect(this.commandsService.undo)
          .toHaveBeenCalledWith('cmd2', this.scope, this.game);
      });

      describe('when undo fails', function() {
        it('should reject promise', function() {
          this.commandsService.undo.reject('reason');

          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });
      
      it('should switch cmd to undo queue', function() {
        this.commandsService.undo.resolve();
        
        this.thenExpect(this.commandsService.undo.promise, function() {
          expect(this.game.commands)
            .toEqual(['cmd1']);
          expect(this.game.undo)
            .toEqual(['cmd3','cmd2']);
        });
      });

      it('should save game', function() {
        this.commandsService.undo.resolve();

        this.thenExpect(this.commandsService.undo.promise, function() {
          expect(this.scope.saveGame)
            .toHaveBeenCalledWith(this.game);
        });
      });

      it('should send undo event', function() {
        this.scope.saveGame.resolveWith = 'game';
        this.commandsService.undo.resolve();

        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('command','undo');
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
      this.cmd1.undo.and.returnValue('cmd1.undo.returnValue');
      this.cmd2 = jasmine.createSpyObj('cmd2', [
        'execute', 'replay', 'undo'
      ]);
      this.cmd2.undo.and.returnValue('cmd2.undo.returnValue');

      this.commandsService.registerCommand('cmd1',this.cmd1);
      this.commandsService.registerCommand('cmd2',this.cmd2);
    }]));

    describe('undo(<ctxt>, <scope>, <arg>)', function() {
      when('<ctxt.type> is unknown', function() {
        this.ret = this.commandsService.undo({
          type: 'unknown'
        }, 'scope', 'game');
      }, function() {
        it('should discard command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('undo unknown command unknown');
            
            expect(this.cmd1.undo)
              .not.toHaveBeenCalled();
            expect(this.cmd2.undo)
              .not.toHaveBeenCalled();
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
          }, 'scope', 'game');
        }, function() {
          it('should proxy <ctxt.type>.undo', function() {
            this.thenExpect(this.ret, function(value) {
              expect(this[e.cmd].undo)
                .toHaveBeenCalledWith({
                  type: e.cmd
                }, 'scope', 'game');

              expect(value).toBe(e.cmd+'.undo.returnValue');
            });
          });
        });
      });

      describe('when undo fails', function() {
        beforeEach(function() {
          mockReturnPromise(this.cmd1.undo);
          this.cmd1.undo.rejectWith = 'reason';
          this.ret = this.commandsService.undo({ type: 'cmd1' }, 'scope', 'game');
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
