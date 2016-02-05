describe('game model', function() {
  beforeEach(inject([ 'game', function(gameModel) {
    this.gameModel = gameModel;
  }]));

  context('create(<user>)', function() {
    return this.gameModel.create({ name: 'user' });
  }, function() {
    it('should create default game', function() {
      expect(this.context)
        .toEqual({
          players: {
            p1: { name: 'user' },
            p2: { name: null   }
          }
        });
    });
  });

  describe('description()', function() {
    example(function(e, d) {
      it('should build description string for the game, '+d, function() {
        expect(this.gameModel.description(e.game))
          .toEqual(e.desc);
      });
    }, [
      [ 'game', 'desc' ],
      [ { players: { p1: { name: 'p1' },
                     p2: { name: null } } }, 'P1 vs John Doe' ],
      [ { players: { p1: { name: null },
                     p2: { name: 'p2' } } }, 'John Doe vs P2' ],
      [ { players: { p1: { name: 'p1' },
                       p2: { name: 'p2' } } }, 'P1 vs P2' ],
    ]);
  });

  context('toJson()', function() {
    return this.gameModel.toJson({
      players: 'players',
      commands: 'commands',
      undo: 'undo',
      other: 'other'
    });
  }, function() {
    beforeEach(function() {
      this.jsonStringifierService = spyOnService('jsonStringifier');
    });

    it('should pick selected keys', function() {
      expect(this.jsonStringifierService.stringify)
        .toHaveBeenCalledWith({
          players:'players',
          commands:'commands',
          undo:'undo'
        });

      expect(this.context)
        .toEqual('jsonStringifier.stringify.returnValue');
    });
  });

  context('load(<state>, <data>)', function() {
    return this.gameModel.loadP(this.state, this.data);
  }, function() {
    beforeEach(function() {
      this.data = {
        players: { p1: { name: 'p1' } },
        commands: ['cmd1', 'cmd2']
      };

      this.state = jasmine.createSpyObj('state', [
        'changeEvent'
      ]);

      this.commandsService = spyOnService('commands');
      this.commandsService.replayBatchP
        .resolveWith((c, s, g) => g);
    });

    it('should extend game with default values', function() {
      expect(R.omit(['toJSON', 'connection'], this.context))
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
          // ruler: {
          //   local: {
          //     display: false,
          //     start: { x:0, y: 0 },
          //     end: { x:0, y: 0 },
          //     length: null
          //   },
          //   remote: {
          //     display: false,
          //     start: { x:0, y: 0 },
          //     end: { x:0, y: 0 },
          //     length: null
          //   }
          // },
          // los: {
          //   local: {
          //     display: false,
          //     start: { x:0, y: 0 },
          //     end: { x:0, y: 0 }
          //   },
          //   remote: {
          //     display: false,
          //     start: { x:0, y: 0 },
          //     end: { x:0, y: 0 }
          //   },
          //   computed: {}
          // },
          // models: { active: [], locked: [] },
          // model_selection: { local: [],
          //                    remote: []
          //                  },
          // templates: { active: [], locked: [] },
          // template_selection: { local: [],
          //                       remote: []
          //                     },
          // terrains: { active: [], locked: [] },
          // terrain_selection: { local: [],
          //                      remote: []
          //                    },
          // layers: ['b','d','s','m','t']
        });
    });

    it('should replay commands', function() {
      expect(this.commandsService.replayBatchP)
        .toHaveBeenCalledWith(['cmd1', 'cmd2'],
                              this.state, this.context);
    });
  });
});
