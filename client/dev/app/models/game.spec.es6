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

  context('executeCommandP(<...args...>, <scope>, <game>)', function() {
    return this.gameModel
      .executeCommandP('cmd', ['arg1', 'arg2'], this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.game = { commands: [],
                    commands_log: [],
                    dice: []
                  };
      this.state = jasmine.createSpyObj('state', [
        'queueChangeEventP'
      ]);
      this.state.user = { state: { name: 'user' } };

      this.commandsModel = spyOnService('commands');
      this.commandsModel.executeP.resolveWith([
        { command: 'ctxt' },
        this.game
      ]);
      spyOn(R, 'guid').and.returnValue('stamp');
    });

    it('should proxy commandsModel.execute', function() {
      expect(this.commandsModel.executeP)
        .toHaveBeenCalledWith('cmd', ['arg1', 'arg2'], this.state, this.game);
    });

    context('when commandsModel.execute fails', function() {
      this.commandsModel.executeP.rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should discard command', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    // context('when game connection is active', function() {
    //   this.gameConnectionModel.active
    //     .and.returnValue(true);
    // }, function() {
    //   beforeEach(function() {
    //     this.gameConnectionModel.sendReplayCommandP
    //       .resolveWith(this.game);
    //   });

    //   it('should send replay command', function() {
    //     expect(this.gameConnectionModel.sendReplayCommandP)
    //       .toHaveBeenCalledWith({ command: 'ctxt',
    //                               user: 'user',
    //                               stamp: 'stamp'
    //                             }, this.game);
    //   });

    //   it('should send "Game.command.execute" changeEvent', function() {
    //     expect(this.state.queueChangeEventP)
    //       .toHaveBeenCalledWith('Game.command.execute');
    //   });

    //   it('should not change game', function() {
    //     expect(this.context.commands).toEqual([]);
    //   });
    // });

    context('when command is loggable', function() {
      this.commandsModel.executeP
        .resolveWith([
          { do_not_log: false },
          this.game
        ]);
    }, function() {
      it('should register command', function() {
        expect(this.context.commands)
          .toEqual([
            { do_not_log: false, user: 'user', stamp: 'stamp' }
          ]);
      });
    });

    example(function(e) {
      context('when command type is '+e.type, function() {
        this.commandsModel.executeP
          .resolveWith([
            { type: e.type },
            this.game
          ]);
      }, function() {
        it('should append command to game dice', function() {
          expect(this.context.dice)
            .toEqual([
              { type: e.type, user: 'user', stamp: 'stamp' }
            ]);
        });
      });
    }, [
      [ 'type' ],
      [ 'rollDice' ],
      [ 'rollDeviation' ],
    ]);

    context('when command is not loggable', function() {
      this.commandsModel.executeP
        .resolveWith([
          { do_not_log: true },
          this.game
        ]);
    }, function() {
      it('should not register command', function() {
        expect(this.context.commands)
          .toEqual([]);
      });
    });

    it('should send "Game.command.execute" changeEvent', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.command.execute');
    });

    it('should return updated game', function() {
      expect(this.context)
        .toEqual({
          commands: [ { command: 'ctxt', user: 'user', stamp: 'stamp' } ],
          commands_log: [],
          dice: []
        });
    });
  });
});
