describe('modes', function() {
  describe('stateModesService', function() {
    beforeEach(inject([
      'stateModes',
      function(stateModesService) {
        this.stateModesService = stateModesService;

        this.modesService = spyOnService('modes');

        this.state = { modes: 'modes',
                       changeEvent: jasmine.createSpy('changeEvent')
                     };
      }
    ]));

    when('onModesSwitchTo(<to>)', function() {
      this.ret = this.stateModesService
        .onModesSwitchTo(this.state, 'event', 'to');
    }, function() {
      it('should switch modes', function() {
        this.thenExpect(this.ret, () => {
          expect(this.modesService.switchToMode)
            .toHaveBeenCalledWith('to', this.state, 'modes');
        });
      });

      it('should update state\'s modes', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.modes)
            .toBe('modes.switchToMode.returnValue');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Modes.change');
        });
      });
    });

    when('onModesReset()', function() {
      this.ret = this.stateModesService
        .onModesReset(this.state);
    }, function() {
      it('should reset modes', function() {
        this.thenExpect(this.ret, () => {
          expect(this.modesService.init)
            .toHaveBeenCalled();
        });
      });

      it('should update state\'s modes', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.modes)
            .toBe('modes.init.returnValue');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Modes.change');
        });
      });
    });

    when('onModesExit()', function() {
      this.ret = this.stateModesService
        .onModesExit(this.state);
    }, function() {
      it('should exit modes', function() {
        this.thenExpect(this.ret, () => {
          expect(this.modesService.exit)
            .toHaveBeenCalledWith(this.state, 'modes');
        });
      });

      it('should update state\'s modes', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.modes)
            .toBe('modes.exit.returnValue');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Modes.change');
        });
      });
    });
  });
  
  describe('modesService', function() {
    beforeEach(inject([
      'modes',
      'allModes',
      function(modesService) {
        this.modesService = modesService;
        this.defaultModeService = spyOnService('defaultMode');
        this.defaultModeService.onLeave = jasmine.createSpy('onLeave');
        this.templateModeService = spyOnService('createTemplateMode');
        this.templateModeService.onEnter = jasmine.createSpy('onEnter');
      }
    ]));

    describe('switchToMode(<next>, <state>)', function() {
      beforeEach(function(done) {
        this.state = { 'this': 'state',
                       changeEvent: jasmine.createSpy('changeEvent')
                     };

        this.modesService.init(this.state)
          .then((modes) => {
            this.modes = modes;
            this.modes.current = 'Default';

            this.defaultModeService.onEnter.calls.reset();
            
            done();
          });
      });

      function testModeSwitch(nextModeName, nextModeService) {
        it('should leave current mode', function() {
          this.thenExpect(this.ret, function() {
            expect(this.defaultModeService.onLeave)
              .toHaveBeenCalledWith(this.state);
          });
        });

        it('should enter new mode', function() {
          this.thenExpect(this.ret, function() {
            expect(this[nextModeService].onEnter)
              .toHaveBeenCalledWith(this.state);
          });
        });

        it('should change current mode', function() {
          this.thenExpect(this.ret, function(modes) {
            expect(this.modesService.currentModeName(modes))
              .toBe(nextModeName);
          });
        });

        when('leaveMode fails', function() {
          mockReturnPromise(this.defaultModeService.onLeave);
          this.defaultModeService.onLeave.rejectWith = 'reason';
        }, function() {
          it('should abort switch and reject promise', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('reason');
            });
          });
        });

        when('enterMode fails', function() {
          mockReturnPromise(this[nextModeService].onEnter);
          this[nextModeService].onEnter.rejectWith = 'reason';
        }, function() {
          it('should abort switch and reject promise', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('reason');

              expect(this.modesService.currentModeName(this.modes))
                .toBe('Default');
              expect(this.state.changeEvent)
                .not.toHaveBeenCalled();
            });
          });
        });
      }
      
      when('we need to change mode', function() {
        this.ret = this.modesService
          .switchToMode('CreateTemplate', this.state, this.modes);
      }, function() {
        testModeSwitch('CreateTemplate', 'templateModeService');
      });

      when('we are already in <next> mode', function() {
        this.ret = this.modesService
          .switchToMode('Default', this.state, this.modes);
      }, function() {
        testModeSwitch('Default', 'defaultModeService');
      });

      when('<next> mode does not exist', function() {
        this.ret = this.modesService
          .switchToMode('Unknown', this.state, this.modes);
      }, function() {
        it('should do nothing', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe(reason);
            
            expect(this.defaultModeService.onLeave)
              .not.toHaveBeenCalled();
            expect(this.defaultModeService.onEnter)
              .not.toHaveBeenCalled();
            expect(this.templateModeService.onEnter)
              .not.toHaveBeenCalled();

            expect(this.modesService.currentModeName(this.modes))
              .toBe('Default');
            expect(this.state.changeEvent)
              .not.toHaveBeenCalled();
          });
        });
      });
    });
  });
});
