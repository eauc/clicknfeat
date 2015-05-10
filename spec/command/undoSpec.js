'use strict';

describe('undo commands', function() {
  describe('gameLogCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.gameService = spyOnService('game');

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          this.scope.game = 'game';

          $controller('gameLogCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    when('user undo last command', function() {
      this.scope.doUndoLast();
    }, function() {
      it('should undo last game command', function() {
        expect(this.gameService.undoLastCommand)
          .toHaveBeenCalledWith(this.scope, this.scope.game);
      });
    });
  });

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
    }]));

    when('undoLastCommand(<scope>, <game>)', function() {
      this.gameService.undoLastCommand(this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { commands: [ 'cmd1', 'cmd2' ],
                      undo: ['cmd3' ]
                    };
        this.scope = jasmine.createSpyObj('scope', [
          'saveGame', 'gameEvent'
        ]);
      });

      it('should undo last command', function() {
        expect(this.commandsService.undo)
          .toHaveBeenCalledWith('cmd2', this.scope, this.game);
      });

      it('should switch cmd to undo queue', function() {
        expect(this.game.commands)
          .toEqual(['cmd1']);
        expect(this.game.undo)
          .toEqual(['cmd3','cmd2']);
      });

      it('should save game', function() {
        expect(this.scope.saveGame)
          .toHaveBeenCalledWith(this.game);
      });

      it('should send undo event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('command','undo');
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

    describe('undo(<ctxt>, <scope>, <arg>)', function() {
      when('<ctxt.type> is unknown', function() {
        this.ret = this.commandsService.undo({
          type: 'unknown'
        }, 'scope', 'game');
      }, function() {
        it('should discard command', function() {
          expect(this.cmd1.undo)
            .not.toHaveBeenCalled();
          expect(this.cmd2.undo)
            .not.toHaveBeenCalled();
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
            expect(this[e.cmd].undo)
              .toHaveBeenCalledWith({
                type: e.cmd
              }, 'scope', 'game');
          });
        });
      });
    });
  });
});
