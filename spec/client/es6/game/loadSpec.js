describe('load game', function() {
  describe('game service', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
    }]));

    describe('load(state)', function() {
      beforeEach(function() {
        this.game = {
          players: { p1: { name: 'p1' } },
          commands: ['cmd1', 'cmd2']
        };

        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);

        this.commandsService = spyOnService('commands');
        mockReturnPromise(this.commandsService.replayBatch);
        this.commandsService.replayBatch.resolveWith = (c, s, g) => g;

        this.ret = this.gameService.load(this.state, this.game);
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
                  length: null
                },
                remote: {
                  display: false,
                  start: { x:0, y: 0 },
                  end: { x:0, y: 0 },
                  length: null
                }
              },
              los: {
                local: {
                  display: false,
                  start: { x:0, y: 0 },
                  end: { x:0, y: 0 }
                },
                remote: {
                  display: false,
                  start: { x:0, y: 0 },
                  end: { x:0, y: 0 }
                },
                computed: {}
              },
              models: { active: [], locked: [] },
              model_selection: { local: [],
                                 remote: []
                               },
              templates: { active: [], locked: [] },
              template_selection: { local: [],
                                    remote: []
                                  },
              terrains: { active: [], locked: [] },
              terrain_selection: { local: [],
                                   remote: []
                                 },
              layers: ['b','d','s','m','t']
            });
        });
      });

      it('should replay commands', function() {
        this.thenExpect(this.ret, function(game) {
          expect(this.commandsService.replayBatch)
            .toHaveBeenCalledWith(['cmd1', 'cmd2'], this.state, game);
        });
      });
    });
  });
});
