'use strict';

describe('label template', function() {
  describe('template service', function() {
    beforeEach(inject([
      'template',
      function(templateService) {
        this.templateService = templateService;
      }
    ]));

    describe('fullLabel()', function() {
      beforeEach(function() {
        this.template = {
          state: { l:  ['label1', 'label2'] }
        };
      });

      it('should return template\'s full label', function() {
        expect(this.templateService.fullLabel(this.template))
          .toEqual('label1 label2');
      });
    });

    describe('addLabel(<label>)', function() {
      beforeEach(function() {
        this.template = {
          state: { l:  ['label1', 'label2'] }
        };
      });

      using([
        [ 'label', 'result' ],
        [ 'new'  , ['label1', 'label2' ,'new'] ],
        // no duplicates
        [ 'label2'  , ['label1', 'label2'] ],
      ], function(e, d) {
        it('should add <label> to template\'s labels, '+d, function() {
          this.templateService.addLabel(e.label, this.template);
          expect(this.template.state.l)
            .toEqual(e.result);
        });
      });
    });

    describe('removeLabel(<label>)', function() {
      beforeEach(function() {
        this.template = {
          state: { l:  ['label1', 'label2'] }
        };
      });

      using([
        [ 'label', 'result' ],
        [ 'label1'  , ['label2'] ],
        [ 'unknown'  , ['label1', 'label2'] ],
      ], function(e, d) {
        it('should remove <label> from template\'s labels, '+d, function() {
          this.templateService.removeLabel(e.label, this.template);
          expect(this.template.state.l)
            .toEqual(e.result);
        });
      });
    });
  });
});
