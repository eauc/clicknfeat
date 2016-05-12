xdescribe('stateModes model', function() {
  beforeEach(inject([
    'stateModes',
    function(stateModesModel) {
      this.stateModesModel = stateModesModel;

      this.modesModel = spyOnService('modes');
      this.appStateService = spyOnService('appState');

      this.state = { modes: 'modes' };
      this.event = { preventDefault: jasmine.createSpy('preventDefault')
                   };
    }
  ]));

  context('onModesCurrentAction(<action>,<event>)', function() {
    return this.stateModesModel
      .onModesCurrentAction(this.state, 'event', ['action', [this.event]]);
  }, function() {
    it('should dispatch mode action', function() {
      expect(this.modesModel.currentModeActionP)
        .toHaveBeenCalledWith('action', [this.state, this.event], 'modes');
    });

    it('should prevent <event> default', function() {
      expect(this.event.preventDefault)
        .toHaveBeenCalled();
    });

    context('when action fails', function() {
      this.modesModel.currentModeActionP
        .rejectWith('reason');
    }, function() {
      it('should emit "Game.error" event', function() {
        expect(this.appStateService.emit)
          .toHaveBeenCalledWith('Game.error','reason');
      });
    });
  });

  context('onModesSwitchTo(<to>)', function() {
    return this.stateModesModel
      .onModesSwitchTo(this.state, 'event', ['to']);
  }, function() {
    it('should switch modes', function() {
      expect(this.modesModel.switchToMode)
        .toHaveBeenCalledWith('to', 'modes');
    });

    it('should update state\'s modes', function() {
      expect(this.context.modes)
        .toBe('modes.switchToMode.returnValue');
    });
  });

  context('onModesReset()', function() {
    return this.stateModesModel
      .onModesReset(this.state);
  }, function() {
    it('should reset modes', function() {
      expect(this.modesModel.init)
        .toHaveBeenCalled();
    });

    it('should update state\'s modes', function() {
      expect(this.context.modes)
        .toBe('modes.init.returnValue');
    });
  });

  context('onModesExit()', function() {
    return this.stateModesModel
      .onModesExit(this.state);
  }, function() {
    it('should exit modes', function() {
      expect(this.modesModel.exit)
        .toHaveBeenCalledWith('modes');
    });

    it('should update state\'s modes', function() {
      expect(this.context.modes)
        .toBe('modes.exit.returnValue');
    });
  });
});
