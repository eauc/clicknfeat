'use strict';

describe('delete model', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameService = spyOnService('game');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.gameModelSelectionService.get._retVal = 'stamps';
        
        this.scope = {
          game: { model_selection: 'selection' }
        };
      }
    ]));

    when('user delete model', function() {
      this.ret = this.modelsModeService.actions
        .deleteSelection(this.scope);
    }, function() {
      it('should execute deleteModelCommand', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('deleteModel',
                                'stamps',
                                this.scope, this.scope.game);
        expect(this.ret).toBe('game.executeCommand.returnValue');
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

        this.scope = {
          factions: 'factions',
          gameEvent: jasmine.createSpy('gameEvent')
        };
        this.game = { models: 'models',
                      model_selection: 'selection' };
      }
    ]));

    when('execute(<stamps>, <scope>, <game>)', function() {
      this.ret = this.deleteModelCommandService
        .execute(this.stamps, this.scope, this.game);
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
        this.thenExpect(this.ret, function() {
          expect(this.gameModelsService.removeStamps)
            .toHaveBeenCalledWith(this.stamps, 'models');
          expect(this.game.models)
            .toBe('gameModels.removeStamps.returnValue');
        });
      });

      it('should remove <ctxt.models> from modelSelection', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelSelectionService.removeFrom)
            .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                                  this.scope, 'selection');
          expect(this.gameModelSelectionService.removeFrom)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                  this.scope, 'gameModelSelection.removeFrom.returnValue');
        });
      });

      it('should emit createModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('createModel');
        });
      });

      it('should resolve context', function() {
        this.thenExpect(this.ret, function(ctxt) {
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
              desc: '',
            });
        });
      });
    });

    when('replay(<ctxt>, <scope>, <game>)', function() {
      this.ret = this.deleteModelCommandService
        .replay(this.ctxt, this.scope, this.game);
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
          desc: 'type',
        };
      });

      it('should remove <ctxt.models> from <game> models', function() {
        expect(this.gameModelsService.removeStamps)
          .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'models');
        expect(this.game.models)
          .toBe('gameModels.removeStamps.returnValue');
      });

      it('should remove <ctxt.models> from modelSelection', function() {
        expect(this.gameModelSelectionService.removeFrom)
          .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                                this.scope, 'selection');
        expect(this.gameModelSelectionService.removeFrom)
          .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                this.scope, 'gameModelSelection.removeFrom.returnValue');
      });

      it('should emit createModel event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createModel');
      });
    });

    when('undo(<ctxt>, <scope>, <game>)', function() {
      this.ret = this.deleteModelCommandService
        .undo(this.ctxt, this.scope, this.game);
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
          desc: 'type',
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
        this.thenExpect(this.ret, function() {
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
          
          expect(this.game.models)
            .toBe('gameModels.add.returnValue');
        });
      });

      it('should set remote modelSelection to new models', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelSelectionService.set)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                  this.scope, 'selection');
        });
      });

      it('should emit createModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('createModel');
        });
      });
    });
  });
});
