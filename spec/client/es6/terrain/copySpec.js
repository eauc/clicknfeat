describe('copy terrain', function() {
  describe('terrainMode service', function() {
    beforeEach(inject([
      'terrainMode',
      function(terrainModeService) {
        this.terrainModeService = terrainModeService;

        this.gameTerrainsService = spyOnService('gameTerrains');
        mockReturnPromise(this.gameTerrainsService.copyStamps);
        this.gameTerrainsService.copyStamps
          .resolveWith = 'gameTerrains.copyStamps.returnValue';

        this.gameTerrainSelectionService = spyOnService('gameTerrainSelection');
        
        this.scope = jasmine.createSpyObj('scope', [
          'doSwitchToMode'
        ]);
        this.scope.doSwitchToMode
          .and.returnValue('doSwitchToMode.returnValue');
        this.scope.create = {  };
        this.scope.game = { terrains: 'terrains',
                            terrain_selection: 'selection'
                          };
      }
    ]));

    when('copySelection()', function() {
      this.ret = this.terrainModeService.actions
        .copySelection(this.scope);
    }, function() {
      it('should copy current selection', function() {
        expect(this.gameTerrainSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameTerrainsService.copyStamps)
          .toHaveBeenCalledWith('gameTerrainSelection.get.returnValue', 'terrains');
      });

      it('should enter createTerrain mode', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.scope.create.terrain)
            .toBe('gameTerrains.copyStamps.returnValue');
          expect(this.scope.doSwitchToMode)
            .toHaveBeenCalledWith('CreateTerrain');
          expect(result)
            .toBe('doSwitchToMode.returnValue');
        });
      });
    });
  });

  describe('gameTerrains service', function() {
    beforeEach(inject([
      'gameTerrains',
      function(gameTerrainsService) {
        this.gameTerrainsService = gameTerrainsService;
      }
    ]));

    when('copyStamps(<stamps>)', function() {
      this.ret = this.gameTerrainsService
        .copyStamps(this.stamps, this.terrains);
    }, function() {
      beforeEach(function() {
        this.terrains = {
          active: [
            { state: { stamp: 'stamp1', x: 240, y: 240, r:  90, l: ['toto'] } },
            { state: { stamp: 'stamp2', x: 240, y: 120, r:  90, l: ['tata'] } },
            { state: { stamp: 'stamp3', x: 240, y: 240, r: 180, l: ['titi'] } },
          ],
          locked: [
            { state: { stamp: 'stamp4', x: 120, y: 240, r: 90, l: ['tutu'] } },
            { state: { stamp: 'stamp5', x: 240, y: 360, r:  0, l: ['tete'] } },
            { state: { stamp: 'stamp6', x: 360, y: 240, r: 90, l: ['toto'] } },
          ],
        };
      });

      using([
        [ 'stamps' , 'result' ],
        [ [ 'stamp1' ], {
          base: { x: 240, y: 240, r: 90 },
          terrains: [ { stamp: 'stamp1', x: 0, y: 0, r: 0, l: [ 'toto' ] } ]
        } ],
        [ [ 'stamp1', 'stamp4' ], {
          base: { x: 240, y: 240, r: 90 },
          terrains: [ { stamp: 'stamp1', x: 0, y: 0, r: 0, l: [ 'toto' ] },
                    { stamp: 'stamp4', x: -120, y: 0, r: 0, l: [ 'tutu' ] } ]
        } ],
        [ [ 'stamp2', 'stamp4', 'stamp6' ], {
          base: { x: 240, y: 120, r: 90 },
          terrains: [ { stamp: 'stamp2', x: 0, y: 0, r: 0, l: [ 'tata' ] },
                    { stamp: 'stamp4', x: -120, y: 120, r: 0, l: [ 'tutu' ] },
                    { stamp: 'stamp6', x: 120, y: 120, r: 0, l: [ 'toto' ] } ]
        } ],
      ], function(e, d) {
        when(d, function() {
          this.stamps = e.stamps;
        }, function() {
          it('should return copy object for <stamps>', function() {
            this.thenExpect(this.ret, function(result) {
              expect(result).toEqual(e.result);
            });
          });
        });
      });
    });
  });
});
