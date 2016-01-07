describe('delete model', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameService = spyOnService('game');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.gameModelSelectionService.get._retVal = 'stamps';
        
        this.state = {
          game: { model_selection: 'selection' },
          event: jasmine.createSpy('event')
        };
      }
    ]));

    when('user delete model', function() {
      this.ret = this.modelsModeService.actions
        .deleteSelection(this.state);
    }, function() {
      it('should execute deleteModelCommand', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.state.event)
          .toHaveBeenCalledWith('Game.command.execute',
                                'deleteModel', ['stamps']);
      });
    });
  });

  describe('deleteModelCommand service', function() {
    beforeEach(inject([
      'deleteModelCommand',
      function(deleteModelCommandService) {
        this.deleteModelCommandService = deleteModelCommandService;
        this.modelService = spyOnService('model');
        mockReturnPromise(this.modelService.create);
        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findAnyStamps);
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.state = {
          factions: 'factions',
          changeEvent: jasmine.createSpy('changeEvent')
        };
        this.game = { models: 'models',
                      model_selection: 'selection' };
      }
    ]));

    when('execute(<stamps>, <state>, <game>)', function() {
      this.ret = this.deleteModelCommandService
        .execute(this.stamps, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2', 'stamp3'];

        this.models = [
          { state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                     x: 240, y: 240,
                     stamp: 'stamp1'
                   }
          },
          { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                     x: 260, y: 240,
                     stamp: 'stamp2'
                   }
          },
          { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                     x: 280, y: 240,
                     stamp: 'stamp3'
                   }
          }
        ];

        this.gameModelsService.findAnyStamps.resolveWith = this.models;
      });

      it('should find <stamps> in game models', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelsService.findAnyStamps)
            .toHaveBeenCalledWith(this.stamps, 'models');
        });
      });

      when('no stamps are found', function() {
        this.gameModelsService.findAnyStamps.rejectWith = 'reason';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });
      
      it('should remove models from <game> models', function() {
        this.thenExpect(this.ret, function([ctxt, game]) {
          expect(this.gameModelsService.removeStamps)
            .toHaveBeenCalledWith(this.stamps, 'models');
          expect(game.models)
            .toBe('gameModels.removeStamps.returnValue');
        });
      });

      it('should remove <ctxt.models> from modelSelection', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelSelectionService.removeFrom)
            .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                                  this.state, 'selection');
          expect(this.gameModelSelectionService.removeFrom)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                  this.state, 'gameModelSelection.removeFrom.returnValue');
        });
      });

      it('should emit deleteModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.delete.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.delete.stamp2');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.delete.stamp3');
        });
      });

      it('should emit createModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.create');
        });
      });

      it('should resolve context', function() {
        this.thenExpect(this.ret, function([ctxt]) {
          expect(this.modelService.saveState)
            .toHaveBeenCalledWith({
              state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                       x: 240, y: 240,
                       stamp: 'stamp1'
                     }
            });
          expect(this.modelService.saveState)
            .toHaveBeenCalledWith({
              state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                       x: 260, y: 240,
                       stamp: 'stamp2'
                     }
            });
          expect(this.modelService.saveState)
            .toHaveBeenCalledWith({
              state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                       x: 280, y: 240,
                       stamp: 'stamp3'
                     }
            });
          expect(ctxt)
            .toEqual({
              models: [ 'model.saveState.returnValue',
                        'model.saveState.returnValue',
                        'model.saveState.returnValue' ],
              desc: ''
            });
        });
      });
    });

    when('replay(<ctxt>, <state>, <game>)', function() {
      this.ret = this.deleteModelCommandService
        .replay(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          models: [
            { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
              x: 240, y: 240,
              stamp: 'stamp1'
            },
            { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 260, y: 240,
              stamp: 'stamp2'
            },
            { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 280, y: 240,
              stamp: 'stamp3'
            }
          ],
          desc: 'type'
        };
      });

      it('should remove <ctxt.models> from <game> models', function() {
        expect(this.gameModelsService.removeStamps)
          .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'models');
        expect(this.ret.models)
          .toBe('gameModels.removeStamps.returnValue');
      });

      it('should remove <ctxt.models> from modelSelection', function() {
        expect(this.gameModelSelectionService.removeFrom)
          .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                                this.state, 'selection');
        expect(this.gameModelSelectionService.removeFrom)
          .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                this.state, 'gameModelSelection.removeFrom.returnValue');
      });

      it('should emit deleteModel event', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.model.delete.stamp1');
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.model.delete.stamp2');
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.model.delete.stamp3');
      });

      it('should emit createModel event', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.model.create');
      });
    });

    when('undo(<ctxt>, <state>, <game>)', function() {
      this.ret = this.deleteModelCommandService
        .undo(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          models: [
            { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
              x: 240, y: 240,
              stamp: 'stamp'
            },
            { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 260, y: 240,
              stamp: 'stamp'
            },
            { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 280, y: 240,
              stamp: 'stamp'
            }
          ],
          desc: 'type'
        };

        var stamp_index = 1;
        this.modelService.create.resolveWith = function(f,m) {
          return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
        };
      });

      it('should create new models from <ctxt.models>', function() {
        this.thenExpect(this.ret, function() {
          expect(this.modelService.create)
            .toHaveBeenCalledWith('factions', {
              info: [ 'legion', 'models', 'locks', 'absylonia1' ],
              x: 240, y: 240,
              stamp: 'stamp'
            });
          expect(this.modelService.create)
            .toHaveBeenCalledWith('factions', {
              info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 260, y: 240,
              stamp: 'stamp'
            });
          expect(this.modelService.create)
            .toHaveBeenCalledWith('factions', {
              info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 280, y: 240,
              stamp: 'stamp'
            });
        });
      });

      when('creation fails', function() {
        this.modelService.create.rejectWith = 'reason';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No valid model definition');
          });
        });
      });
      
      it('should add new model to <game> models', function() {
        this.thenExpect(this.ret, function(game) {
          expect(this.gameModelsService.add)
            .toHaveBeenCalledWith([
              { state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                         x: 240, y: 240,
                         stamp: 'stamp1'
                       }
              },
              { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                         x: 260, y: 240,
                         stamp: 'stamp2'
                       }
              },
              { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                         x: 280, y: 240,
                         stamp: 'stamp3'
                       }
              }
            ], 'models');
          
          expect(game.models)
            .toBe('gameModels.add.returnValue');
        });
      });

      it('should set remote modelSelection to new models', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelSelectionService.set)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                  this.state, 'selection');
        });
      });

      it('should emit createModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.model.create');
        });
      });
    });
  });
});
