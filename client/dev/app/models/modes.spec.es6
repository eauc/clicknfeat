describe('modesModel', function() {
  beforeEach(inject([
    'modes',
    'defaultMode',
    function(modesModel, defaultModeModel) {
      this.modesModel = modesModel;

      this.defaultModeModel = defaultModeModel;
      this.defaultModeModel.onEnter = jasmine.createSpy('onEnter');
      this.defaultModeModel.actions.test = jasmine.createSpy('testAction');
      this.defaultModeModel.bindings.test = 'ctrl+test';
      this.defaultModeModel.buttons = [ 'testButtons' ];
      this.defaultModeModel.onLeave = jasmine.createSpy('onLeave');

      this.templateModeModel = spyOnService('createTemplateMode');
      this.templateModeModel.onEnter = jasmine.createSpy('onEnter');

      spyOn(Mousetrap, 'reset');
      spyOn(Mousetrap, 'bind');
    }
  ]));

  context('initP(<state>)', function() {
    return this.modesModel.initP(this.state);
  }, function() {
    beforeEach(function() {
      this.state = { 'this': 'state' };
    });

    it('should start in default mode', function() {
      expect(this.modesModel.currentModeName(this.context))
        .toBe('Default');
    });

    it('should enter default mode', function() {
      expect(this.defaultModeModel.onEnter)
        .toHaveBeenCalledWith(this.state);
    });

    context('when default mode enter fails', function() {
      spyReturnPromise(this.defaultModeModel.onEnter);
      this.defaultModeModel.onEnter.rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    it('should reset Mousetrap bindings', function() {
      expect(Mousetrap.reset)
        .toHaveBeenCalled();
    });

    it('should setup default mode\'s Mousetrap bindings', function() {
      expect(Mousetrap.bind)
        .toHaveBeenCalledWith('ctrl+test', jasmine.any(Function));
    });
  });

  describe('Mousetrap binding', function() {
    beforeEach(function() {
      this.event = jasmine.createSpyObj('event', ['preventDefault']);
      this.state = jasmine.createSpyObj('state', [
        'event','changeEvent'
      ]);
      return this.modesModel.initP(this.state)
        .then((modes) => {
          this.modes = modes;
          this.actionBinding = findCallByArgs(Mousetrap.bind, (args) => {
            return args[0] === 'ctrl+test';
          }).args[1];
        });
    });

    context('when event is triggered', function() {
      return this.actionBinding(this.event);
    }, function() {
      it('should should call associated mode action', function() {
        expect(this.state.event)
          .toHaveBeenCalledWith('Modes.current.action', 'test', [this.event]);
      });
    });
  });

  context('switchToModeP(<next>, <state>)', function() {
    return this.modesModel
      .switchToModeP(this.to, this.state, this.modes);
  }, function() {
    beforeEach(function() {
      this.state = { 'this': 'state',
                     changeEvent: jasmine.createSpy('changeEvent')
                   };

      return this.modesModel.initP(this.state)
        .then((modes) => {
          this.modes = modes;
          this.modes.current = 'Default';

          this.defaultModeModel.onEnter.calls.reset();
        });
    });

    function testModeSwitch(nextModeName, nextModeModel) {
      it('should leave current mode', function() {
        expect(this.defaultModeModel.onLeave)
          .toHaveBeenCalledWith(this.state);
      });

      it('should enter new mode', function() {
        expect(this[nextModeModel].onEnter)
          .toHaveBeenCalledWith(this.state);
      });

      it('should change current mode', function() {
        expect(this.modesModel.currentModeName(this.context))
          .toBe(nextModeName);
      });

      context('when leaveMode fails', function() {
        spyReturnPromise(this.defaultModeModel.onLeave);
        this.defaultModeModel.onLeave.rejectWith('reason');
        this.expectContextError();
      }, function() {
        it('should abort switch and reject promise', function() {
          expect(this.contextError).toEqual([
            'reason'
          ]);
        });
      });

      context('when enterMode fails', function() {
        spyReturnPromise(this[nextModeModel].onEnter);
        this[nextModeModel].onEnter.rejectWith('reason');
        this.expectContextError();
      }, function() {
        it('should abort switch and reject promise', function() {
          expect(this.contextError).toEqual([
            'reason'
          ]);

          expect(this.modesModel.currentModeName(this.modes))
            .toBe('Default');
          expect(this.state.changeEvent)
            .not.toHaveBeenCalled();
        });
      });
    }

    context('when we need to change mode', function() {
      this.to = 'CreateTemplate';
    }, function() {
      testModeSwitch('CreateTemplate', 'templateModeModel');
    });

    context('when we are already in <next> mode', function() {
      this.to = 'Default';
    }, function() {
      testModeSwitch('Default', 'defaultModeModel');
    });

    context('when <next> mode does not exist', function() {
      this.to = 'Unknown';
      this.expectContextError();
    }, function() {
      it('should do nothing', function() {
        expect(this.contextError).toEqual([
          'Mode Unknown does not exists'
        ]);

        expect(this.defaultModeModel.onLeave)
          .not.toHaveBeenCalled();
        expect(this.defaultModeModel.onEnter)
          .not.toHaveBeenCalled();
        expect(this.templateModeModel.onEnter)
          .not.toHaveBeenCalled();

        expect(this.modesModel.currentModeName(this.modes))
          .toBe('Default');
        expect(this.state.changeEvent)
          .not.toHaveBeenCalled();
      });
    });
  });

  context('currentModeActionP(<action>, <args>)', function() {
    return this.modesModel
      .currentModeActionP(this.action, ['args'], this.modes);
  }, function() {
    beforeEach(function() {
      this.state = { game: { template_selection: 'selection' } };

      spyOn(this.defaultModeModel.actions, 'viewZoomIn');
      this.defaultModeModel.actions.viewZoomIn
        .and.returnValue('viewZoomIn.returnValue');

      return this.modesModel.initP(this.state)
        .then((modes) => {
          this.modes = modes;
        });
    });

    context('when action is unknown in current mode', function() {
      this.action = 'unknown';
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'Unknown action "unknown" in "Default" mode'
        ]);
      });
    });

    context('when action is known in current mode', function() {
      this.action = 'viewZoomIn';
    }, function() {
      it('should proxy current mode\'s action', function() {
        expect(this.defaultModeModel.actions.viewZoomIn)
          .toHaveBeenCalledWith('args');

        expect(this.context).toBe('viewZoomIn.returnValue');
      });

      context('when action fails', function() {
        spyReturnPromise(this.defaultModeModel.actions.viewZoomIn);
        this.defaultModeModel.actions.viewZoomIn
          .rejectWith('reason');
        this.expectContextError();
      }, function() {
        it('should reject promise', function() {
          expect(this.contextError).toEqual([
            'reason'
          ]);
        });
      });
    });
  });

  context('currentModeBindingsPairs', function() {
    return this.modesModel
      .currentModeBindingsPairs(this.modes);
  }, function() {
    beforeEach(function() {
      this.state = { game: { template_selection: 'selection' } };
      this.defaultModeModel.bindings = {
        'test2': 'ctrl+test2',
        'test1': 'ctrl+test1',
        'test3': 'ctrl+test3'
      };
      return this.modesModel.initP(this.scope)
        .then((modes) => {
          this.modes = modes;
        });
    });

    it('should proxy current mode\'s action', function() {
      expect(this.context)
        .toEqual([
          [ 'test1', 'ctrl+test1' ],
          [ 'test2', 'ctrl+test2' ],
          [ 'test3', 'ctrl+test3' ]
        ]);
    });
  });
});
