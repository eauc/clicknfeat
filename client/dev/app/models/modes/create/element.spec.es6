describe('createElementMode model', function() {
  beforeEach(inject([
    'createElementMode',
    function(createElementModeModel) {
      this.createElementModeModel = createElementModeModel('type');

      this.appActionService = spyOnService('appAction');
      this.appStateService = spyOnService('appState');
      this.appStateService.onAction
        .and.callFake(R.nthArg(0));

      this.commonModeModel = spyOnService('commonMode');
      spyOn(this.commonModeModel.actions, 'modeBackToDefault')
        .and.callFake(R.nthArg(0));

      this.state = { create: { base: {}, types: [] },
                     factions: 'factions' };
      this.game = 'game';
    }
  ]));

  context('onEnter()', function() {
    return this.createElementModeModel
      .onEnter();
  }, function() {
    it('should enable Game.view.moveMap', function() {
      expect(this.appActionService.defer)
        .toHaveBeenCalledWith('Game.view.moveMap', true);
    });
  });

  context('onLeave()', function() {
    return this.createElementModeModel
      .onLeave();
  }, function() {
    it('should disable Game.view.moveMap', function() {
      expect(this.appActionService.defer)
        .toHaveBeenCalledWith('Game.view.moveMap', false);
    });
  });

  context('modeBackToDefault()', function() {
    return this.createElementModeModel.actions
      .modeBackToDefault(this.state);
  }, function() {
    it('should reset create object', function() {
      expect(this.context.create)
        .toBe(null);
    });

    it('should go back to default mode', function() {
      expect(this.commonModeModel.actions.modeBackToDefault)
        .toHaveBeenCalledWith(this.context);
    });
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
    it('should switch to Default mode', function() {
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, [ 'Modes.switchTo',
                                            'Default' ]);
    });

    it('should reset create object', function() {
      expect(this.context.create)
        .toEqual(null);
    });

    example(function(e) {
      context(`map is ${e.flip_map ? '' : 'not '}flipped`, function() {
        this.state.view = { flip_map: e.flip_map };
      }, function() {
        it('should execute createElementCommand', function() {
          expect(this.appStateService.onAction)
            .toHaveBeenCalledWith(this.state, [ 'Game.command.execute',
                                                'createType',
                                                [ { base: { x: 42, y: 71 },
                                                    types: [  ],
                                                    factions: 'factions' },
                                                  e.flip_map ]
                                              ]);
        });
      });
    }, [
      [ 'flip_map' ],
      [ true       ],
      [ false      ],
    ]);
  });
});
