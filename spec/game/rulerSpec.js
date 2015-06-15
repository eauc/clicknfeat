'use strict';

describe('user ruler', function() {
  describe('gameMainCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.gameService = spyOnService('game');

        this.createController = function() {
          this.scope = $rootScope.$new();
          this.scope.doModeAction = jasmine.createSpy('doModeAction');
          this.scope.onGameEvent = jasmine.createSpy('onGameEvent');
          this.scope.digestOnGameEvent = jasmine.createSpy('digestOnGameEvent');
          this.scope.game = { board: {}, scenario: {} };
          // this.scope.scenarios = ['scenarios'];

          $controller('gameMainCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    when('user uses ruler', function() {
      this.scope.doUseRuler();
    }, function() {
      it('should switch to ruler mode', function() {
        expect(this.scope.doModeAction)
          .toHaveBeenCalledWith('enterRulerMode');
      });
    });

    when('user toggles show ruler', function() {
      this.scope.doToggleShowRuler();
    }, function() {
      it('should switch to ruler mode', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setRuler', 'toggleDisplay',
                                this.scope, this.scope.game);
      });
    });
  });

  describe('defaultMode service', function() {
    beforeEach(inject([ 'defaultMode', function(defaultMode) {
      this.defaultModeService = defaultMode;
      this.modesService = spyOnService('modes');
    }]));

    when('user uses ruler', function() {
      this.defaultModeService.actions.enterRulerMode({ modes: 'modes' });
    }, function() {
      it('should switch to ruler mode', function() {
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('Ruler', { modes: 'modes' }, 'modes');
      });
    });
  });

  describe('rulerMode service', function() {
    beforeEach(inject([ 'rulerMode', function(rulerMode) {
      this.rulerModeService = rulerMode;
      this.modesService = spyOnService('modes');
      this.gameService = spyOnService('game');
      this.gameRulerService = spyOnService('gameRuler');
      this.scope = { modes: 'modes',
                     game: { ruler: 'ruler',
                             models: 'models' },
                     gameEvent: jasmine.createSpy('gameEvent')
                   };
    }]));

    when('user stop using ruler', function() {
      this.rulerModeService.actions.leaveRulerMode(this.scope);
    }, function() {
      it('should switch to ruler mode', function() {
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('Default', this.scope, 'modes');
      });
    });

    describe('when user set ruler max length', function() {
      beforeEach(function() {
        this.rulerModeService.actions.setMaxLength(this.scope);
      });
      
      it('should prompt user for max length', function() {
        expect(this.promptService.prompt)
          .toHaveBeenCalledWith('prompt',
                                'Set ruler max length :',
                                'gameRuler.maxLength.returnValue');
      });

      using([
        [ 'value', 'max' ],
        [ 42     , 42    ],
        [ 0      , null  ],
      ], function(e, d) {
        describe('when user validates prompt, '+d, function() {
          beforeEach(function() {
            this.promptService.prompt.resolve(e.value);
          });
        
          it('should set ruler max length', function() {
            expect(this.gameRulerService.setMaxLength)
              .toHaveBeenCalledWith(e.max, 'ruler');
            expect(this.scope.game.ruler)
              .toBe('gameRuler.setMaxLength.returnValue');
          });
        });
      });

      describe('when user cancel prompt', function() {
        beforeEach(function() {
          this.promptService.prompt.reject('canceled');
        });
        
        it('should reset ruler max length', function() {
          expect(this.gameRulerService.setMaxLength)
            .toHaveBeenCalledWith(null, 'ruler');
          expect(this.scope.game.ruler)
            .toBe('gameRuler.setMaxLength.returnValue');
        });
      });
    });

    using([
      ['action'],
      ['dragStartMap'],
      ['dragMap'],
    ], function(e, d) {
      when('user drags ruler, '+d, function() {
        this.drag = { start: 'start', now: 'now' };
        this.rulerModeService.actions[e.action](this.scope, this.drag);
      }, function() {
        it('should init local ruler', function() {
          expect(this.gameRulerService.setLocal)
            .toHaveBeenCalledWith('start', 'now',
                                  this.scope, 'ruler');
          expect(this.scope.game.ruler)
            .toBe('gameRuler.setLocal.returnValue');
        });
      });
    });
    
    when('user release ruler', function() {
      this.drag = { start: 'start', now: 'now' };
      this.rulerModeService.actions.dragEndMap(this.scope, this.drag);
    }, function() {
      it('should execute setRemote command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setRuler', 'setRemote',
                                'start', 'now',
                                this.scope, this.scope.game);
      });
    });

    when('user set ruler origin', function() {
      this.event = { target: { state: { stamp: 'stamp' } } };
      this.dom_event = { ctrlKey: true };
      this.rulerModeService.actions.clickModel(this.scope, this.event, this.dom_event);
    }, function() {
      it('should set ruler origin model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setRuler', 'setOrigin', 'models', this.event.target,
                                this.scope, this.scope.game);
      });
    });

    when('user set ruler target', function() {
      this.event = { target: { state: { stamp: 'stamp' } } };
      this.dom_event = { shiftKey: true };
      this.rulerModeService.actions.clickModel(this.scope, this.event, this.dom_event);
    }, function() {
      it('should set ruler target model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setRuler', 'setTarget', 'models', this.event.target,
                                this.scope, this.scope.game);
      });
    });
  });

  describe('setRulerCommand service', function() {
    beforeEach(inject([ 'setRulerCommand', function(setRulerCommand) {
      this.setRulerCommandService = setRulerCommand;
      this.gameRulerService = spyOnService('gameRuler');
      this.gameRulerService.saveRemoteState.and.callFake(function(r) {
        return r+'Save';
      });
      this.scope = jasmine.createSpyObj('scope', [
        'gameEvent',
      ]);

      var origin = 1;
      this.gameRulerService.origin.and.callFake(function() {
        return 'origin'+origin++;
      });
      var target = 1;
      this.gameRulerService.target.and.callFake(function() {
        return 'target'+target++;
      });
    }]));

    describe('execute(<method>, <...args...>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.game = { ruler: 'ruler' };
        this.ctxt = this.setRulerCommandService.execute('setRemote', 'args',
                                                        this.scope, this.game);
      });
      
      it('should save previous remote ruler state', function() {
        expect(this.ctxt.before).toEqual('rulerSave');
      });
      
      it('should apply <method> on game ruler', function() {
        expect(this.gameRulerService.setRemote)
          .toHaveBeenCalledWith('args', this.scope, 'ruler');
        expect(this.game.ruler)
          .toBe('gameRuler.setRemote.returnValue');
      });

      it('should save new remote ruler state', function() {
        expect(this.ctxt.after)
          .toBe('gameRuler.setRemote.returnValueSave');
      });

      it('should update origin/target models', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-origin1');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-origin2');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-target1');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-target2');
      });
    });

    using([
      [ 'method', 'previous', 'result' ],
      [ 'replay', 'before'  , 'after'  ],
      [ 'undo'  , 'after'   , 'before' ],
    ], function(e, d) {
      describe(e.method+'(<ctxt>, <scope>, <game>)', function() {
        beforeEach(function() {
          this.ctxt = {
            before: 'before',
            after: 'after'
          };
          this.game = { 'ruler': e.previous };

          this.setRulerCommandService[e.method](this.ctxt, this.scope, this.game);
        });
      
        it('should set game remote ruler', function() {
          expect(this.gameRulerService.resetRemote)
            .toHaveBeenCalledWith(e.result, this.scope, e.previous);
          expect(this.game.ruler)
            .toBe('gameRuler.resetRemote.returnValue');
        });

        it('should update origin/target models', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-origin1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-origin2');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-target1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-target2');
        });
      });
    });
  });

  describe('gameRuler service', function() {
    beforeEach(inject([ 'gameRuler', function(gameRulerService) {
      this.gameRulerService = gameRulerService;
      this.modelService = spyOnService('model');
      this.gameModelsService = spyOnService('gameModels');
      this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
    }]));

    describe('toggleDisplay()', function() {
      beforeEach(function() {
        this.ret = this.gameRulerService.toggleDisplay(this.scope, {
          remote: { display: false }
        });
      });

      it('should toggle remote ruler display', function() {
        expect(this.ret)
          .toEqual({ remote: { display: true } });
      });

      it('should emit changeRemoteRuler game event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeRemoteRuler', { display: true });
      });
    });

    describe('setMaxLength(<start>, <end>, <scope>)', function() {
      using([
        [ 'set', 'get'],
        [ 42   , 42   ],
        [ null , 0    ],
      ], function(e, d) {
        it('should set local ruler max length, '+d, function() {
          this.ruler = {};
          this.ruler = this.gameRulerService.setMaxLength(e.set, this.ruler);
          expect(this.gameRulerService.maxLength(this.ruler))
            .toBe(e.get);
        });
      });
    });

    when('setLocal(<start>, <end>, <scope>)', function() {
      this.ret = this.gameRulerService.setLocal(this.start, this.end,
                                                this.scope, this.ruler);
    }, function() {
      beforeEach(function() {
        this.start = { x: 100, y: 0 };
        this.end = { x: 100, y: 100 };
        this.ruler = { local: {}  };
      });

      it('should set local ruler state', function() {
        expect(this.ret)
          .toEqual({ local: { start: { x:100, y: 0},
                              end: { x: 100.00000000000001,
                                     y: 100 },
                              length: null,
                              display: true
                            }
                   });
      });

      it('should emit changeLocalRuler game event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeLocalRuler', { start: { x: 100, y: 0},
                                                      end: { x: 100.00000000000001,
                                                             y: 100 },
                                                      length: null,
                                                      display: true
                                                    });
      });

      when('with max length', function() {
        this.ruler = this.gameRulerService.setMaxLength(5, this.ruler);
      }, function() {
        it('should enforce max length', function() {
          expect(this.ret)
            .toEqual({ local: { max: 5,
                                start: { x:100, y: 0},
                                end: { x: 100,
                                       y: 50 },
                                length: null,
                                display: true
                              }
                     });
        });
      });
    });

    when('setRemote(<start>, <end>, <scope>)', function() {
      this.ret = this.gameRulerService.setRemote(this.start, this.end,
                                                 this.scope, this.ruler);
    }, function() {
      beforeEach(function() {
        this.pointService = spyOnService('point');
        this.pointService.distanceTo.and.callThrough();
        this.pointService.directionTo.and.callThrough();
        this.pointService.translateInDirection.and.callThrough();
        
        this.start = { x: 100, y: 0 };
        this.end = { x: 100, y: 100 };
        this.ruler = { local: {},
                       remote: {},
                     };
      });

      it('should reset local ruler state', function() {
        expect(this.ret.local)
          .toEqual({ display: false });
      });

      it('should set remote ruler state', function() {
        expect(this.ret.remote)
          .toEqual({ max: undefined,
                     origin: null,
                     target: null,
                     reached: null,
                     start: { x: 100, y: 0 },
                     end: { x: 100.00000000000001,
                            y: 100 },
                     length: 10,
                     display: true
                   });
      });

      it('should emit changeLocalRuler & changeRemoteRuler game events', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeLocalRuler', { display: false });
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeRemoteRuler', { max: undefined,
                                                       origin: null,
                                                       target: null,
                                                       reached: null,
                                                       start: { x: 100, y: 0 },
                                                       end: { x: 100.00000000000001,
                                                              y: 100 },
                                                       length: 10,
                                                       display: true
                                                     });
      });

      when('with max length', function() {
        this.ruler = this.gameRulerService.setMaxLength(5, this.ruler);
      }, function() {
        it('should enforce max length', function() {
          expect(this.ret.remote)
            .toEqual({ max: 5,
                       origin: null,
                       target: null,
                       reached: null,
                       start: { x: 100, y: 0},
                       end: { x: 100,
                              y: 50 },
                       length: 5,
                       display: true
                     });
        });
      });
    });

    describe('resetRemote(<state>, <scope>)', function() {
      beforeEach(function() {
        this.state = { state: 'state' };
        this.ret = this.gameRulerService.resetRemote(this.state, this.scope);
      });

      it('should reset remote state', function() {
        expect(this.ret)
          .toEqual({ remote: this.state });
        expect(this.ret.remote)
          .not.toBe(this.state);
      });

      it('should emit changeRemoteRuler game events', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeRemoteRuler', { state: 'state' });
      });
    });

    describe('saveRemoteState', function() {
      beforeEach(function() {
        this.ruler = {
          remote: { state: 'state' }
        };
        this.ret = this.gameRulerService.saveRemoteState(this.ruler);
      });

      it('should return a copy of remote state', function() {
        expect(this.ret)
          .toEqual(this.ruler.remote);
        expect(this.ret)
          .not.toBe(this.ruler.remote);
      });
    });

    when('setOrigin(<models>, <origin>, <scope>)', function() {
      this.ret = this.gameRulerService.setOrigin('models', this.origin,
                                                 this.scope, this.ruler);
    }, function() {
      beforeEach(function() {
        this.origin = { state: { stamp: 'origin' } };
        this.ruler = {
          remote: { target: null }
        };
      });

      it('should store ruler origin', function() {
        expect(this.gameRulerService.origin(this.ret))
          .toBe('origin');
      });

      it('refresh remote ruler', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeRemoteRuler', this.ret.remote);
      });

      when('ruler target is not set', function() {
        this.ruler.remote.target = null;
      }, function() {
        it('should not display ruler', function() {
          expect(this.gameRulerService.isDisplayed(this.ret))
            .toBeFalsy();
        });
      });

      when('ruler target is the same as <origin>', function() {
        this.ruler.remote.target = 'origin';
      }, function() {
        it('should reset ruler target', function() {
          expect(this.gameRulerService.target(this.ret))
            .toBe(null);
        });

        it('should not display ruler', function() {
          expect(this.gameRulerService.isDisplayed(this.ret))
            .toBeFalsy();
        });
      });

      when('ruler target is set and different from <origin>', function() {
        this.ruler.remote.target = 'target';
      }, function() {
        beforeEach(function() {
          this.scope.factions = 'factions';
          this.modelService.shortestLineTo._retVal = {
            start: { x: 240, y: 240 },
            end: { x: 120, y: 120 },
          };
        });
        
        it('should fetch shortest line between models', function() {
          expect(this.gameModelsService.findStamp)
            .toHaveBeenCalledWith('target', 'models');
          expect(this.modelService.shortestLineTo)
            .toHaveBeenCalledWith('factions',
                                  'gameModels.findStamp.returnValue',
                                  this.origin);
        });
        
        it('should display ruler', function() {
          expect(this.gameRulerService.isDisplayed(this.ret))
            .toBeTruthy();
          expect(this.ret.remote.start)
            .toEqual({ x: 240, y: 240 });
        });

        when('target model is within max range', function() {
          this.ruler.local = { max: 48 };
        }, function() {
          it('should display target reached', function() {
            expect(this.gameRulerService.targetReached(this.ret))
              .toBeTruthy();
            expect(this.ret.remote.end)
              .toEqual({ x: 120, y: 119.99999999999999 });
            expect(this.ret.remote.length)
              .toBe(16.97);
          });
        });

        when('target model is not within max range', function() {
          this.ruler.local = { max: 13 };
        }, function() {
          it('should display target not reached', function() {
            expect(this.gameRulerService.targetReached(this.ret))
              .toBeFalsy();
            expect(this.ret.remote.end)
              .toEqual({ x: 148.07611844574882, y: 148.07611844574882 });
            expect(this.ret.remote.length)
              .toBe(13.00);
          });
        });
      });
    });

    when('setTarget(<models>, <target>, <scope>)', function() {
      this.ret = this.gameRulerService.setTarget('models', this.target,
                                                 this.scope, this.ruler);
    }, function() {
      beforeEach(function() {
        this.target = { state: { stamp: 'target' } };
        this.ruler = {
          remote: { origin: null }
        };
      });

      it('should store ruler target', function() {
        expect(this.gameRulerService.target(this.ret))
          .toBe('target');
      });

      it('refresh remote ruler', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeRemoteRuler', this.ret.remote);
      });

      when('ruler origin is not set', function() {
        this.ruler.remote.origin = null;
      }, function() {
        it('should not display ruler', function() {
          expect(this.gameRulerService.isDisplayed(this.ret))
            .toBeFalsy();
        });
      });

      when('ruler origin is the same as <target>', function() {
        this.ruler.remote.origin = 'target';
      }, function() {
        it('should reset ruler target', function() {
          expect(this.gameRulerService.origin(this.ret))
            .toBe(null);
        });

        it('should not display ruler', function() {
          expect(this.gameRulerService.isDisplayed(this.ret))
            .toBeFalsy();
        });
      });

      when('ruler origin is set and different from <target>', function() {
        this.ruler.remote.origin = 'origin';
      }, function() {
        beforeEach(function() {
          this.scope.factions = 'factions';
          this.modelService.shortestLineTo._retVal = {
            start: { x: 240, y: 240 },
            end: { x: 120, y: 120 },
          };
        });
        
        it('should fetch shortest line between models', function() {
          expect(this.gameModelsService.findStamp)
            .toHaveBeenCalledWith('origin', 'models');
          expect(this.modelService.shortestLineTo)
            .toHaveBeenCalledWith('factions',
                                  this.target,
                                  'gameModels.findStamp.returnValue');
        });
        
        it('should display ruler', function() {
          expect(this.gameRulerService.isDisplayed(this.ret))
            .toBeTruthy();
          expect(this.ret.remote.start)
            .toEqual({ x: 240, y: 240 });
        });

        when('target model is within max range', function() {
          this.ruler.local = { max: 48 };
        }, function() {
          it('should display target reached', function() {
            expect(this.gameRulerService.targetReached(this.ret))
              .toBeTruthy();
            expect(this.ret.remote.end)
              .toEqual({ x: 120, y: 119.99999999999999 });
            expect(this.ret.remote.length)
              .toBe(16.97);
          });
        });

        when('target model is not within max range', function() {
          this.ruler.local = { max: 13 };
        }, function() {
          it('should display target not reached', function() {
            expect(this.gameRulerService.targetReached(this.ret))
              .toBeFalsy();
            expect(this.ret.remote.end)
              .toEqual({ x: 148.07611844574882, y: 148.07611844574882 });
            expect(this.ret.remote.length)
              .toBe(13.00);
          });
        });
      });
    });
  });
});
