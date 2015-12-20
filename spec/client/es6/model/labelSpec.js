'use strict';

describe('label model', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;

        this.gameService = spyOnService('game');
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                     };
      }
    ]));

    when('user clear models labels', function() {
      this.ret = this.modelsModeService.actions
        .clearLabel(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamps'];
      });
      
      it('should clear models labels', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'clearLabel', ['stamps'],
                                this.scope, this.scope.game);
        expect(this.ret).toBe('game.executeCommand.returnValue');
      });
    });
  });

  describe('modelBaseMode service', function() {
    beforeEach(inject([
      'modelBaseMode',
      function(modelBaseModeService) {
        this.modelBaseModeService = modelBaseModeService;
        
        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       gameEvent: jasmine.createSpy('gameEvent'),
                     };
      }
    ]));

    when('user open edit label on model', function() {
      this.ret = this.modelBaseModeService.actions
        .openEditLabel(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
      });
      
      it('should emit openEditLabel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('openEditLabel', 'gameModels.findStamp.returnValue');
        });
      });
    });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
      }
    ]));

    describe('fullLabel()', function() {
      beforeEach(function() {
        this.model = {
          state: { l:  ['label1', 'label2'] }
        };
      });

      it('should return model\'s full label', function() {
        expect(this.modelService.fullLabel(this.model))
          .toEqual('label1 label2');
      });
    });

    describe('addLabel(<label>)', function() {
      beforeEach(function() {
        this.model = {
          state: { l:  ['label1', 'label2'] }
        };
      });

      using([
        [ 'label', 'result' ],
        [ 'new'  , ['label1', 'label2' ,'new'] ],
        // no duplicates
        [ 'label2'  , ['label1', 'label2'] ],
      ], function(e, d) {
        it('should add <label> to model\'s labels, '+d, function() {
          this.modelService.addLabel(e.label, this.model);
          expect(this.model.state.l)
            .toEqual(e.result);
        });
      });
    });

    describe('removeLabel(<label>)', function() {
      beforeEach(function() {
        this.model = {
          state: { l:  ['label1', 'label2'] }
        };
      });

      using([
        [ 'label', 'result' ],
        [ 'label1'  , ['label2'] ],
        [ 'unknown'  , ['label1', 'label2'] ],
      ], function(e, d) {
        it('should remove <label> from model\'s labels, '+d, function() {
          this.modelService.removeLabel(e.label, this.model);
          expect(this.model.state.l)
            .toEqual(e.result);
        });
      });
    });

    describe('clearLabel(<label>)', function() {
      beforeEach(function() {
        this.model = {
          state: { l:  ['label1', 'label2'] }
        };
      });

      it('should remove all labels from model', function() {
        this.modelService.clearLabel(this.model);
        expect(this.model.state.l)
          .toEqual([]);
      });
    });
  });
});
