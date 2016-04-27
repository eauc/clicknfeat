describe('gameModelSelection model', function() {
  beforeEach(inject([
    'gameModelSelection',
    function(gameModelSelectionModel) {
      this.gameModelSelectionModel = gameModelSelectionModel;

      this.gameModelsModel = spyOnService('gameModels');
      this.modelModel = spyOnService('model');
    }
  ]));

  example(function(e) {
    context('set('+e.where+', <stamps>, <state>)', function() {
      return this.gameModelSelectionModel
        .set(e.where, this.after, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: [ 'before1', 'before2' ],
                           remote: [ 'before1', 'before2' ]
                         };
        this.after = [ 'after1', 'after2' ];
      });

      it('should set <where> selection', function() {
        expect(this.gameModelSelectionModel.in(e.where, 'after1', this.context))
          .toBeTruthy();
        expect(this.gameModelSelectionModel.in(e.where, 'after2', this.context))
          .toBeTruthy();
        expect(this.gameModelSelectionModel.in(e.where, 'before1', this.context))
          .toBeFalsy();
        expect(this.gameModelSelectionModel.in(e.where, 'before2', this.context))
          .toBeFalsy();
      });
    });

    context('removeFrom('+e.where+', <stamps>, <state>)', function() {
      return this.gameModelSelectionModel
        .removeFrom(e.where, this.remove, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: [ 'stamp1', 'stamp2' ],
                           remote: [ 'stamp1', 'stamp2' ]
                         };
        this.remove = ['stamp2', 'stamp3'];
      });

      it('should remove stamps from <where> selection', function() {
        expect(this.gameModelSelectionModel.in(e.where, 'stamp1', this.context))
          .toBeTruthy();
        expect(this.gameModelSelectionModel.in(e.where, 'stamp2', this.context))
          .toBeFalsy();
        expect(this.gameModelSelectionModel.in(e.where, 'stamp3', this.context))
          .toBeFalsy();
      });
    });

    context('addTo('+e.where+', <stamps>, <state>)', function() {
      return this.gameModelSelectionModel
        .addTo(e.where, this.add, this.selection);
    }, function() {
      beforeEach(function() {
        this.add = ['stamp2', 'stamp3'];
        this.selection = { local: [ 'stamp1' ],
                           remote: [ 'stamp1' ]
                         };
      });

      it('should add stamps to <where> selection', function() {
        expect(this.gameModelSelectionModel.in(e.where, 'stamp2', this.context))
          .toBeTruthy();
        expect(this.gameModelSelectionModel.in(e.where, 'stamp3', this.context))
          .toBeTruthy();
      });
    });

    context('clear('+e.where+', <stamps>, <state>)', function() {
      return this.gameModelSelectionModel
        .clear(e.where, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: ['stamp1', 'stamp2'],
                           remote: ['stamp1', 'stamp2']
                         };
      });

      it('should clear <where> selection', function() {
        expect(this.gameModelSelectionModel.in(e.where, 'stamp1', this.context))
          .toBeFalsy();
        expect(this.gameModelSelectionModel.in(e.where, 'stamp2', this.context))
          .toBeFalsy();
      });
    });

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
