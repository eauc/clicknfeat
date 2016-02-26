describe('deleteElementCommand model', function() {
  beforeEach(inject([
    'deleteElementCommand',
    function(deleteElementCommandModel) {
      this.elementModel = spyOnService('terrain');
      this.elementModel.saveState
        .and.callFake((t) => {
          return R.assoc('save', true, R.prop('state', t));
        });
      this.gameElementsModel = spyOnService('gameTerrains');
      this.gameElementSelectionModel = spyOnService('gameTerrainSelection');

      this.deleteElementCommandModel =
        deleteElementCommandModel('type',
                                  this.elementModel,
                                  this.gameElementsModel,
                                  this.gameElementSelectionModel);

      this.state = {
        factions: 'factions',
        queueChangeEventP: jasmine.createSpy('queueChangeEventP')
      };
      this.game = { types: 'elements',
                    type_selection: 'selection' };
    }
  ]));

  context('executeP(<stamps>, <state>, <game>)', function() {
    return this.deleteElementCommandModel
      .executeP(this.stamps, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamp1', 'stamp2', 'stamp3'];

      this.elements = [
        { state: { info: [ 'snow', 'hill', 'hill1' ],
                   x: 240, y: 240,
                   stamp: 'stamp1'
                 }
        },
        { state: { info: [ 'snow', 'hill', 'hill2' ],
                   x: 260, y: 240,
                   stamp: 'stamp2'
                 }
        },
        { state: { info: [ 'snow', 'wall', 'wall1' ],
                   x: 280, y: 240,
                   stamp: 'stamp3'
                 }
        }
      ];

      this.gameElementsModel.findAnyStampsP
        .resolveWith(this.elements);
    });

    it('should find <stamps> in game elements', function() {
      expect(this.gameElementsModel.findAnyStampsP)
        .toHaveBeenCalledWith(this.stamps, 'elements');
    });

    context('no stamps are found', function() {
      this.gameElementsModel.findAnyStampsP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    it('should remove elements from <game> elements', function() {
      expect(this.gameElementsModel.removeStamps)
        .toHaveBeenCalledWith(this.stamps, 'elements');
      expect(this.context[1].types)
        .toBe('gameTerrains.removeStamps.returnValue');
    });

    it('should remove <ctxt.elements> from elementSelection', function() {
      expect(this.gameElementSelectionModel.removeFrom)
        .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
      expect(this.gameElementSelectionModel.removeFrom)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'gameTerrainSelection.removeFrom.returnValue');
    });

    it('should emit createElement event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.create');
    });

    it('should resolve context', function() {
      expect(this.elementModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'snow', 'hill', 'hill1' ],
                   x: 240, y: 240,
                   stamp: 'stamp1'
                 }
        });
      expect(this.elementModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'snow', 'hill', 'hill2' ],
                   x: 260, y: 240,
                   stamp: 'stamp2'
                 }
        });
      expect(this.elementModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'snow', 'wall', 'wall1' ],
                   x: 280, y: 240,
                   stamp: 'stamp3'
                 }
        });
      expect(this.context[0])
        .toEqual({
          types: [ { info: [ 'snow', 'hill', 'hill1' ],
                     x: 240, y: 240, stamp: 'stamp1',
                     save: true },
                   { info: [ 'snow', 'hill', 'hill2' ],
                     x: 260, y: 240, stamp: 'stamp2',
                     save: true },
                   { info: [ 'snow', 'wall', 'wall1' ],
                     x: 280, y: 240, stamp: 'stamp3',
                     save: true }
                 ],
          desc: ''
        });
    });
  });

  context('replayP(<ctxt>, <state>, <game>)', function() {
    return this.deleteElementCommandModel
      .replayP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        types: [
          { info: [ 'snow', 'hill', 'hill1' ],
            x: 240, y: 240,
            stamp: 'stamp1'
          },
          { info: [ 'snow', 'hill', 'hill2' ],
            x: 260, y: 240,
            stamp: 'stamp2'
          },
          { info: [ 'snow', 'wall', 'wall1' ],
            x: 280, y: 240,
            stamp: 'stamp3'
          }
        ],
        desc: 'type'
      };
    });

    it('should remove <ctxt.elements> from <game> elements', function() {
      expect(this.gameElementsModel.removeStamps)
        .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'elements');
      expect(this.context.types)
        .toBe('gameTerrains.removeStamps.returnValue');
    });

    it('should remove <ctxt.elements> from elementSelection', function() {
      expect(this.gameElementSelectionModel.removeFrom)
        .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
      expect(this.gameElementSelectionModel.removeFrom)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'gameTerrainSelection.removeFrom.returnValue');
    });

    it('should emit createElement event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.create');
    });
  });

  context('undoP(<ctxt>, <state>, <game>)', function() {
    return this.deleteElementCommandModel
      .undoP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        types: [
          { info: [ 'snow', 'hill', 'hill1' ],
            x: 240, y: 240,
            stamp: 'stamp1'
          },
          { info: [ 'snow', 'hill', 'hill2' ],
            x: 260, y: 240,
            stamp: 'stamp2'
          },
          { info: [ 'snow', 'wall', 'wall1' ],
            x: 280, y: 240,
            stamp: 'stamp3'
          }
        ],
        desc: 'type'
      };

      var stamp_index = 1;
      this.elementModel.create.and.callFake((m) => {
        return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
      });
    });

    it('should create new elements from <ctxt.elements>', function() {
      expect(this.elementModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'hill', 'hill1' ],
          x: 240, y: 240,
          stamp: 'stamp1'
        });
      expect(this.elementModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'hill', 'hill2' ],
          x: 260, y: 240,
          stamp: 'stamp2'
        });
      expect(this.elementModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'wall', 'wall1' ],
          x: 280, y: 240,
          stamp: 'stamp3'
        });
    });

    it('should add new element to <game> elements', function() {
      expect(this.gameElementsModel.add)
        .toHaveBeenCalledWith([
          { state: { info: [ 'snow', 'hill', 'hill1' ],
                     x: 240, y: 240,
                     stamp: 'stamp1'
                   }
          },
          { state: { info: [ 'snow', 'hill', 'hill2' ],
                     x: 260, y: 240,
                     stamp: 'stamp2'
                   }
          },
          { state: { info: [ 'snow', 'wall', 'wall1' ],
                     x: 280, y: 240,
                     stamp: 'stamp3'
                   }
          }
        ], 'elements');

      expect(this.context.types)
        .toBe('gameTerrains.add.returnValue');
    });

    it('should set remote elementSelection to new elements', function() {
      expect(this.gameElementSelectionModel.set)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
    });

    it('should emit createElement event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.create');
    });
  });
});
