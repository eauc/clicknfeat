describe('onTerrainsCommand model', function() {
  beforeEach(inject([
    'onTerrainsCommand',
    function(onTerrainsCommandModel) {
      this.onTerrainsCommandModel = onTerrainsCommandModel;

      this.terrainModel = spyOnService('terrain');
      this.terrainModel.eventName.and.callThrough();
      this.gameTerrainsModel = spyOnService('gameTerrains');
      this.gameTerrainsModel.findStampP.resolveWith((s) => {
        return { state: { stamp: s } };
      });
      this.gameTerrainSelectionModel = spyOnService('gameTerrainSelection');

      this.state = jasmine.createSpyObj('state', [
        'queueChangeEventP'
      ]);
      this.game = { terrains: 'terrains',
                    terrain_selection: 'selection' };
    }
  ]));

  context('executeP(<method>, <..args..>, <stamps>, <state>, <game>)', function() {
    return this.onTerrainsCommandModel
      .executeP(this.method, this.args, this.stamps, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.args = ['arg1', 'arg2'];
      this.stamps = ['stamp1', 'stamp2'];

      this.gameTerrainsModel.fromStampsP.resolveWith((m) => {
        return `gameTerrains.fromStampsP.returnValue(${m})`;
      });
      this.gameTerrainsModel.onStampsP.resolveWith((m) => {
        return `gameTerrains.onStampsP.returnValue(${m})`;
      });
    });

    context('when terrainModel does not respond to <method> ', function() {
      this.method = 'whatever';
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.gameTerrainsModel.onStampsP)
          .not.toHaveBeenCalled();

        expect(this.contextError).toEqual([
          'Unknown method "whatever" on terrain'
        ]);
      });
    });

    context('when terrainModel responds to <method> ', function() {
      this.method = 'setState';
    }, function() {
      it('should save <stamps> states before change', function() {
        expect(this.gameTerrainsModel.fromStampsP)
          .toHaveBeenCalledWith('saveState', [], this.stamps, 'terrains');
        expect(this.context[0].before)
          .toEqual('gameTerrains.fromStampsP.returnValue(saveState)');
      });

      it('should apply <method> on <stamps>', function() {
        expect(this.gameTerrainsModel.onStampsP)
          .toHaveBeenCalledWith(this.method, this.args, this.stamps, 'terrains');
        expect(this.context[1].terrains)
          .toBe('gameTerrains.onStampsP.returnValue(setState)');
      });

      it('should save <stamps> states after change', function() {
        expect(this.gameTerrainsModel.fromStampsP)
          .toHaveBeenCalledWith('saveState', [], this.stamps, 'terrains');
        expect(this.context[0].after)
          .toEqual('gameTerrains.fromStampsP.returnValue(saveState)');
      });

      it('should emit changeTerrain changeEvents', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.stamp2');
      });

      it('should return context', function() {
        expect(this.context[0])
          .toEqual({
            before: 'gameTerrains.fromStampsP.returnValue(saveState)',
            after: 'gameTerrains.fromStampsP.returnValue(saveState)',
            desc: 'setState'
          });
      });
    });
  });

  example(function(e) {
    context(e.method+'(<ctxt>, <state>, <game>)', function() {
      return this.onTerrainsCommandModel[e.method](this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
          after: [ { stamp: 'after1' }, { stamp: 'after2' } ]
        };
      });

      it('should set <'+e.state+'> states', function() {
        expect(this.gameTerrainsModel.setStateStampsP)
          .toHaveBeenCalledWith(this.ctxt[e.state],
                                [e.state+'1',e.state+'2'],
                                'terrains');
        expect(this.context.terrains)
            .toBe('gameTerrains.setStateStampsP.returnValue');
      });

      context('setStateStamps fails', function() {
        this.gameTerrainsModel.setStateStampsP
          .rejectWith('reason');
        this.expectContextError();
      }, function() {
        it('should reject command', function() {
          expect(this.contextError).toEqual([
            'reason'
          ]);
        });
      });

      it('should emit changeTerrain changeEvents', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.'+e.state+'1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.terrain.change.'+e.state+'2');
      });

      it('should set remote terrainSelection to modified terrains', function() {
        expect(this.gameTerrainSelectionModel.set)
          .toHaveBeenCalledWith('remote', [e.state+'1', e.state+'2'],
                                this.state, 'selection');
        expect(this.context.terrain_selection)
          .toBe('gameTerrainSelection.set.returnValue');
      });
    });
  }, [
    [ 'method'  , 'state'  ],
    [ 'replayP' , 'after'  ],
    [ 'undoP'   , 'before' ],
  ]);
});
