describe('model model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
    }
  ]));

  describe('fullLabel()', function() {
    beforeEach(function() {
      this.model = {
        state: { l:  ['label1', 'label2'] }
      };
    });

    it('should return model\'s full label', function() {
      expect(this.modelModel.fullLabel(this.model))
        .toEqual('label1 label2');
    });
  });

  describe('addLabel(<label>)', function() {
    beforeEach(function() {
      this.model = {
        state: { l:  ['label1', 'label2'] }
      };
    });

    example(function(e, d) {
      it('should add <label> to model\'s labels, '+d, function() {
        this.ret = this.modelModel.addLabel(e.label, this.model);
        expect(this.ret.state.l)
          .toEqual(e.result);
      });
    }, [
      [ 'label'  , 'result'  ],
      [ 'new'    , ['label1' , 'label2' ,'new'] ],
      // no duplicates
      [ 'label2' , ['label1' , 'label2']        ],
    ]);
  });

  describe('removeLabel(<label>)', function() {
    beforeEach(function() {
      this.model = {
        state: { l:  ['label1', 'label2'] }
      };
    });

    example(function(e, d) {
      it('should remove <label> from model\'s labels, '+d, function() {
        this.ret = this.modelModel.removeLabel(e.label, this.model);
        expect(this.ret.state.l)
          .toEqual(e.result);
      });
    }, [
      [ 'label'   , 'result'   ],
      [ 'label1'  , ['label2'] ],
      [ 'unknown' , ['label1'  , 'label2'] ],
    ]);
  });

  describe('clearLabel(<label>)', function() {
    beforeEach(function() {
      this.model = {
        state: { l:  ['label1', 'label2'] }
      };
    });

    it('should remove all labels from model', function() {
      this.ret = this.modelModel.clearLabel(this.model);
      expect(this.ret.state.l)
        .toEqual([]);
    });
  });
});
