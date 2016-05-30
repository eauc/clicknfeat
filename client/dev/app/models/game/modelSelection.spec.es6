describe('gameModelSelection model', function() {
  beforeEach(inject([
    'gameModelSelection',
    function(gameModelSelectionModel) {
      this.gameModelSelectionModel = gameModelSelectionModel;

      this.gameModelsModel = spyOnService('gameModels');
    }
  ]));

  example(function(e) {
    describe('inSingle(<where>, <stamp>)', function() {
      beforeEach(function() {
        this.selection = { local: [], remote: [] };
      });

      it('should check whether <stamp> is alone in selection', function() {
        this.selection = this.gameModelSelectionModel.set(e.where, ['stamp'],
                                                          this.state, this.selection);
        expect(this.gameModelSelectionModel.inSingle(e.where, 'other', this.selection))
          .toBeFalsy();
        expect(this.gameModelSelectionModel.inSingle(e.where, 'stamp', this.selection))
          .toBeTruthy();

        this.selection = this.gameModelSelectionModel.set(e.where, ['stamp', 'other'],
                                                          this.state, this.selection);
        expect(this.gameModelSelectionModel.inSingle(e.where, 'stamp', this.selection))
          .toBeFalsy();
      });
    });
  }, [
    [ 'where'  ],
    [ 'local'  ],
    [ 'remote' ],
  ]);

  context('checkMode(<models>)', function() {
    return this.gameModelSelectionModel
      .checkMode(this.models, this.selection);
  }, function() {
    beforeEach(function() {
      // this.gameModelSelectionModel.checkMode.and.callThrough();
      this.models = 'models';
      this.selection = { local: [] };
    });

    context('when <selection> is empty', function() {
      this.selection.local = [];
    }, function() {
      it('should return null', function() {
        expect(this.context).toBe(null);
      });
    });

    context('when <selection> is multiple', function() {
      this.selection.local = [ 'stamp1', 'stamp2' ];
    }, function() {
      it('should return Models', function() {
        expect(this.context)
          .toBe('Models');
      });
    });

    context('when <selection> is single', function() {
      this.selection.local = [ 'stamp' ];
    }, function() {
      it('should switch to mode for model', function() {
        expect(this.gameModelsModel.modeForStamp)
          .toHaveBeenCalledWith('stamp', 'models');
        expect(this.context)
          .toBe('gameModels.modeForStamp.returnValue');
      });
    });
  });
});
