describe('on mode action', function() {
  describe('stateModesService', function() {
    beforeEach(inject([
      'stateModes',
      function(stateModesService) {
        this.stateModesService = stateModesService;

        this.modesService = spyOnService('modes');
        mockReturnPromise(this.modesService.currentModeAction);
        this.modesService.currentModeAction
          .resolveWith = 'modes.currentModeAction.returnValue';

        this.state = { modes: 'modes',
                       changeEvent: jasmine.createSpy('changeEvent')
                     };
        this.event = { preventDefault: jasmine.createSpy('preventDefault')
                     };
      }
    ]));

    when('onModesCurrentAction(<action>,<event>)', function() {
      this.ret = this.stateModesService
        .onModesCurrentAction(this.state, 'event', 'action', [this.event]);
    }, function() {
      it('should dispatch mode action', function() {
        this.thenExpect(this.ret, () => {
          expect(this.modesService.currentModeAction)
            .toHaveBeenCalledWith('action', [this.state, this.event], 'modes');
        });
      });

      it('should prevent <event> default', function() {
        this.thenExpect(this.ret, () => {
          expect(this.event.preventDefault)
            .toHaveBeenCalled();
        });
      });

      when('action fails', function() {
        this.modesService.currentModeAction.rejectWith = 'reason';
      }, function() {
        it('should emit "Game.action.error" event', function() {
          this.thenExpect(this.ret, () => {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.action.error','reason');
          });
        });
      });
    });
  });

  describe('modesService', function() {
    beforeEach(inject([
      'modes',
      'defaultMode',
      'allModes',
      function(modesService, defaultModeService) {
        this.modesService = modesService;

        this.defaultModeService = defaultModeService;
        spyOn(this.defaultModeService.actions, 'viewZoomIn');
        this.defaultModeService.actions.viewZoomIn
          .and.returnValue('viewZoomIn.returnValue');
      }
    ]));

    when('currentModeAction', function() {
      this.ret = this.modesService
        .currentModeAction(this.action, ['args'], this.modes);
    }, function() {
      beforeEach(function(done) {
        this.state = { game: { template_selection: 'selection' } };
        this.modesService.init(this.state)
          .then((modes) => {
            this.modes = modes;

            done();
          });
      });

      when('action is unknown in current mode', function() {
        this.action = 'unknown';
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Unknown action "unknown" in "Default" mode');
          });
        });
      });

      when('action is known in current mode', function() {
        this.action = 'viewZoomIn';
      }, function() {
        it('should proxy current mode\'s action', function() {
          this.thenExpect(this.ret, function(value) {
            expect(this.defaultModeService.actions.viewZoomIn)
              .toHaveBeenCalledWith('args');

            expect(value).toBe('viewZoomIn.returnValue');
          });
        });

        when('action fails', function() {
          mockReturnPromise(this.defaultModeService.actions.viewZoomIn);
          this.defaultModeService.actions.viewZoomIn.rejectWith = 'reason';
        }, function() {
          it('should reject promise', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('reason');
            });
          });
        });
      });
    });
  });
});
