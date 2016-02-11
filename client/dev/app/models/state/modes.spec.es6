describe('stateModesModel', function() {
  beforeEach(inject([
    'stateModes',
    function(stateModesModel) {
      this.stateModesModel = stateModesModel;

      this.modesModel = spyOnService('modes');

      this.state = { modes: 'modes',
                     queueChangeEventP: jasmine.createSpy('queueChangeEventP')
                   };
      this.event = { preventDefault: jasmine.createSpy('preventDefault')
                   };
    }
  ]));

  context('onModesCurrentAction(<action>,<event>)', function() {
    return this.stateModesModel
      .onModesCurrentAction(this.state, 'event', 'action', [this.event]);
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
      it('should emit "Game.action.error" event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.action.error','reason');
      });
    });
  });

  context('onModesSwitchTo(<to>)', function() {
    return this.stateModesModel
      .onModesSwitchTo(this.state, 'event', 'to');
  }, function() {
    it('should switch modes', function() {
      expect(this.modesModel.switchToModeP)
        .toHaveBeenCalledWith('to', this.state, 'modes');
    });

    it('should update state\'s modes', function() {
      expect(this.state.modes)
        .toBe('modes.switchToModeP.returnValue');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Modes.change');
    });
  });

  context('onModesReset()', function() {
    return this.stateModesModel
      .onModesReset(this.state);
  }, function() {
    it('should reset modes', function() {
      expect(this.modesModel.initP)
        .toHaveBeenCalled();
    });

    it('should update state\'s modes', function() {
      expect(this.state.modes)
        .toBe('modes.initP.returnValue');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Modes.change');
    });
  });

  context('onModesExit()', function() {
    return this.stateModesModel
      .onModesExit(this.state);
  }, function() {
    it('should exit modes', function() {
      expect(this.modesModel.exit)
        .toHaveBeenCalledWith(this.state, 'modes');
    });

    it('should update state\'s modes', function() {
      expect(this.state.modes)
        .toBe('modes.exit.returnValue');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Modes.change');
    });
  });
});
