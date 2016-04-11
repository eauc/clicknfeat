describe('createElementMode model', function() {
  beforeEach(inject([
    'createElementMode',
    function(createElementModeModel) {
      this.createElementModeModel = createElementModeModel('type');

      this.appStateService = spyOnService('appState');

      this.state = { create: { base: {}, types: [] } };
      this.game = 'game';
    }
  ]));

  context('onEnter()', function() {
    return this.createElementModeModel
      .onEnter(this.state);
  }, function() {
    example(function(e) {
      it('should emit '+e.event+' event', function() {
        expect(this.appStateService.emit)
          .toHaveBeenCalledWith(e.event);
      });
    }, [
      [ 'event'                   ],
      [ 'Game.moveMap.enable'     ],
    ]);
  });

  context('onLeave()', function() {
    return this.createElementModeModel
      .onLeave(this.state);
  }, function() {
    example(function(e) {
      it('should emit '+e.event+' event', function() {
        expect(this.appStateService.emit)
          .toHaveBeenCalledWith(e.event);
      });
    }, [
      [ 'event'                    ],
      [ 'Game.moveMap.disable'     ],
    ]);
  });

  context('user move mouse over map', function() {
    return this.createElementModeModel.actions
      .moveMap(this.state, { x: 42, y: 71 });
  }, function() {
    it('should update state\'s create object', function() {
      expect(this.context.create.base)
        .toEqual({
          x: 42, y: 71
        });
    });
  });

  context('user creates element', function() {
    return this.createElementModeModel.actions
      .create(this.state, { 'click#': { x: 42, y: 71 } });
  }, function() {
    it('should reset create object', function() {
      expect(this.context.create)
        .toEqual({});
    });

    example(function(e) {
      context('map is '+(e.flip_map ? '' : 'not ')+'flipped', function() {
        this.state.ui_state = { flip_map: e.flip_map };
      }, function() {
        it('should execute createElementCommand', function() {
          expect(this.appStateService.chainReduce)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'createType',
                                  [ { base: { x: 42, y: 71 }, types: [  ] },
                                    e.flip_map ]);
        });
      });
    }, [
      [ 'flip_map' ],
      [ true       ],
      [ false      ],
    ]);
  });
});
