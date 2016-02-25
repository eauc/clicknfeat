describe('deleteTerrainCommand model', function() {
  beforeEach(inject([
    'deleteTerrainCommand',
    function(deleteTerrainCommandModel) {
      this.deleteTerrainCommandModel = deleteTerrainCommandModel;

      this.terrainModel = spyOnService('terrain');
      this.terrainModel.saveState
        .and.callFake((t) => {
          return R.assoc('save', true, R.prop('state', t));
        });
      this.gameTerrainsModel = spyOnService('gameTerrains');
      this.gameTerrainSelectionModel = spyOnService('gameTerrainSelection');

      this.state = {
        factions: 'factions',
        queueChangeEventP: jasmine.createSpy('queueChangeEventP')
      };
      this.game = { terrains: 'terrains',
                    terrain_selection: 'selection' };
    }
  ]));

  context('executeP(<stamps>, <state>, <game>)', function() {
    return this.deleteTerrainCommandModel
      .executeP(this.stamps, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamp1', 'stamp2', 'stamp3'];

      this.terrains = [
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

      this.gameTerrainsModel.findAnyStampsP
        .resolveWith(this.terrains);
    });

    it('should find <stamps> in game terrains', function() {
      expect(this.gameTerrainsModel.findAnyStampsP)
        .toHaveBeenCalledWith(this.stamps, 'terrains');
    });

    context('no stamps are found', function() {
      this.gameTerrainsModel.findAnyStampsP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    it('should remove terrains from <game> terrains', function() {
      expect(this.gameTerrainsModel.removeStamps)
        .toHaveBeenCalledWith(this.stamps, 'terrains');
      expect(this.context[1].terrains)
        .toBe('gameTerrains.removeStamps.returnValue');
    });

    it('should remove <ctxt.terrains> from terrainSelection', function() {
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

    it('should resolve context', function() {
      expect(this.terrainModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'snow', 'hill', 'hill1' ],
                   x: 240, y: 240,
                   stamp: 'stamp1'
                 }
        });
      expect(this.terrainModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'snow', 'hill', 'hill2' ],
                   x: 260, y: 240,
                   stamp: 'stamp2'
                 }
        });
      expect(this.terrainModel.saveState)
        .toHaveBeenCalledWith({
          state: { info: [ 'snow', 'wall', 'wall1' ],
                   x: 280, y: 240,
                   stamp: 'stamp3'
                 }
        });
      expect(this.context[0])
        .toEqual({
          terrains: [ { info: [ 'snow', 'hill', 'hill1' ],
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
    return this.deleteTerrainCommandModel
      .replayP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        terrains: [
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

    it('should remove <ctxt.terrains> from <game> terrains', function() {
      expect(this.gameTerrainsModel.removeStamps)
        .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'terrains');
      expect(this.context.terrains)
        .toBe('gameTerrains.removeStamps.returnValue');
    });

    it('should remove <ctxt.terrains> from terrainSelection', function() {
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

  context('undoP(<ctxt>, <state>, <game>)', function() {
    return this.deleteTerrainCommandModel
      .undoP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        terrains: [
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
      this.terrainModel.create.and.callFake((m) => {
        return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
      });
    });

    it('should create new terrains from <ctxt.terrains>', function() {
      expect(this.terrainModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'hill', 'hill1' ],
          x: 240, y: 240,
          stamp: 'stamp1'
        });
      expect(this.terrainModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'hill', 'hill2' ],
          x: 260, y: 240,
          stamp: 'stamp2'
        });
      expect(this.terrainModel.create)
        .toHaveBeenCalledWith({
          info: [ 'snow', 'wall', 'wall1' ],
          x: 280, y: 240,
          stamp: 'stamp3'
        });
    });

    it('should add new terrain to <game> terrains', function() {
      expect(this.gameTerrainsModel.add)
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
        ], 'terrains');

      expect(this.context.terrains)
        .toBe('gameTerrains.add.returnValue');
    });

    it('should set remote terrainSelection to new terrains', function() {
      expect(this.gameTerrainSelectionModel.set)
        .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                              this.state, 'selection');
    });

    it('should emit createTerrain event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.terrain.create');
    });
  });
});
