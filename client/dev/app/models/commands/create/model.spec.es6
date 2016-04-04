xdescribe('createModelCommand model', function() {
  beforeEach(inject([
    'createModelCommand',
    function(createModelCommandModel) {
      this.createModelCommandModel = createModelCommandModel;

      this.modelModel = spyOnService('model');
      this.gameModelsModel = spyOnService('gameModels');
      this.gameModelSelectionModel = spyOnService('gameModelSelection');

      this.state = {
        factions: 'factions',
        queueChangeEventP: jasmine.createSpy('queueChangeEventP')
      };
      this.game = { models: 'models',
                    model_selection: 'selection'
                  };

      var stamp_index = 1;
      this.modelModel.createP.resolveWith((_f_, m) => {
        return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
      });
    }
  ]));

  context('executeP(<create>, <flip>, <state>, <game>)', function() {
    return this.createModelCommandModel
      .executeP(this.create, this.flip, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.create = {
        base: { x: 240, y: 240, r: 180 },
        models: [ {
          info: ['legion','models','locks','absylonia1'],
          x: 0, y: 0, r: 45,
          l: [ 'toto' ]
        }, {
          info: ['legion','models','units','archers','entries','unit','grunt'],
          x: 20, y: 0, r: 0,
          l: [ 'titi' ]
        }, {
          info: ['legion','models','units','archers','entries','unit','grunt'],
          x: 40, y: 0, r: -45,
          l: [ 'tata' ]
        } ]
      };
      this.flip = false;
    });

    it('should create new models from <create>', function() {
      expect(this.modelModel.createP)
        .toHaveBeenCalledWith('factions', {
          info: [ 'legion', 'models', 'locks', 'absylonia1' ],
          x: 240, y: 240, r: 225,
          l: [ 'toto' ]
        });
      expect(this.modelModel.createP)
        .toHaveBeenCalledWith('factions', {
          info: ['legion','models','units','archers','entries','unit','grunt'],
          x: 260, y: 240, r: 180,
          l: [ 'titi' ]
        });
      expect(this.modelModel.createP)
        .toHaveBeenCalledWith('factions', {
          info: ['legion','models','units','archers','entries','unit','grunt'],
          x: 280, y: 240, r: 135,
          l: [ 'tata' ]
        });
    });

    context('when map is flipped', function() {
      this.flip = true;
    }, function() {
      it('should flip new models positions', function() {
        expect(this.modelModel.createP)
          .toHaveBeenCalledWith('factions', {
            info: [ 'legion', 'models', 'locks', 'absylonia1' ],
            x: 240, y: 240, r: 405,
            l: [ 'toto' ]
          });
        expect(this.modelModel.createP)
          .toHaveBeenCalledWith('factions', {
            info: ['legion','models','units','archers','entries','unit','grunt'],
            x: 220, y: 240, r: 360,
            l: [ 'titi' ]
          });
        expect(this.modelModel.createP)
          .toHaveBeenCalledWith('factions', {
            info: ['legion','models','units','archers','entries','unit','grunt'],
            x: 200, y: 240, r: 315,
            l: [ 'tata' ]
          });
      });
    });

    context('create models fails', function() {
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
                     x: 240, y: 240, r: 225,
                     l: [ 'toto' ],
                     stamp: 'stamp1'
                   }
          },
          { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                     x: 260, y: 240, r: 180,
                     l: [ 'titi' ],
                     stamp: 'stamp2'
                   }
          },
          { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                     x: 280, y: 240, r: 135,
                     l: [ 'tata' ],
                     stamp: 'stamp3'
                   }
          }
        ], 'models');
      expect(this.context[1].models)
        .toBe('gameModels.add.returnValue');
    });

    it('should set local modelSelection to new model', function() {
      expect(this.gameModelSelectionModel.set)
        .toHaveBeenCalledWith('local', ['stamp1', 'stamp2', 'stamp3'],
                              this.state, 'selection');
    });

    it('should emit createModel event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.create');
    });

    it('should return context', function() {
      expect(this.modelModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                   x: 240, y: 240, r: 225,
                   l: [ 'toto' ],
                   stamp: 'stamp1'
                 }
        });
      expect(this.modelModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                   x: 260, y: 240, r: 180,
                   l: [ 'titi' ],
                   stamp: 'stamp2'
                 }
        });
      expect(this.modelModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                   x: 280, y: 240, r: 135,
                   l: [ 'tata' ],
                   stamp: 'stamp3'
                 }
        });

      expect(this.context[0])
        .toEqual({
          models: [ 'model.saveState.returnValue',
                    'model.saveState.returnValue',
                    'model.saveState.returnValue' ],
          desc: 'legion.models.locks.absylonia1'
        });
    });
  });

  context('replayP(<ctxt>, <state>, <game>)', function() {
    return this.createModelCommandModel
      .replayP(this.ctxt, this.state, this.game);
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

    context('create models fails', function() {
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

    it('should set remote modelSelection to new model', function() {
      expect(this.gameModelSelectionModel.set)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
    });

    it('should emit createModel event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.model.create');
    });
  });

  context('undoP(<ctxt>, <state>, <game>)', function() {
    return this.createModelCommandModel
      .undoP(this.ctxt, this.state, this.game);
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

    it('should remove <ctxt.model> from <game> models', function() {
      expect(this.gameModelsModel.removeStamps)
        .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'models');
      expect(this.context.models)
        .toBe('gameModels.removeStamps.returnValue');
    });

    it('should remove <ctxt.model> from modelSelection', function() {
      expect(this.gameModelSelectionModel.removeFrom)
        .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
      expect(this.gameModelSelectionModel.removeFrom)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'gameModelSelection.removeFrom.returnValue');
    });

    it('should emit deleteModel events', function() {
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
});
