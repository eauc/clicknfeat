describe('appState service', function() {
  beforeEach(inject([
    'appAction',
    'appState',
    function(appActionService, appStateService) {
      this.appStateService = appStateService;

      this.appActionService = appActionService;
      this.appErrorService = spyOnService('appError');
    }
  ]));

  context('init()', function() {
    return this.appStateService
      .init();
  }, function() {
    it('should return init value', function() {
      expect(this.context).toEqual({});
    });
  });

  context('onAction(<state>, [action, ...args])', function() {
    return this.appStateService
      .onAction(this.state, [ this.action, ...this.args]);
  }, function() {
    beforeEach(function() {
      this.state = 'state';
      this.args = [ 'args' ];

      this.action_handler = jasmine.createSpy('action_handler');
      this.appActionService
        .register('Action.known', this.action_handler)
        .register('Action.with.error', () => { throw('ActionError'); })
        .register('Action.with.failure', () => R.rejectP('ActionFailed'))
        .register('Action.with.promise', () => R.resolveP('ActionPromise'))
        .register('Action.with.success', () => 'NewState');
    });

    context('when <action> is unknown', function() {
      this.action = 'xxxUnknown';
    }, function() {
      it('should emit error', function() {
        expect(this.appErrorService.emit)
          .toHaveBeenCalledWith('Unknown action "xxxUnknown"');
      });

      it('should return null', function() {
        expect(this.context).toBe(null);
      });
    });

    context('when <action> is known', function() {
      this.action = 'Action.known';
    }, function() {
      it('should call <action> handler with <state> and <args>', function() {
        expect(this.action_handler)
          .toHaveBeenCalledWith(this.state, 'args');
      });
    });

    context('when <action> handler throw error', function() {
      this.action = 'Action.with.error';
    }, function() {
      it('should emit error', function() {
        expect(this.appErrorService.emit)
          .toHaveBeenCalledWith('Action "Action.with.error" handler error',
                                'ActionError');
      });

      it('should return null', function() {
        expect(this.context).toBe(null);
      });
    });

    context('when <action> handler fails', function() {
      this.action = 'Action.with.failure';
    }, function() {
      it('should emit error', function() {
        expect(this.appErrorService.emit)
          .toHaveBeenCalledWith('Action "Action.with.failure" handler error',
                                'ActionFailed');
      });

      it('should return null', function() {
        expect(this.context).toBe(null);
      });
    });

    context('when <action> return Promise', function() {
      this.action = 'Action.with.promise';
    }, function() {
      it('should return null', function() {
        expect(this.context).toBe(null);
      });
    });

    context('when <action> succeeds', function() {
      this.action = 'Action.with.success';
    }, function() {
      it('should return new state', function() {
        expect(this.context).toBe('NewState');
      });
    });
  });
});
