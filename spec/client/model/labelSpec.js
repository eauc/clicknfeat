'use strict';

describe('label model', function() {
  describe('clickGameSelectionDetailCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.gameService = spyOnService('game');

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          this.scope.type = 'model';
          this.scope.selection = { state: { stamp: 'stamp' } };
          this.scope.game = 'game';

          $controller('clickGameSelectionDetailCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    when('user adds a label to model selection', function() {
      this.scope.doAddLabel();
    }, function() {
      when('new label is not empty', function() {
        this.scope.label = { new: '    yoo ' };
      }, function() {
        it('should execute onModels/addLabel command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'addLabel', 'yoo', ['stamp'],
                                  this.scope, this.scope.game);
        });
      });

      when('new label is empty', function() {
        this.scope.label = { new: '     ' };
      }, function() {
        it('should do nothing', function() {
          expect(this.gameService.executeCommand)
            .not.toHaveBeenCalled();
        });
      });
    });

    when('user removes a label to model selection', function() {
      this.scope.doRemoveLabel('label');
    }, function() {
      it('should execute onModels/removeLabel command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'removeLabel', 'label', ['stamp'],
                                this.scope, this.scope.game);
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
  });
});
