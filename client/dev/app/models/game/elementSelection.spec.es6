describe('gameElementSelection model', function() {
  beforeEach(inject([
    'gameElementSelection',
    function(gameElementSelectionModel) {
      this.gameElementSelectionModel = gameElementSelectionModel('type');
    }
  ]));

  example(function(e) {
    context('set('+e.where+', <stamps>, <state>)', function() {
      return this.gameElementSelectionModel
        .set(e.where, this.after, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: [ 'before1', 'before2' ],
                           remote: [ 'before1', 'before2' ]
                         };
        this.after = [ 'after1', 'after2' ];
      });

      it('should set <where> selection', function() {
        expect(this.gameElementSelectionModel.in(e.where, 'after1', this.context))
          .toBeTruthy();
        expect(this.gameElementSelectionModel.in(e.where, 'after2', this.context))
          .toBeTruthy();
        expect(this.gameElementSelectionModel.in(e.where, 'before1', this.context))
          .toBeFalsy();
        expect(this.gameElementSelectionModel.in(e.where, 'before2', this.context))
          .toBeFalsy();
      });
    });

    context('removeFrom('+e.where+', <stamps>, <state>)', function() {
      return this.gameElementSelectionModel
        .removeFrom(e.where, this.remove, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: [ 'stamp1', 'stamp2' ],
                           remote: [ 'stamp1', 'stamp2' ]
                         };
        this.remove = ['stamp2', 'stamp3'];
      });

      it('should remove stamps from <where> selection', function() {
        expect(this.gameElementSelectionModel.in(e.where, 'stamp1', this.context))
          .toBeTruthy();
        expect(this.gameElementSelectionModel.in(e.where, 'stamp2', this.context))
          .toBeFalsy();
        expect(this.gameElementSelectionModel.in(e.where, 'stamp3', this.context))
          .toBeFalsy();
      });
    });

    context('addTo('+e.where+', <stamps>, <state>)', function() {
      return this.gameElementSelectionModel
        .addTo(e.where, this.add, this.selection);
    }, function() {
      beforeEach(function() {
        this.add = ['stamp2', 'stamp3'];
        this.selection = { local: [ 'stamp1' ],
                           remote: [ 'stamp1' ]
                         };
      });

      it('should add stamps to <where> selection', function() {
        expect(this.gameElementSelectionModel.in(e.where, 'stamp2', this.context))
          .toBeTruthy();
        expect(this.gameElementSelectionModel.in(e.where, 'stamp3', this.context))
          .toBeTruthy();
      });
    });

    context('clear('+e.where+', <stamps>, <state>)', function() {
      return this.gameElementSelectionModel
        .clear(e.where, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: ['stamp1', 'stamp2'],
                           remote: ['stamp1', 'stamp2']
                         };
      });

      it('should clear <where> selection', function() {
        expect(this.gameElementSelectionModel.in(e.where, 'stamp1', this.context))
          .toBeFalsy();
        expect(this.gameElementSelectionModel.in(e.where, 'stamp2', this.context))
          .toBeFalsy();
      });
    });
  }, [
    [ 'where'  ],
    [ 'local'  ],
    [ 'remote' ],
  ]);

  context('checkModeP(<state>)', function() {
    return this.gameElementSelectionModel
      .checkMode(this.selection);
  }, function() {
    beforeEach(function() {
      this.selection = { local: [ 'stamp' ] };
    });

    context('when <selection> is empty', function() {
      this.selection.local = [];
    }, function() {
      it('should return null', function() {
        expect(this.context).toBe(null);
      });
    });
  });
});
