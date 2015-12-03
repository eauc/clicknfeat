'use strict';

describe('game', function() {
  describe('gameConnection service', function() {
    beforeEach(inject([ 'gameConnection', function(gameConnectionService) {
      this.gameConnectionService = gameConnectionService;

      this.websocketService = spyOnService('websocket');
      mockReturnPromise(this.websocketService.create);
      this.websocketService.create.resolveWith = 'websocket.create.returnValue';
      mockReturnPromise(this.websocketService.close);
      this.websocketService.close.resolveWith = 'websocket.close.returnValue';
    }]));

    when('create()', function() {
      this.ret = this.gameConnectionService.create({});
    }, function() {
      it('should initialize a connection state', function() {
        expect(this.ret.connection)
          .toBeAn('Object');
      });
    });

    when('open()', function() {
      this.ret = this.gameConnectionService
        .open(this.user_name, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.user_name = 'user';
        
        this.scope = {};
        
        this.game = this.gameConnectionService.create({
          public_stamp: 'public_stamp'
        });
      });

      when('game has private stamp', function() {
        this.game.private_stamp = 'private_stamp';
      }, function() {
        it('should open player websocket', function() {
          expect(this.websocketService.create)
            .toHaveBeenCalledWith('/api/games/private/private_stamp?name=user',
                                  'game', jasmine.any(Object));
        });
      });

      when('game doesn\'t have private stamp', function() {
        this.game.private_stamp = null;
      }, function() {
        it('should open watcher websocket', function() {
          expect(this.websocketService.create)
            .toHaveBeenCalledWith('/api/games/public/public_stamp?name=user',
                                  'game', jasmine.any(Object));
        });
      });
      
      when('websocket creation fails', function() {
        this.websocketService.create.rejectWith = 'reason';
      }, function() {
        it('should reject creation', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.gameConnectionService.active(this.game))
              .toBeFalsy();
          });
        });
      });

      it('should activate connection', function() {
        this.thenExpect(this.ret, function(game) {
          expect(game.connection.state.socket)
            .toBe('websocket.create.returnValue');
          expect(this.gameConnectionService.active(game))
            .toBeTruthy();
        });
      });
    });

    when('close()', function() {
      this.ret = this.gameConnectionService.close(this.game);
    }, function() {
      beforeEach(function(done) {
        this.game = this.gameConnectionService.create({
          public_stamp: 'public_stamp'
        });
        this.gameConnectionService.open('user', {}, this.game)
          .then(function() {
            done();
          });
      });

      it('should close websocket', function() {
        expect(this.websocketService.close)
          .toHaveBeenCalledWith('websocket.create.returnValue');
      });

      when('websocket close fails', function() {
        this.websocketService.close.rejectWith = 'reason';
      }, function() {
        it('should reject close', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.gameConnectionService.active(this.game))
              .toBeTruthy();
          });
        });
      });

      it('should disactivate connection', function() {
        this.thenExpect(this.ret, function(game) {
          expect(game.connection.state.socket)
            .toBe(null);
          expect(this.gameConnectionService.active(game))
            .toBeFalsy();
        });
      });
    });

    when('sendEvent(<event>)', function() {
      this.ret = this.gameConnectionService
        .sendEvent(this.event, this.game);
    }, function() {
      beforeEach(function(done) {
        this.game = this.gameConnectionService.create({
          public_stamp: 'public_stamp'
        });
        this.gameConnectionService.open('user', {}, this.game)
          .then(function() {
            done();
          });

        this.event = 'event';
      });

      it('should send chat msg on websocket', function() {
        expect(this.websocketService.send)
          .toHaveBeenCalledWith(this.event, 'websocket.create.returnValue');
        expect(this.ret)
          .toBe('websocket.send.returnValue');
      });
    });

    describe('socket event handlers', function() {
      beforeEach(inject(['pubSub', function(pubSubService) {
        this.game = this.gameConnectionService.create({
          public_stamp: 'public_stamp',
          commands_log: [],
          undo_log: [],
          commands: [],
          undo: [],
          chat: [],
        });
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent', 'saveGame',
        ]);
        this.gameConnectionService.open('user', this.scope, this.game);
        this.handlers = this.websocketService.create.calls.first().args[2];

        this.event_listener = jasmine.createSpy('event_listener');
        pubSubService.subscribe('#watch#', this.event_listener,
                                this.game.connection.channel);

        this.commandsService = spyOnService('commands');
        mockReturnPromise(this.commandsService.replay);
        this.commandsService.replay.resolveWith = 'commands.replay.returnValue';
        mockReturnPromise(this.commandsService.undo);
        this.commandsService.undo.resolveWith = 'commands.undo.returnValue';
        mockReturnPromise(this.commandsService.replayBatch);
        this.commandsService.replayBatch.resolveWith = 'commands.replayBatch.returnValue';
      }]));
      
      when('replayCmd message', function() {
        this.ret = this.handlers.replayCmd(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { cmd: { stamp: 'stamp' } };
        });

        when('<msg.cmd> is in commands log', function() {
          this.game.commands_log = [ { stamp: 'log1' },
                                     { stamp: 'log2' },
                                     { stamp: 'log3' },
                                   ];
          this.msg.cmd.stamp = 'log2';
        }, function() {
          it('should remove <msg.cmd> from commands log', function() {
            this.thenExpect(this.ret, function() {
              expect(this.game.commands_log)
                .toEqual([ { stamp: 'log1' },
                           { stamp: 'log3' },
                         ]);
            });
          });
        });

        when('<msg.cmd> is not in commands log', function() {
          this.game.commands_log = [ { stamp: 'log1' },
                                     { stamp: 'log2' },
                                     { stamp: 'log3' },
                                   ];
          this.msg.cmd.stamp = 'other';
        }, function() {
          it('should replay <msg.cmd>', function() {
            this.thenExpect(this.ret, function() {
              expect(this.commandsService.replay)
                .toHaveBeenCalledWith(this.msg.cmd, this.scope, this.game);
            });
          });

          when('replay fails', function() {
            this.commandsService.replay.rejectWith = 'reason';
          }, function() {
            it('should not change game', function() {
              this.thenExpectError(this.ret, function() {
                expect(this.game.undo).toEqual([]);
                expect(this.game.commands).toEqual([]);
                expect(this.scope.saveGame)
                  .not.toHaveBeenCalled();
              });
            });
          });
        });

        it('should update game', function() {
          this.thenExpect(this.ret, function() {
            expect(this.game.undo).toEqual([]);
            expect(this.game.commands).toEqual([ this.msg.cmd ]);
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('command', 'replay');
            expect(this.scope.saveGame)
              .toHaveBeenCalledWith(this.game);
          });
        });

        when('<msg.cmd.do_not_log>', function() {
          this.msg.cmd.do_not_log = true;
        }, function() {
          it('should not add <msg.cmd> to history', function() {
            this.thenExpect(this.ret, function() {
              expect(this.game.commands).toEqual([]);
            });
          });
        });
      });
      
      when('undoCmd message', function() {
        this.ret = this.handlers.undoCmd(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { cmd: { stamp: 'stamp' } };
        });

        when('<msg.cmd> is in commands log', function() {
          this.game.undo_log = [ { stamp: 'log1' },
                                 { stamp: 'log2' },
                                 { stamp: 'log3' },
                                   ];
          this.msg.cmd.stamp = 'log2';
        }, function() {
          it('should remove <msg.cmd> from undo log', function() {
            this.thenExpect(this.ret, function() {
              expect(this.game.undo_log)
                .toEqual([ { stamp: 'log1' },
                           { stamp: 'log3' },
                         ]);
            });
          });
        });

        when('<msg.cmd> is not in commands log', function() {
          this.game.undo_log = [ { stamp: 'log1' },
                                 { stamp: 'log2' },
                                 { stamp: 'log3' },
                               ];
          this.msg.cmd.stamp = 'other';
        }, function() {
          it('should undo <msg.cmd>', function() {
            this.thenExpect(this.ret, function() {
              expect(this.commandsService.undo)
                .toHaveBeenCalledWith(this.msg.cmd, this.scope, this.game);
            });
          });

          when('replay fails', function() {
            this.commandsService.undo.rejectWith = 'reason';
          }, function() {
            it('should not change game', function() {
              this.thenExpectError(this.ret, function() {
                expect(this.game.undo).toEqual([]);
                expect(this.game.commands).toEqual([]);
                expect(this.scope.saveGame)
                  .not.toHaveBeenCalled();
              });
            });
          });
        });

        it('should update game', function() {
          this.thenExpect(this.ret, function() {
            expect(this.game.undo).toEqual([ this.msg.cmd ]);
            expect(this.game.commands).toEqual([]);
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('command', 'undo');
            expect(this.scope.saveGame)
              .toHaveBeenCalledWith(this.game);
          });
        });
      });
      
      when('cmdBatch message', function() {
        this.ret = this.handlers.cmdBatch(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { cmds: [ 'batch' ] };
        });

        it('should emit "gameLoading" event', function() {
          this.thenExpect(this.ret, function() {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('gameLoading');
          });
        });
        
        it('should replay <msg.cmds>', function() {
          this.thenExpect(this.ret, function() {
            expect(this.commandsService.replayBatch)
              .toHaveBeenCalledWith(this.msg.cmds, this.scope, this.game);
          });
        });

        when('replay fails', function() {
          this.commandsService.replayBatch.rejectWith = 'reason';
        }, function() {
          it('should not change game', function() {
            this.thenExpectError(this.ret, function() {
              expect(this.game.undo).toEqual([]);
              expect(this.game.commands).toEqual([]);
              expect(this.scope.saveGame)
                .not.toHaveBeenCalled();
            });
          });
        });

        it('should update game', function() {
          this.thenExpect(this.ret, function() {
            expect(this.game.undo).toEqual([]);
            expect(this.game.commands).toEqual([ 'batch' ]);
            // expect(this.scope.gameEvent)
            //   .toHaveBeenCalledWith('gameLoaded');
            expect(this.scope.saveGame)
              .toHaveBeenCalledWith(this.game);
          });
        }); 

        when('<msg.end>', function() {
          this.msg.end = true;
        }, function() {
          it('should emit "gameLoaded" event', function() {
            this.thenExpect(this.ret, function() {
              expect(this.scope.gameEvent)
                .toHaveBeenCalledWith('gameLoaded');
            });
          });
        });
      });
      
      when('chat message', function() {
        this.ret = this.handlers.chat(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { chat: 'chat' };
        });

        it('should update game', function() {
          expect(this.game.chat).toEqual([ 'chat' ]);
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('chat');
          expect(this.scope.saveGame)
            .toHaveBeenCalledWith(this.game);
        }); 
     });
      
      when('setCmds message', function() {
        this.ret = this.handlers.setCmds(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { cmds: 'cmds' };
        });

        using([
          [ 'where' ],
          [ 'chat'  ],
          [ 'commands'  ],
          [ 'undo'  ],
        ], function(e, d) {
          when(d, function() {
            this.msg.where = e.where;
          }, function() {
            it('should update game', function() {
              expect(this.game[e.where]).toEqual('cmds');
              expect(this.scope.saveGame)
                .toHaveBeenCalledWith(this.game);
            });
          });
        });
     });
      
      when('players message', function() {
        this.ret = this.handlers.players(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { players: 'players' };
        });

        it('should update game', function() {
          expect(this.game.players).toEqual('players');
          expect(this.scope.saveGame)
            .toHaveBeenCalledWith(this.game);
        }); 
     });
      
      when('close', function() {
        this.handlers.close();
      }, function() {
        it('should cleanup connection', function() {
          expect(this.gameConnectionService.active(this.game))
            .toBeFalsy();
        });

        it('should emit "close" event', function() {
          expect(this.event_listener)
            .toHaveBeenCalledWith('close');
        });
      });
    });
  });
});
