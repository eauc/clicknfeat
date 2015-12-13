'use strict';

describe('label model', function() {
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
