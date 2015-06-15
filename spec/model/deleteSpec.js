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
      this.modelsModeService.actions.deleteSelection(this.scope);
    }, function() {
      it('should execute deleteModelCommand', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('deleteModel',
                                'stamps',
                                this.scope, this.scope.game);
      });
    });
  });

  describe('deleteModelCommand service', function() {
    beforeEach(inject([
      'deleteModelCommand',
      function(deleteModelCommandService) {
        this.deleteModelCommandService = deleteModelCommandService;
        this.modelService = spyOnService('model');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.scope = {
          factions: 'factions',
          gameEvent: jasmine.createSpy('gameEvent')
        };
        this.game = { models: 'models',
                      model_selection: 'selection' };

        var stamp_index = 1;
        this.modelService.create.and.callFake(function(f,m) {
          return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
        });
      }
    ]));

    describe('execute(<stamps>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.stamps = ['stamp1','stamp2','stamp3'];

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
        this.gameModelsService.findStamp.and.callFake(R.bind(function(s) {
          return R.find(R.pathEq(['state','stamp'], s), this.models);
        }, this));
        
        this.ret = this.deleteModelCommandService
          .execute(this.stamps, this.scope, this.game);
      });

      it('should remove models from <game> models', function() {
        expect(this.gameModelsService.removeStamps)
          .toHaveBeenCalledWith(this.stamps, 'models');
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

      it('should return context', function() {
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
        expect(this.ret)
          .toEqual({
            models: [ 'model.saveState.returnValue',
                      'model.saveState.returnValue',
                      'model.saveState.returnValue' ],
            desc: '',
          });
      });
    });

    describe('replay(<ctxt>, <scope>, <game>)', function() {
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

        this.deleteModelCommandService.replay(this.ctxt, this.scope, this.game);
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

    describe('undo(<ctxt>, <scope>, <game>)', function() {
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
        
        this.deleteModelCommandService.undo(this.ctxt, this.scope, this.game);
      });

      it('should create new models from <ctxt.models>', function() {
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

      it('should add new model to <game> models', function() {
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

      it('should set remote modelSelection to new models', function() {
        expect(this.gameModelSelectionService.set)
          .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                this.scope, 'selection');
      });

      it('should emit createModel event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createModel');
      });
    });
  });
});
