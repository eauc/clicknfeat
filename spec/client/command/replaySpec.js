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

  describe('gameService', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;

      this.commandsService = spyOnService('commands');
      mockReturnPromise(this.commandsService.replay);
      this.commandsService.replay.resolveWith = 'commands.replay.returnValue';
      
      this.gameConnectionService = spyOnService('gameConnection');
      this.gameConnectionService.active._retVal = false;
    }]));

    when('replayNextCommand(<scope>, <game>)', function() {
      this.ret = this.gameService
        .replayNextCommand(this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: [ 'cmd1' ],
                      undo: ['cmd3', 'cmd2' ],
                      undo_log: [],
                    };

        this.scope = jasmine.createSpyObj('scope', [
          'saveGame', 'gameEvent'
        ]);
        mockReturnPromise(this.scope.saveGame);
        this.scope.saveGame.resolveWith = 'scope.saveGame.returnValue';
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
        it('should store command in log', function() {
          this.thenExpect(this.ret, function() {
            expect(this.game.commands_log)
              .toEqual(['cmd2']);
          });
        });

        it('should send replayCmd event on connection', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameConnectionService.sendEvent)
              .toHaveBeenCalledWith({
                type: 'replayCmd',
                cmd: 'cmd2'
              }, this.game);
          });
        });

        it('should update game', function() {
          this.thenExpect(this.ret, function() {
            expect(this.game.commands).toEqual(['cmd1']);
            expect(this.game.undo).toEqual(['cmd3']);
            expect(this.scope.saveGame)
              .toHaveBeenCalledWith(this.game);
          });
        });
      });
      
      it('should switch undo to cmd queue', function() {
        this.thenExpect(this.ret, function() {
          expect(this.game.commands)
            .toEqual(['cmd1','cmd2']);
          expect(this.game.undo)
            .toEqual(['cmd3']);
        });
      });

      it('should save game', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.saveGame)
            .toHaveBeenCalledWith(this.game);
        });
      });

      it('should send replay event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('command','replay');
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
    
    when('replayBatch(<cmds>, <scope>, <game>)', function() {
      this.ret = this.commandsService
        .replayBatch(this.cmds, 'scope', 'game');
    }, function() {
      beforeEach(function() {
        spyOn(this.commandsService, 'replay');
        mockReturnPromise(this.commandsService.replay);

        this.replay = '';
        this.commandsService.replay.resolveWith = R.bind(function(c) {
          this.replay += c;
        }, this);

        this.cmds = [ 'cmd1', 'cmd2', 'cmd3' ];
      });

      it('should replay each command in batch in order', function() {
        this.thenExpect(this.ret, function() {
          expect(this.commandsService.replay)
            .toHaveBeenCalledWith('cmd1', 'scope', 'game');
          expect(this.commandsService.replay)
            .toHaveBeenCalledWith('cmd2', 'scope', 'game');
          expect(this.commandsService.replay)
            .toHaveBeenCalledWith('cmd3', 'scope', 'game');

          expect(this.replay).toBe('cmd1cmd2cmd3');
        });
      });

      when('some command fails', function() {
        this.commandsService.replay.resolveWith = function(c) {
          return ( c === 'cmd2' ?
                   self.Promise.reject('reason') :
                   true
                 );
        };
      }, function() {
        it('should still replay all commands in batch', function() {
          this.thenExpect(this.ret, function() {
            expect(this.commandsService.replay)
              .toHaveBeenCalledWith('cmd1', 'scope', 'game');
            expect(this.commandsService.replay)
              .toHaveBeenCalledWith('cmd2', 'scope', 'game');
            expect(this.commandsService.replay)
              .toHaveBeenCalledWith('cmd3', 'scope', 'game');
          });
        });
      });
    });
  });
});
