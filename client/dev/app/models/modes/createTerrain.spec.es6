describe('createTerrainMode model', function() {
  beforeEach(inject([
    'createTerrainMode',
    function(createTerrainModeModel) {
      this.createTerrainModeModel = createTerrainModeModel;

      this.state = jasmine.createSpyObj('state', [
        'queueChangeEventP', 'eventP'
      ]);
      this.state.create = { base: {}, terrains: [] };
      this.game = 'game';
    }
  ]));

  context('onEnter()', function() {
    return this.createTerrainModeModel
      .onEnter(this.state);
  }, function() {
    example(function(e) {
      it('should emit '+e.event+' event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith(e.event);
      });
    }, [
      [ 'event'                      ],
      [ 'Game.terrain.create.enable' ],
      [ 'Game.moveMap.enable'        ],
    ]);
  });

  context('onLeave()', function() {
    return this.createTerrainModeModel
      .onLeave(this.state);
  }, function() {
    it('should reset state\'s create object', function() {
      expect(this.state.create)
        .toEqual({ base: {},
                   terrains: null
                 });
    });

    example(function(e) {
      it('should emit '+e.event+' event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith(e.event);
      });
    }, [
      [ 'event'                       ],
      [ 'Game.terrain.create.disable' ],
      [ 'Game.moveMap.disable'        ],
    ]);
  });

  context('user move mouse over map', function() {
    return this.createTerrainModeModel.actions
      .moveMap(this.state, { x: 42, y: 71 });
  }, function() {
    it('should update state\'s create object', function() {
      expect(this.state.create.base)
        .toEqual({
          x: 42, y: 71
        });
    });

    it('should emit moveCreateTerrain event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.create.update');
    });
  });

  context('user create terrain', function() {
    return this.createTerrainModeModel.actions
      .create(this.state, { 'click#': { x: 42, y: 71 } });
  }, function() {
    it('should update state\'s create object', function() {
      expect(this.state.create.base)
        .toEqual({
          x: 42, y: 71
        });
    });

    example(function(e) {
      context('map is '+(e.flip_map ? '' : 'not ')+'flipped', function() {
        this.state.ui_state = { flip_map: e.flip_map };
      }, function() {
        it('should execute createTerrainCommand', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'createTerrain',
                                  [ this.state.create, e.flip_map ]);
        });
      });
    }, [
      [ 'flip_map' ],
      [ true       ],
      [ false      ],
    ]);
  });
});
