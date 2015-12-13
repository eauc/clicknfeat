'use strict';

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

    when('init(<scope>)', function() {
      this.ret = this.modesService.init(this.scope);
    }, function() {
      beforeEach(function() {
        this.scope = { 'this': 'scope' };
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
            .toHaveBeenCalledWith(this.scope);
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

      it('should setup default mode\'s buttons', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.action_buttons)
            .toEqual(this.defaultModeService.buttons);
          expect(this.scope.action_bindings.test)
            .toBe('ctrl+test');
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
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.modesService.init(this.scope)
          .then((modes) => {
            this.modes = modes;
            this.actionBinding = findCallByArgs(Mousetrap.bind,
                                                function(args) {
                                                  return args[0] === 'ctrl+test';
                                                }).args[1];
            
            done();
          });
      });

      when('event is triggered', function() {
        this.ret = this.actionBinding(this.event);
      }, function() {
        it('should should call associated mode action', function() {
          expect(this.defaultModeService.actions.test)
            .toHaveBeenCalledWith(this.scope, this.event);
        });

        it('should prevent event default', function() {
          expect(this.event.preventDefault)
            .toHaveBeenCalled();
        });
        
        when('action fails', function() {
          mockReturnPromise(this.defaultModeService.actions.test);
          this.defaultModeService.actions.test.rejectWith = 'reason';
        }, function() {
          it('should emit "modeActionError" event', function() {
            this.thenExpectError(this.defaultModeService.actions.test.promise, function() {
              expect(this.scope.gameEvent)
                .toHaveBeenCalledWith('modeActionError', 'reason');
            });
          });
        });
      });
    });
  });
});
