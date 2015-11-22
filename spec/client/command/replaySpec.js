'use strict';

describe('replay commands', function() {
  describe('commonModeService', function() {
    beforeEach(inject([
      'commonMode',
      function(commonModeService) {
        this.commonModeService = commonModeService;
        this.gameService = spyOnService('game');
      }
    ]));

    describe('commandReplayNext()', function() {
      beforeEach(function() {
        this.scope = { game: 'game' };
      });

      it('should replay game next command', function() {
        this.ret = this.commonModeService.actions.commandReplayNext(this.scope);

        expect(this.gameService.replayNextCommand)
          .toHaveBeenCalledWith(this.scope, this.scope.game);
        expect(this.ret)
          .toBe('game.replayNextCommand.returnValue');
      });
    });
  });

  describe('gameService', function(c) {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
      this.commandsService = spyOnService('commands');
      mockReturnPromise(this.commandsService.replay);
    }]));

    when('replayNextCommand(<scope>, <game>)', function() {
      this.ret = this.gameService.replayNextCommand(this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: [ 'cmd1' ],
                      undo: ['cmd3', 'cmd2' ]
                    };
        this.scope = jasmine.createSpyObj('scope', [
          'saveGame', 'gameEvent'
        ]);
        mockReturnPromise(this.scope.saveGame);
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
        expect(this.commandsService.replay)
          .toHaveBeenCalledWith('cmd2', this.scope, this.game);
      });

      describe('when undo fails', function() {
        it('should reject promise', function() {
          this.commandsService.replay.reject('reason');

          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });
      
      it('should switch undo to cmd queue', function() {
        this.commandsService.replay.resolve();

        this.thenExpect(this.commandsService.replay.promise, function() {
          expect(this.game.commands)
            .toEqual(['cmd1','cmd2']);
          expect(this.game.undo)
            .toEqual(['cmd3']);
        });
      });

      it('should save game', function() {
        this.commandsService.replay.resolve();

        this.thenExpect(this.commandsService.replay.promise, function() {
          expect(this.scope.saveGame)
            .toHaveBeenCalledWith(this.game);
        });
      });

      it('should send replay event', function() {
        this.scope.saveGame.resolveWith = 'game';
        this.commandsService.replay.resolve();
        
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('command','replay');
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
        this.ret = this.commandsService.replay({ type: 'unknown' }, 'scope', 'game');
      }, function() {
        it('should discard command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('replay unknown command unknown');
            
            expect(this.cmd1.replay)
              .not.toHaveBeenCalled();
            expect(this.cmd2.replay)
              .not.toHaveBeenCalled();
          });
        });
      });

      using([
        [ 'cmd'  ],
        [ 'cmd1' ],
        [ 'cmd2' ],
      ], function(e, d) {
        when('<ctxt.type> is known, '+d, function() {
          this.ret = this.commandsService.replay({ type: e.cmd }, 'scope', 'game');
        }, function() {
          it('should proxy <name>.replay', function() {
            this.thenExpect(this.ret, function(value) {
              expect(this[e.cmd].replay)
                .toHaveBeenCalledWith({ type: e.cmd }, 'scope', 'game');

              expect(value).toEqual(e.cmd+'.returnValue');
            });
          });
        });
      });

      describe('when replay fails', function() {
        beforeEach(function() {
          mockReturnPromise(this.cmd1.replay);
          this.cmd1.replay.rejectWith = 'reason';
          this.ret = this.commandsService.replay({ type: 'cmd1' }, 'scope', 'game');
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
