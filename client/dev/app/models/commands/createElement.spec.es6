describe('createElementCommand model', function() {
  beforeEach(inject([
    'createElementCommand',
    function(createElementCommandModel) {
      this.elementModel = spyOnService('terrain');
      this.gameElementsModel = spyOnService('gameTerrains');
      this.gameElementSelectionModel = spyOnService('gameTerrainSelection');

      this.createElementCommandModel =
        createElementCommandModel('type',
                                  this.elementModel,
                                  this.gameElementsModel,
                                  this.gameElementSelectionModel);

      this.state = {
        factions: 'factions',
        queueChangeEventP: jasmine.createSpy('queueChangeEventP')
      };
      this.game = { types: 'elements',
                    type_selection: 'selection' };

      let stamp_index = 1;
      this.elementModel.create.and.callFake((m) => {
        return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
      });
    }
  ]));

  context('executeP(<create>, <flip>, <state>, <game>)', function() {
    return this.createElementCommandModel
      .executeP(this.create, this.flip, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.create = {
        base: { x: 240, y: 240, r: 180 },
        types: [ {
          info: ['snow','hill','hill1'],
          x: 0, y: 0, r: 45,
          lk: true
        }, {
          info: ['snow','hill','hill2'],
          x: 20, y: 0, r: 0
        }, {
          info: ['grass','wall','wall1'],
          x: 40, y: 0, r: -45,
          lk: false
        } ]
      };
      this.flip = false;
    });

    it('should create new elements from <create>', function() {
      expect(this.elementModel.create)
        .toHaveBeenCalledWith({
          info: ['snow','hill','hill1'],
          x: 240, y: 240, r: 225,
          lk: true
        });
      expect(this.elementModel.create)
        .toHaveBeenCalledWith({
          info: ['snow','hill','hill2'],
          x: 260, y: 240, r: 180
        });
      expect(this.elementModel.create)
        .toHaveBeenCalledWith({
          info: ['grass','wall','wall1'],
          x: 280, y: 240, r: 135,
          lk: false
        });
    });

    context('when map is flipped', function() {
      this.flip = true;
    }, function() {
      it('should flip new elements positions', function() {
        expect(this.elementModel.create)
          .toHaveBeenCalledWith({
            info: ['snow','hill','hill1'],
            x: 240, y: 240, r: 405,
            lk: true
          });
        expect(this.elementModel.create)
          .toHaveBeenCalledWith({
            info: ['snow','hill','hill2'],
            x: 220, y: 240, r: 360
          });
        expect(this.elementModel.create)
          .toHaveBeenCalledWith({
            info: ['grass','wall','wall1'],
            x: 200, y: 240, r: 315,
            lk: false
          });
      });
    });

    it('should add new element to <game> elements', function() {
      const game = R.last(this.context);
      expect(this.gameElementsModel.add)
        .toHaveBeenCalledWith([
          { state: { info: ['snow','hill','hill1'],
                     x: 240, y: 240, r: 225,
                     lk: true,
                     stamp: 'stamp1'
                   }
          },
          { state: { info: ['snow','hill','hill2'],
                     x: 260, y: 240, r: 180,
                     stamp: 'stamp2'
                   }
          },
          { state: { info: ['grass','wall','wall1'],
                     x: 280, y: 240, r: 135,
                     lk: false,
                     stamp: 'stamp3'
                   }
          }
        ], 'elements');
      expect(game.types)
        .toBe('gameTerrains.add.returnValue');
    });

    it('should set local elementSelection to new element', function() {
      expect(this.gameElementSelectionModel.set)
        .toHaveBeenCalledWith('local', ['stamp1', 'stamp2', 'stamp3'],
                              this.state, 'selection');
    });

    it('should emit createElement event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.create');
    });

    it('should return context', function() {
      const [ctxt] = this.context;
      expect(this.elementModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: ['snow','hill','hill1'],
                   x: 240, y: 240, r: 225,
                   lk: true,
                   stamp: 'stamp1'
                 }
        });
      expect(this.elementModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: ['snow','hill','hill2'],
                   x: 260, y: 240, r: 180,
                   stamp: 'stamp2'
                 }
        });
      expect(this.elementModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: ['grass','wall','wall1'],
                   x: 280, y: 240, r: 135,
                   lk: false,
                   stamp: 'stamp3'
                 }
        });

      expect(ctxt)
        .toEqual({
          types: [ 'terrain.saveState.returnValue',
                   'terrain.saveState.returnValue',
                   'terrain.saveState.returnValue' ],
          desc: 'snow.hill.hill1'
        });
    });
  });

  context('replayP(<ctxt>, <state>, <game>)', function() {
    return this.createElementCommandModel
      .replayP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        types: [
          { info: [ 'snow', 'hill', 'hill1' ],
            x: 240, y: 240,
            lk: true,
            stamp: 'stamp'
          },
          { info: [ 'snow', 'hill', 'hill2' ],
            x: 260, y: 240,
            stamp: 'stamp'
          },
          { info: [ 'snow', 'wall', 'wall1' ],
            x: 280, y: 240,
            lk: false,
            stamp: 'stamp'
          }
        ],
        desc: 'type'
      };
    });

    it('should create new elements from <ctxt.elements>', function() {
      expect(this.elementModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'hill', 'hill1' ],
            x: 240, y: 240,
          lk: true,
          stamp: 'stamp'
        });
      expect(this.elementModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'hill', 'hill2' ],
          x: 260, y: 240,
          stamp: 'stamp'
        });
      expect(this.elementModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'wall', 'wall1' ],
          x: 280, y: 240,
          lk: false,
          stamp: 'stamp'
        });
    });

    it('should add new element to <game> elements', function() {
      expect(this.gameElementsModel.add)
        .toHaveBeenCalledWith([
          { state: { info: [ 'snow', 'hill', 'hill1' ],
                     x: 240, y: 240,
                     lk: true,
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
                     lk: false,
                     stamp: 'stamp3'
                   }
          }
        ], 'elements');
      expect(this.context.types)
        .toBe('gameTerrains.add.returnValue');
    });

    it('should set remote elementSelection to new element', function() {
      expect(this.gameElementSelectionModel.set)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
    });

    it('should emit createElement event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.type.create');
    });
  });

  context('undoP(<ctxt>, <state>, <game>)', function() {
    return this.createElementCommandModel
      .undoP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        types: [
          { info: [ 'snow', 'hill', 'hill1' ],
            x: 240, y: 240,
            lk: true,
            stamp: 'stamp1'
          },
          { info: [ 'snow', 'hill', 'hill2' ],
            x: 260, y: 240,
            stamp: 'stamp2'
          },
          { info: [ 'snow', 'wall', 'wall1' ],
            x: 280, y: 240,
            lk: false,
            stamp: 'stamp3'
          }
        ],
        desc: 'type'
      };
    });

    it('should remove <ctxt.element> from <game> elements', function() {
      expect(this.gameElementsModel.removeStamps)
        .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'elements');
      expect(this.context.types)
        .toBe('gameTerrains.removeStamps.returnValue');
    });

    it('should remove <ctxt.element> from elementSelection', function() {
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
});
