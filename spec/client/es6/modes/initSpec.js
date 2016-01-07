describe('init modes', function() {
  describe('modesService', function() {
    beforeEach(inject([
      'modes',
      'defaultMode',
      function(modesService, defaultModeService) {
        this.modesService = modesService;
        this.defaultModeService = defaultModeService;
        this.defaultModeService.onEnter = jasmine.createSpy('onEnter');
        this.defaultModeService.actions.test = jasmine.createSpy('testAction');
        this.defaultModeService.bindings.test = 'ctrl+test';
        this.defaultModeService.buttons = [ 'testButtons' ];
        spyOn(Mousetrap, 'reset');
        spyOn(Mousetrap, 'bind');
      }
    ]));

    when('init(<state>)', function() {
      this.ret = this.modesService.init(this.state);
    }, function() {
      beforeEach(function() {
        this.state = { 'this': 'state' };
      });

      it('should start in default mode', function() {
        this.thenExpect(this.ret, function(modes) {
          expect(this.modesService.currentModeName(modes))
            .toBe('Default');
        });
      });

      it('should enter default mode', function() {
        this.thenExpect(this.ret, function() {
          expect(this.defaultModeService.onEnter)
            .toHaveBeenCalledWith(this.state);
        });
      });

      describe('when default mode enter fails', function() {
        beforeEach(function() {
          mockReturnPromise(this.defaultModeService.onEnter);
          this.defaultModeService.onEnter.rejectWith = 'reason';
        });

        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });

      it('should reset Mousetrap bindings', function() {
        this.thenExpect(this.ret, function() {
          expect(Mousetrap.reset)
            .toHaveBeenCalled();
        });
      });

      it('should setup default mode\'s Mousetrap bindings', function() {
        this.thenExpect(this.ret, function() {
          expect(Mousetrap.bind)
            .toHaveBeenCalledWith('ctrl+test', jasmine.any(Function));
        });
      });
    });

    describe('Mousetrap binding', function() {
      beforeEach(function(done) {
        this.event = jasmine.createSpyObj('event', ['preventDefault']);
        this.state = jasmine.createSpyObj('state', [
          'event','changeEvent'
        ]);
        this.modesService.init(this.state)
          .then((modes) => {
            this.modes = modes;
            this.actionBinding = findCallByArgs(Mousetrap.bind, (args) => {
              return args[0] === 'ctrl+test';
            }).args[1];

            done();
          });
      });

      when('event is triggered', function() {
        this.ret = this.actionBinding(this.event);
      }, function() {
        it('should should call associated mode action', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Modes.current.action', 'test', [this.event]);
        });
      });
    });
  });
});
