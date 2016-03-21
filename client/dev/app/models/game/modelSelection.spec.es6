describe('gameModelSelection model', function() {
  beforeEach(inject([
    'gameModelSelection',
    function(gameModelSelectionModel) {
      this.gameModelSelectionModel = gameModelSelectionModel;

      this.gameModelsModel = spyOnService('gameModels');
      this.modelModel = spyOnService('model');
      spyOn(this.gameModelSelectionModel, 'checkModeP');

      this.state = jasmine.createSpyObj('state', [
        'queueEventP', 'queueChangeEventP'
      ]);
      this.state.game = { models: 'models' };
      this.state.modes = 'modes';
    }
  ]));

  example(function(e) {
    context('set('+e.where+', <stamps>, <state>)', function() {
      return this.gameModelSelectionModel
        .set(e.where, this.after, this.state, this.selection);
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

      it('should emit changeModel event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.after1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.after2');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.before1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.before2');
      });

      if(e.where === 'local') {
        testChangeLocalSelection();
      }
    });

    context('removeFrom('+e.where+', <stamps>, <state>)', function() {
      return this.gameModelSelectionModel
        .removeFrom(e.where, this.remove,
                    this.state, this.selection);
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

      it('should emit changeModel event', function() {
        // also emit stamp1 to update single selection styles
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp2');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp3');
      });

      if(e.where === 'local') {
        testChangeLocalSelection();
      }
    });

    context('addTo('+e.where+', <stamps>, <state>)', function() {
      return this.gameModelSelectionModel
        .addTo(e.where, this.add,
               this.state, this.selection);
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

      it('should emit changeModel event', function() {
        // also emit stamp1 to update single selection styles
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp2');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp3');
      });

      if(e.where === 'local') {
        testChangeLocalSelection();
      }
    });

    context('clear('+e.where+', <stamps>, <state>)', function() {
      return this.gameModelSelectionModel
        .clear(e.where, this.state, this.selection);
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

      it('should emit changeModel event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp2');
      });

      if(e.where === 'local') {
        it('should emite changeLocalModelSelection', function() {
          expect(this.state.queueChangeEventP)
            .toHaveBeenCalledWith('Game.model.selection.local.change');
        });
      }
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

  context('checkMode(<state>)', function() {
    return this.gameModelSelectionModel
      .checkModeP(this.state, this.selection);
  }, function() {
    beforeEach(function() {
      this.gameModelSelectionModel.checkModeP.and.callThrough();
      this.state = { modes: 'modes',
                     game: { models: 'models' },
                     queueEventP: jasmine.createSpy('queueEventP')
                   };
      this.selection = { local: [] };
    });

    context('when <selection> is empty', function() {
      this.selection.local = [];
      this.expectContextError();
    }, function() {
      it('should reject check', function() {
        expect(this.contextError).toEqual([
          'No model selection'
        ]);
      });
    });

    context('when <selection> is multiple', function() {
      this.selection.local = [ 'stamp1', 'stamp2' ];
    }, function() {
      it('should switch to Models mode', function() {
        expect(this.state.queueEventP)
          .toHaveBeenCalledWith('Modes.switchTo','Models');
      });
    });

    context('when <selection> is single', function() {
      this.selection.local = [ 'stamp' ];
    }, function() {
      it('should switch to mode for model', function() {
        expect(this.state.queueEventP)
          .toHaveBeenCalledWith('Modes.switchTo',
                                'gameModels.modeForStampP.returnValue');
      });
    });
  });

  function testChangeLocalSelection() {
    it('should emit changeLocalModelSelection', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.selection.local.change');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.selection.local.change');
    });
  }
});
