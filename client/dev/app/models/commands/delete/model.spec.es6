describe('deleteModelCommand model', function() {
  beforeEach(inject([
    'deleteModelCommand',
    function(deleteModelCommandModel) {
      this.deleteModelCommandModel = deleteModelCommandModel;

      this.modelModel = spyOnService('model');
      this.modelModel.saveState.and.callFake((m) => {
        return R.assoc('saved', true, R.propOr({}, 'state', m));
      });
      this.gameModelsModel = spyOnService('gameModels');
      this.gameModelSelectionModel = spyOnService('gameModelSelection');

      this.state = {
        factions: 'factions',
        queueChangeEventP: jasmine.createSpy('queueChangeEventP')
      };
      this.game = { models: 'models',
                    model_selection: 'selection' };
    }
  ]));

  context('executeP(<stamps>, <state>, <game>)', function() {
    return this.deleteModelCommandModel
      .executeP(this.stamps, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamp1', 'stamp2', 'stamp3'];

      this.models = [
        { state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                   x: 240, y: 240,
                   stamp: 'stamp1'
                 }
        },
        { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                   x: 260, y: 240,
                   stamp: 'stamp2'
                 }
        },
        { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                   x: 280, y: 240,
                   stamp: 'stamp3'
                 }
        }
      ];

      this.gameModelsModel.findAnyStampsP
        .resolveWith(this.models);
    });

    it('should find <stamps> in game models', function() {
      expect(this.gameModelsModel.findAnyStampsP)
        .toHaveBeenCalledWith(this.stamps, 'models');
    });

    context('when no stamps are found', function() {
      this.gameModelsModel.findAnyStampsP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    it('should remove models from <game> models', function() {
      expect(this.gameModelsModel.removeStamps)
        .toHaveBeenCalledWith(this.stamps, 'models');
      expect(this.context[1].models)
        .toBe('gameModels.removeStamps.returnValue');
    });

    it('should remove <ctxt.models> from modelSelection', function() {
      expect(this.gameModelSelectionModel.removeFrom)
        .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
      expect(this.gameModelSelectionModel.removeFrom)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'gameModelSelection.removeFrom.returnValue');
    });

    it('should emit deleteModel event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.delete.stamp1');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.delete.stamp2');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.delete.stamp3');
    });

    it('should emit createModel event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.create');
    });

    it('should resolve context', function() {
      expect(this.modelModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                   x: 240, y: 240,
                   stamp: 'stamp1'
                 }
        });
      expect(this.modelModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                   x: 260, y: 240,
                   stamp: 'stamp2'
                 }
        });
      expect(this.modelModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                   x: 280, y: 240,
                   stamp: 'stamp3'
                 }
        });
      expect(this.context[0])
        .toEqual({
          models: [ { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                      x: 240, y: 240, stamp: 'stamp1', saved: true },
                    { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                      x: 260, y: 240, stamp: 'stamp2', saved: true },
                    { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                      x: 280, y: 240, stamp: 'stamp3', saved: true } ],
          desc: ''
        });
    });
  });

  context('replayP(<ctxt>, <state>, <game>)', function() {
    return this.deleteModelCommandModel
      .replayP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        models: [
          { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
            x: 240, y: 240,
            stamp: 'stamp1'
          },
          { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
            x: 260, y: 240,
            stamp: 'stamp2'
          },
          { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
            x: 280, y: 240,
            stamp: 'stamp3'
          }
        ],
        desc: 'type'
      };
    });

    it('should remove <ctxt.models> from <game> models', function() {
      expect(this.gameModelsModel.removeStamps)
        .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'models');
      expect(this.context.models)
        .toBe('gameModels.removeStamps.returnValue');
    });

    it('should remove <ctxt.models> from modelSelection', function() {
      expect(this.gameModelSelectionModel.removeFrom)
        .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
      expect(this.gameModelSelectionModel.removeFrom)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'gameModelSelection.removeFrom.returnValue');
    });

    it('should emit deleteModel event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.delete.stamp1');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.delete.stamp2');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.delete.stamp3');
    });

    it('should emit createModel event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.create');
    });
  });

  context('undoP(<ctxt>, <state>, <game>)', function() {
    return this.deleteModelCommandModel
      .undoP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        models: [
          { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
            x: 240, y: 240,
            stamp: 'stamp'
          },
          { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
            x: 260, y: 240,
            stamp: 'stamp'
          },
          { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
            x: 280, y: 240,
            stamp: 'stamp'
          }
        ],
        desc: 'type'
      };

      let stamp_index = 1;
      this.modelModel.createP.resolveWith((f,m) => {
        return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
      });
    });

    it('should create new models from <ctxt.models>', function() {
      expect(this.modelModel.createP)
        .toHaveBeenCalledWith('factions', {
          info: [ 'legion', 'models', 'locks', 'absylonia1' ],
          x: 240, y: 240,
          stamp: 'stamp'
        });
      expect(this.modelModel.createP)
        .toHaveBeenCalledWith('factions', {
          info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
          x: 260, y: 240,
          stamp: 'stamp'
        });
      expect(this.modelModel.createP)
        .toHaveBeenCalledWith('factions', {
          info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
          x: 280, y: 240,
          stamp: 'stamp'
        });
    });

    context('when creation fails', function() {
      this.modelModel.createP.rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'No valid model definition'
        ]);
      });
    });

    it('should add new model to <game> models', function() {
      expect(this.gameModelsModel.add)
        .toHaveBeenCalledWith([
          { state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                     x: 240, y: 240,
                     stamp: 'stamp1'
                   }
          },
          { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                     x: 260, y: 240,
                     stamp: 'stamp2'
                   }
          },
          { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                     x: 280, y: 240,
                     stamp: 'stamp3'
                   }
          }
        ], 'models');

        expect(this.context.models)
        .toBe('gameModels.add.returnValue');
    });

    it('should set remote modelSelection to new models', function() {
      expect(this.gameModelSelectionModel.set)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
    });

    it('should emit createModel event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.create');
    });
  });
});
