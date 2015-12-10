'use strict';

describe('load game', function() {
  describe('game service', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
    }]));

    describe('load(scope)', function() {
      beforeEach(function() {
        this.commandsService = spyOnService('commands');
        mockReturnPromise(this.commandsService.replayBatch);
        this.commandsService.replayBatch.resolveWith = true;
        this.game = {
          players: { p1: { name: 'p1' } },
          commands: ['cmd1', 'cmd2']
        };
        this.scope = { 'this': 'scope',
                       $digest: jasmine.createSpy('$digest'),
                       gameEvent: jasmine.createSpy('gameEvent'),
                     };
        this.ret = this.gameService.load(this.scope, this.game);
      });

      it('should extend game with default values', function() {
        this.thenExpect(this.ret, function(game) {
          expect(R.omit(['toJSON', 'connection'], game))
            .toEqual({
              players: { p1: { name: 'p1' },
                         p2: { name: null }
                       },
              board: {},
              scenario: {},
              chat: [],
              commands: [ 'cmd1', 'cmd2' ],
              undo: [],
              commands_log: [ ],
              undo_log: [],
              dice: [],
              ruler: {
                local: {
                  display: false,
                  start: { x:0, y: 0 },
                  end: { x:0, y: 0 },
                  length: null,
                },
                remote: {
                  display: false,
                  start: { x:0, y: 0 },
                  end: { x:0, y: 0 },
                  length: null,
                },
              },
              los: {
                local: {
                  display: false,
                  start: { x:0, y: 0 },
                  end: { x:0, y: 0 },
                },
                remote: {
                  display: false,
                  start: { x:0, y: 0 },
                  end: { x:0, y: 0 },
                },
              },
              models: { active: [], locked: [] },
              model_selection: { local: [],
                                 remote: []
                               },
              templates: { active: [], locked: [] },
              template_selection: { local: [],
                                    remote: []
                                  },
              layers: ['b','d','s','m','t'],
            });
        });
      });

      it('should replay commands', function() {
        this.thenExpect(this.ret, function(game) {
          expect(this.commandsService.replayBatch)
            .toHaveBeenCalledWith(['cmd1', 'cmd2'], this.scope, game);
        });
      });

      it('should send Loading and Loaded event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('gameLoading');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('gameLoaded');
        });
      });

      it('should refresh scope', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.$digest)
            .toHaveBeenCalled();
        });
      });
    });
  });
});
