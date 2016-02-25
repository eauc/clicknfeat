describe('gameTerrainSelection model', function() {
  beforeEach(inject([
    'gameTerrainSelection',
    function(gameTerrainSelectionModel) {
      this.gameTerrainSelectionModel = gameTerrainSelectionModel;

      this.gameTerrainsModel = spyOnService('gameTerrains');
      this.terrainModel = spyOnService('terrain');

      spyOn(this.gameTerrainSelectionModel, 'checkModeP');

      this.state = jasmine.createSpyObj('state', [
        'queueChangeEventP', 'queueEventP'
      ]);
      this.state.game = { terrains: 'terrains' };
      this.state.modes = 'modes';
    }
  ]));

  example(function(e) {
    context('set('+e.where+', <stamps>, <state>)', function() {
      return this.gameTerrainSelectionModel
        .set(e.where, this.after, this.state, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: [ 'before1', 'before2' ],
                           remote: [ 'before1', 'before2' ]
                         };
        this.after = [ 'after1', 'after2' ];
      });

      it('should set <where> selection', function() {
        expect(this.gameTerrainSelectionModel.in(e.where, 'after1', this.context))
          .toBeTruthy();
        expect(this.gameTerrainSelectionModel.in(e.where, 'after2', this.context))
          .toBeTruthy();
        expect(this.gameTerrainSelectionModel.in(e.where, 'before1', this.context))
          .toBeFalsy();
        expect(this.gameTerrainSelectionModel.in(e.where, 'before2', this.context))
          .toBeFalsy();
      });

      it('should emit changeTerrain event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.after1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.after2');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.before1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.before2');
      });

      if(e.where === 'local') {
        testChangeLocalSelection();
      }
    });

    context('removeFrom('+e.where+', <stamps>, <state>)', function() {
      return this.gameTerrainSelectionModel
        .removeFrom(e.where, this.remove, this.state, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: [ 'stamp1', 'stamp2' ],
                           remote: [ 'stamp1', 'stamp2' ]
                         };
        this.remove = ['stamp2', 'stamp3'];
      });

      it('should remove stamps from <where> selection', function() {
        expect(this.gameTerrainSelectionModel.in(e.where, 'stamp1', this.context))
          .toBeTruthy();
        expect(this.gameTerrainSelectionModel.in(e.where, 'stamp2', this.context))
          .toBeFalsy();
        expect(this.gameTerrainSelectionModel.in(e.where, 'stamp3', this.context))
          .toBeFalsy();
      });

      it('should emit changeTerrain event', function() {
        // also emit stamp1 to update single selection styles
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp2');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp3');
      });

      if(e.where === 'local') {
        testChangeLocalSelection();
      }
    });

    context('addTo('+e.where+', <stamps>, <state>)', function() {
      return this.gameTerrainSelectionModel
        .addTo(e.where, this.add, this.state, this.selection);
    }, function() {
      beforeEach(function() {
        this.add = ['stamp2', 'stamp3'];
        this.selection = { local: [ 'stamp1' ],
                           remote: [ 'stamp1' ]
                         };
      });

      it('should add stamps to <where> selection', function() {
        expect(this.gameTerrainSelectionModel.in(e.where, 'stamp2', this.context))
          .toBeTruthy();
        expect(this.gameTerrainSelectionModel.in(e.where, 'stamp3', this.context))
          .toBeTruthy();
      });

      it('should emit changeTerrain event', function() {
        // also emit stamp1 to update single selection styles
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp2');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp3');
      });

      if(e.where === 'local') {
        testChangeLocalSelection();
      }
    });

    context('clear('+e.where+', <stamps>, <state>)', function() {
      return this.gameTerrainSelectionModel
        .clear(e.where, this.state, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: ['stamp1', 'stamp2'],
                           remote: ['stamp1', 'stamp2']
                         };
      });

      it('should clear <where> selection', function() {
        expect(this.gameTerrainSelectionModel.in(e.where, 'stamp1', this.context))
          .toBeFalsy();
        expect(this.gameTerrainSelectionModel.in(e.where, 'stamp2', this.context))
          .toBeFalsy();
      });

      it('should emit changeTerrain event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp2');
      });
    });
  }, [
    [ 'where'  ],
    [ 'local'  ],
    [ 'remote' ],
  ]);

  context('checkModeP(<state>)', function() {
    return this.gameTerrainSelectionModel
      .checkModeP(this.state, this.selection);
  }, function() {
    beforeEach(function() {
      this.gameTerrainSelectionModel.checkModeP
        .and.callThrough();
      this.state = { modes: 'modes',
                     game: { terrains: 'terrains' },
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
          'No terrain selection'
        ]);
      });
    });

    it('should switch to mode for terrain', function() {
      expect(this.state.queueEventP)
        .toHaveBeenCalledWith('Modes.switchTo','Terrain');
    });
  });

  function testChangeLocalSelection() {
    it('should emit change event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.terrain.selection.local.change');
    });
  }
});
