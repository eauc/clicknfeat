describe('appModes service', function() {
  beforeEach(inject([
    'appModes',
    function(appModesService) {
      this.appModesService = appModesService;

      this.appErrorService = spyOnService('appError');
      this.modesModel = spyOnService('modes');

      this.state = { modes: 'modes' };
      this.event = { preventDefault: jasmine.createSpy('preventDefault')
                   };
    }
  ]));

  context('onModesCurrentAction(<action>,<event>)', function() {
    return this.appModesService
      .currentAction(this.state, 'action', [this.event]);
  }, function() {
    it('should dispatch mode action', function() {
      expect(this.modesModel.currentModeActionP)
        .toHaveBeenCalledWith('action', [this.state, this.event], 'modes');
    });

    context('when action returns state', function() {
      this.modesModel.currentModeActionP
        .and.returnValue('new_state');
    }, function() {
      it('should return new state', function() {
        expect(this.context)
          .toBe('new_state');
      });
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
        expect(this.appErrorService.emit)
          .toHaveBeenCalledWith('reason');
      });
    });
  });

  context('onModesSwitchTo(<to>)', function() {
    return this.appModesService
      .switchTo(this.state, 'to');
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
    return this.appModesService
      .reset(this.state);
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
    return this.appModesService
      .exit(this.state);
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
