describe('game model', function() {
  beforeEach(inject([ 'game', function(gameModel) {
    this.gameModel = gameModel;

    this.gameConnectionModel = spyOnService('gameConnection');
    this.gameConnectionModel.create
      .and.callThrough();
    this.gameConnectionModel.active
      .and.callThrough();
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

  context('loadP(<data>)', function() {
    return this.gameModel.loadP(this.data);
  }, function() {
    beforeEach(function() {
      this.data = {
        players: { p1: { name: 'p1' } },
        commands: ['cmd1', 'cmd2']
      };

      this.commandsModel = spyOnService('commands');
      this.commandsModel.replayBatchP
        .resolveWith(R.nthArg(1));
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
          // terrain_selection: { local: [], remote: [] },
          // layers: ['b','d','s','m','t']
        });
    });

    it('should create connection', function() {
      expect(this.gameConnectionModel.create)
        .toHaveBeenCalledWith(jasmine.any(Object));
      expect(this.context.connection)
        .toBeAn('Object');
      expect(this.gameConnectionModel.active(this.context))
        .toBeFalsy();
    });

    it('should replay commands', function() {
      expect(this.commandsModel.replayBatchP)
        .toHaveBeenCalledWith(['cmd1', 'cmd2'],
                              this.context);
    });
  });

  context('executeCommandP(<...args...>, <user_name>, <game>)', function() {
    return this.gameModel
      .executeCommandP('cmd', ['arg1', 'arg2'], 'user', this.game);
  }, function() {
    beforeEach(function() {
      this.game = { commands: [],
                    commands_log: [],
                    dice: []
                  };

      this.commandsModel = spyOnService('commands');
      this.commandsModel.executeP.resolveWith([
        { command: 'ctxt' },
        this.game
      ]);
      spyOn(R, 'guid').and.returnValue('stamp');
    });

    it('should proxy commandsModel.execute', function() {
      expect(this.commandsModel.executeP)
        .toHaveBeenCalledWith('cmd', ['arg1', 'arg2'], this.game);
    });

    context('when commandsModel.execute fails', function() {
      this.commandsModel.executeP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should discard command', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    context('when game connection is active', function() {
      this.gameConnectionModel.active
        .and.returnValue(true);
    }, function() {
      beforeEach(function() {
        this.gameConnectionModel.sendReplayCommand
          .and.returnValue(this.game);
      });

      it('should send replay command', function() {
        expect(this.gameConnectionModel.sendReplayCommand)
          .toHaveBeenCalledWith({ command: 'ctxt',
                                  user: 'user',
                                  stamp: 'stamp'
                                }, this.game);
      });

      it('should not change game', function() {
        expect(this.context.commands).toEqual([]);
      });
    });

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

    it('should return updated game', function() {
      expect(this.context)
        .toEqual({
          commands: [ { command: 'ctxt', user: 'user', stamp: 'stamp' } ],
          commands_log: [],
          dice: []
        });
    });
  });

  context('replayCommandP(<cmd>, <game>)', function() {
    return this.gameModel
      .replayCommandP(this.cmd, this.game);
  }, function() {
    beforeEach(function() {
      this.game = { commands: [ { stamp: 'cmd1' }
                              ],
                    commands_log: [ { stamp: 'cmd2' },
                                    { stamp: 'cmd3' }
                                  ],
                    undo: []
                  };
      this.cmd = { stamp: 'stamp' };

      this.commandsModel = spyOnService('commands');
      this.commandsModel.replayP
        .resolveWith(this.game);
    });

    context('when <cmd> is in command log', function() {
      this.cmd = { stamp: 'cmd2' };
    }, function() {
      it('should remove <cmd> from log', function() {
        expect(this.context).toEqual({
          commands: [ { stamp: 'cmd1' },
                      { stamp: 'cmd2' }
                    ],
          commands_log: [ { stamp: 'cmd3' }
                        ],
          undo: []
        });
      });
    });

    it('should replay <cmd>', function() {
      expect(this.commandsModel.replayP)
        .toHaveBeenCalledWith(this.cmd, this.game);
    });

    context('when undo fails', function() {
      this.commandsModel.replayP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    it('should append <cmd> to history', function() {
      expect(this.context).toEqual({
        commands: [ { stamp: 'cmd1' },
                    { stamp: 'stamp' }
                  ],
        commands_log: [ { stamp: 'cmd2' },
                        { stamp: 'cmd3' }
                      ],
        undo: []
      });
    });

  });

  context('replayCommandsBatchP(<cmds>, <game>)', function() {
    return this.gameModel
      .replayCommandsBatchP(this.cmds, 'game');
  }, function() {
    beforeEach(function() {
      this.cmds = [ 'cmd2', 'cmd3' ];

      this.commandsModel = spyOnService('commands');
      this.commandsModel.replayBatchP
        .resolveWith({ commands: ['cmd1'] });
    });

    it('should replay command batch', function() {
      expect(this.commandsModel.replayBatchP)
        .toHaveBeenCalledWith(this.cmds, 'game');
    });

    it('should append batch to game\'s commands', function() {
      expect(this.context.commands)
        .toEqual([ 'cmd1', 'cmd2', 'cmd3' ]);
    });
  });

  context('replayNextCommandP(<game>)', function() {
    return this.gameModel
      .replayNextCommandP(this.game);
  }, function() {
    beforeEach(function() {
      this.game = { commands: [ 'cmd1' ],
                    undo: ['cmd3', 'cmd2' ]
                  };

      this.commandsModel = spyOnService('commands');
      this.commandsModel.replayP
        .resolveWith(this.game);
      this.gameConnectionModel.sendReplayCommand
        .and.callFake(R.nthArg(1));
    });

    context('when undo history is empty', function() {
      this.game.undo = [];
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'Undo history empty'
        ]);
      });
    });

    it('should replay next undo', function() {
      expect(this.commandsModel.replayP)
        .toHaveBeenCalledWith('cmd2', this.game);
    });

    context('when undo fails', function() {
      this.commandsModel.replayP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    context('when game connection is active', function() {
      this.gameConnectionModel.active
        .and.returnValue(true);
    }, function() {
      it('should send replayCommand event on connection', function() {
        expect(this.gameConnectionModel.sendReplayCommand)
          .toHaveBeenCalledWith('cmd2', {
            commands: [ 'cmd1' ],
            undo: [ 'cmd3' ]
          });
      });

      it('should update game', function() {
        expect(this.context).toEqual({
          commands: [ 'cmd1' ],
          undo: [ 'cmd3' ]
        });
      });
    });

    it('should switch undo to cmd queue', function() {
      expect(this.context)
        .toEqual({
          commands: [ 'cmd1', 'cmd2' ],
          undo: [ 'cmd3' ]
        });
    });
  });

  context('undoCommandP(<cmd>, <game>)', function() {
    return this.gameModel
      .undoCommandP(this.cmd, this.game);
  }, function() {
    beforeEach(function() {
      this.game = { undo: [ { stamp: 'cmd1' }
                          ],
                    undo_log: [ { stamp: 'cmd2' },
                                { stamp: 'cmd3' }
                              ],
                    commands: []
                  };
      this.cmd = { stamp: 'stamp' };

      this.commandsModel = spyOnService('commands');
      this.commandsModel.undoP
        .resolveWith(this.game);
    });

    context('when <cmd> is in undo log', function() {
      this.cmd = { stamp: 'cmd2' };
    }, function() {
      it('should swith <cmd> to undo history', function() {
        expect(this.context).toEqual({
          undo: [ { stamp: 'cmd1' },
                  { stamp: 'cmd2' }
                ],
          undo_log: [ { stamp: 'cmd3' }
                    ],
          commands: []
        });
      });
    });

    context('when undo fails', function() {
      this.commandsModel.undoP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    it('should swith <cmd> to history', function() {
      expect(this.context).toEqual({
        undo: [ { stamp: 'cmd1' },
                { stamp: 'stamp' }
              ],
        undo_log: [ { stamp: 'cmd2' },
                    { stamp: 'cmd3' }
                  ],
        commands: []
      });
    });
  });

  context('undoLastCommandP(<game>)', function() {
    return this.gameModel
      .undoLastCommandP(this.game);
  }, function() {
    beforeEach(function() {
      this.game = { commands: ['cmd1','cmd2'],
                    undo: ['cmd3'],
                    undo_log: []
                  };

      this.commandsModel = spyOnService('commands');
      this.commandsModel.undoP
        .resolveWith(this.game);
      this.gameConnectionModel.sendUndoCommand
        .and.callFake(R.nthArg(1));
    });

    context('when command history is empty', function() {
      this.game.commands = [];
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'Command history empty'
        ]);
      });
    });

    it('should undo last command', function() {
      expect(this.commandsModel.undoP)
        .toHaveBeenCalledWith('cmd2', this.game);
    });

    context('when undo fails', function() {
      this.commandsModel.undoP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    context('when game connection is active', function() {
      this.gameConnectionModel.active
        .and.returnValue(true);
    }, function() {
      it('should send undoCmd event on connection', function() {
        expect(this.gameConnectionModel.sendUndoCommand)
          .toHaveBeenCalledWith('cmd2', {
            commands: ['cmd1' ],
            undo: ['cmd3'],
            undo_log: []
          });
      });

      it('should remove cmd from history', function() {
          expect(this.context)
          .toEqual({
            commands: [ 'cmd1' ],
            undo: [ 'cmd3' ],
            undo_log: [  ]
          });
      });
    });

    it('should switch cmd to undo queue', function() {
      expect(this.context)
        .toEqual({
          commands: [ 'cmd1' ],
          undo: [ 'cmd3', 'cmd2' ],
          undo_log: [  ]
        });
    });
  });

  xcontext('sendChat(<from>, <msg>)', function() {
    return this.gameModel
      .sendChat(this.from, this.msg, 'game');
  }, function() {
    beforeEach(function() {
      this.from = 'user';
      this.msg = 'hello';
    });

    it('should send chat event on connection', function() {
      expect(this.gameConnectionModel.sendEvent)
        .toHaveBeenCalledWith({
          type: 'chat',
          chat: { from: this.from,
                  msg: this.msg
                }
        }, 'game');
    });
  });
});
