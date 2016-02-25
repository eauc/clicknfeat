describe('createTerrainCommand model', function() {
  beforeEach(inject([
    'createTerrainCommand',
    function(createTerrainCommandModel) {
      this.createTerrainCommandModel = createTerrainCommandModel;

      this.terrainModel = spyOnService('terrain');
      this.gameTerrainsModel = spyOnService('gameTerrains');
      this.gameTerrainSelectionModel = spyOnService('gameTerrainSelection');

      this.state = {
        factions: 'factions',
        queueChangeEventP: jasmine.createSpy('queueChangeEventP')
      };
      this.game = { terrains: 'terrains',
                    terrain_selection: 'selection' };

      let stamp_index = 1;
      this.terrainModel.create.and.callFake((m) => {
        return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
      });
    }
  ]));

  context('executeP(<create>, <flip>, <state>, <game>)', function() {
    return this.createTerrainCommandModel
      .executeP(this.create, this.flip, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.create = {
        base: { x: 240, y: 240, r: 180 },
        terrains: [ {
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

    it('should create new terrains from <create>', function() {
      expect(this.terrainModel.create)
        .toHaveBeenCalledWith({
          info: ['snow','hill','hill1'],
          x: 240, y: 240, r: 225,
          lk: true
        });
      expect(this.terrainModel.create)
        .toHaveBeenCalledWith({
          info: ['snow','hill','hill2'],
          x: 260, y: 240, r: 180
        });
      expect(this.terrainModel.create)
        .toHaveBeenCalledWith({
          info: ['grass','wall','wall1'],
          x: 280, y: 240, r: 135,
          lk: false
        });
    });

    context('when map is flipped', function() {
      this.flip = true;
    }, function() {
      it('should flip new terrains positions', function() {
        expect(this.terrainModel.create)
          .toHaveBeenCalledWith({
            info: ['snow','hill','hill1'],
            x: 240, y: 240, r: 405,
            lk: true
          });
        expect(this.terrainModel.create)
          .toHaveBeenCalledWith({
            info: ['snow','hill','hill2'],
            x: 220, y: 240, r: 360
          });
        expect(this.terrainModel.create)
          .toHaveBeenCalledWith({
            info: ['grass','wall','wall1'],
            x: 200, y: 240, r: 315,
            lk: false
          });
      });
    });

    it('should add new terrain to <game> terrains', function() {
      const game = R.last(this.context);
      expect(this.gameTerrainsModel.add)
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
        ], 'terrains');
      expect(game.terrains)
        .toBe('gameTerrains.add.returnValue');
    });

    it('should set local terrainSelection to new terrain', function() {
      expect(this.gameTerrainSelectionModel.set)
        .toHaveBeenCalledWith('local', ['stamp1', 'stamp2', 'stamp3'],
                              this.state, 'selection');
    });

    it('should emit createTerrain event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.terrain.create');
    });

    it('should return context', function() {
      const [ctxt] = this.context;
      expect(this.terrainModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: ['snow','hill','hill1'],
                   x: 240, y: 240, r: 225,
                   lk: true,
                   stamp: 'stamp1'
                 }
        });
      expect(this.terrainModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: ['snow','hill','hill2'],
                   x: 260, y: 240, r: 180,
                   stamp: 'stamp2'
                 }
        });
      expect(this.terrainModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: ['grass','wall','wall1'],
                   x: 280, y: 240, r: 135,
                   lk: false,
                   stamp: 'stamp3'
                 }
        });

      expect(ctxt)
        .toEqual({
          terrains: [ 'terrain.saveState.returnValue',
                      'terrain.saveState.returnValue',
                      'terrain.saveState.returnValue' ],
          desc: 'snow.hill.hill1'
        });
    });
  });

  context('replayP(<ctxt>, <state>, <game>)', function() {
    return this.createTerrainCommandModel
      .replayP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        terrains: [
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

    it('should create new terrains from <ctxt.terrains>', function() {
      expect(this.terrainModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'hill', 'hill1' ],
            x: 240, y: 240,
          lk: true,
          stamp: 'stamp'
        });
      expect(this.terrainModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'hill', 'hill2' ],
          x: 260, y: 240,
          stamp: 'stamp'
        });
      expect(this.terrainModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'wall', 'wall1' ],
          x: 280, y: 240,
          lk: false,
          stamp: 'stamp'
        });
    });

    it('should add new terrain to <game> terrains', function() {
      expect(this.gameTerrainsModel.add)
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
        ], 'terrains');
      expect(this.context.terrains)
        .toBe('gameTerrains.add.returnValue');
    });

    it('should set remote terrainSelection to new terrain', function() {
      expect(this.gameTerrainSelectionModel.set)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
    });

    it('should emit createTerrain event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.create');
    });
  });

  context('undoP(<ctxt>, <state>, <game>)', function() {
    return this.createTerrainCommandModel
      .undoP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        terrains: [
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

    it('should remove <ctxt.terrain> from <game> terrains', function() {
      expect(this.gameTerrainsModel.removeStamps)
        .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'terrains');
      expect(this.context.terrains)
        .toBe('gameTerrains.removeStamps.returnValue');
    });

    it('should remove <ctxt.terrain> from terrainSelection', function() {
      expect(this.gameTerrainSelectionModel.removeFrom)
        .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
      expect(this.gameTerrainSelectionModel.removeFrom)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'gameTerrainSelection.removeFrom.returnValue');
    });

    it('should emit createTerrain event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.terrain.create');
    });
  });
});
