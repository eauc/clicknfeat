describe('gameElementSelection model', function() {
  beforeEach(inject([
    'gameElementSelection',
    function(gameElementSelectionModel) {
      this.gameElementSelectionModel = gameElementSelectionModel('type');

      spyOn(this.gameElementSelectionModel, 'checkModeP');

      this.state = jasmine.createSpyObj('state', [
        'queueChangeEventP', 'queueEventP'
      ]);
      this.state.game = { elements: 'elements' };
      this.state.modes = 'modes';
    }
  ]));

  example(function(e) {
    context('set('+e.where+', <stamps>, <state>)', function() {
      return this.gameElementSelectionModel
        .set(e.where, this.after, this.state, this.selection);
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

      it('should emit changeElement event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.after1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.after2');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.before1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.before2');
      });

      if(e.where === 'local') {
        testChangeLocalSelection();
      }
    });

    context('removeFrom('+e.where+', <stamps>, <state>)', function() {
      return this.gameElementSelectionModel
        .removeFrom(e.where, this.remove, this.state, this.selection);
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

      it('should emit changeElement event', function() {
        // also emit stamp1 to update single selection styles
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.stamp2');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.stamp3');
      });

      if(e.where === 'local') {
        testChangeLocalSelection();
      }
    });

    context('addTo('+e.where+', <stamps>, <state>)', function() {
      return this.gameElementSelectionModel
        .addTo(e.where, this.add, this.state, this.selection);
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

      it('should emit changeElement event', function() {
        // also emit stamp1 to update single selection styles
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.stamp2');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.stamp3');
      });

      if(e.where === 'local') {
        testChangeLocalSelection();
      }
    });

    context('clear('+e.where+', <stamps>, <state>)', function() {
      return this.gameElementSelectionModel
        .clear(e.where, this.state, this.selection);
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

      it('should emit changeElement event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.change.stamp2');
      });
    });
  }, [
    [ 'where'  ],
    [ 'local'  ],
    [ 'remote' ],
  ]);

  context('checkModeP(<state>)', function() {
    return this.gameElementSelectionModel
      .checkModeP(this.state, this.selection);
  }, function() {
    beforeEach(function() {
      this.gameElementSelectionModel.checkModeP
        .and.callThrough();
      this.state = { modes: 'modes',
                     game: { elements: 'elements' },
                     queueEventP: jasmine.createSpy('queueEventP')
                   };
      this.selection = { local: [ 'stamp' ] };
    });

    context('when <selection> is empty', function() {
      this.selection.local = [];
      this.expectContextError();
    }, function() {
      it('should reject check', function() {
        expect(this.contextError).toEqual([
          'No type selection'
        ]);
      });
    });

    it('should switch to mode for element', function() {
      expect(this.state.queueEventP)
        .toHaveBeenCalledWith('Modes.switchTo','Type');
    });
  });

  function testChangeLocalSelection() {
    it('should emit change event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.selection.local.change');
    });
  }
});
