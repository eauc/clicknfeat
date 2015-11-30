'use strict';

describe('user ruler', function() {
  describe('defaultMode service', function() {
    beforeEach(inject([ 'defaultMode', function(defaultMode) {
      this.defaultModeService = defaultMode;
      this.modesService = spyOnService('modes');

      this.scope = {
        modes: 'modes',
        doSwitchToMode: jasmine.createSpy('doSwitchToMode'),
      };
    }]));

    when('user uses ruler', function() {
      this.defaultModeService.actions.enterRulerMode(this.scope);
    }, function() {
      it('should switch to ruler mode', function() {
        expect(this.scope.doSwitchToMode)
          .toHaveBeenCalledWith('Ruler');
      });
    });
  });

  describe('rulerMode service', function() {
    beforeEach(inject([ 'rulerMode', function(rulerMode) {
      this.rulerModeService = rulerMode;

      this.modesService = spyOnService('modes');

      this.gameService = spyOnService('game');
      mockReturnPromise(this.gameService.executeCommand);
      this.gameService.executeCommand.resolveWith = 'game.executeCommand.returnValue';
      
      this.gameRulerService = spyOnService('gameRuler');

      this.modelService = spyOnService('model');

      this.gameModelsService = spyOnService('gameModels');
      mockReturnPromise(this.gameModelsService.findStamp);
      this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';

      this.gameModelSelectionService = spyOnService('gameModelSelection');

      this.scope = { modes: 'modes',
                     game: { ruler: 'ruler',
                             models: 'models',
                             model_selection: 'selection'
                           },
                     gameEvent: jasmine.createSpy('gameEvent'),
                     $digest: jasmine.createSpy('$digest'),
                   };
    }]));

    when('user starts using ruler', function() {
      this.ret = this.rulerModeService
        .onEnter(this.scope);
    }, function() {
      when('there is exactly one model selected', function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
      }, function() {
        it('should set selected model as origin', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameModelSelectionService.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('stamp', 'models');

            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('setRuler', 'setOriginResetTarget',
                                    'gameModels.findStamp.returnValue',
                                    this.scope, this.scope.game);
          });
        });
      });
    });

    when('user set ruler max length', function() {
      this.ret = this.rulerModeService.actions.setMaxLength(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameRulerService.origin._retVal = null;
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
        when('user validates prompt, '+d, function() {
          this.promptService.prompt.resolveWith = e.value;
        }, function() {
          it('should set ruler max length', function() {
            this.thenExpect(this.ret, function(result) {
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('setRuler', 'setMaxLength', e.max,
                                      this.scope, this.scope.game);
              expect(result).toBe('game.executeCommand.returnValue');
            });
          });

          when('ruler has origin model', function() {
            this.gameRulerService.origin._retVal = 'origin';
          }, function() {
            it('should set origin model\'s ruler max length', function() {
              this.thenExpect(this.ret, function(result) {
                expect(this.gameService.executeCommand)
                  .toHaveBeenCalledWith('onModels', 'setRulerMaxLength', e.max,
                                        ['origin'], this.scope, this.scope.game);
              });
            });
          });
        });
      });

      when('user cancel prompt', function() {
        this.promptService.prompt.rejectWith = 'canceled';
      }, function() {
        it('should reset ruler max length', function() {
          this.thenExpect(this.ret, function(result) {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('setRuler', 'setMaxLength', null,
                                    this.scope, this.scope.game);
            expect(result).toBe('game.executeCommand.returnValue');
          });
        });

        when('ruler has origin model', function() {
          this.gameRulerService.origin._retVal = 'origin';
        }, function() {
          it('should reset origin model\'s ruler max length', function() {
            this.thenExpect(this.ret, function(result) {
              expect(this.gameService.executeCommand)
                .toHaveBeenCalledWith('onModels', 'setRulerMaxLength', null,
                                      ['origin'], this.scope, this.scope.game);
            });
          });
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
    
    when('user endDrags ruler', function() {
      this.drag = { start: 'start', now: 'now' };
      this.rulerModeService.actions.dragEndMap(this.scope, this.drag);
    }, function() {
      it('should execute setRemote command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setRuler',
                                'setRemote', 'start', 'now',
                                this.scope, this.scope.game);
      });
    });

    when('user set ruler origin', function() {
      this.ret = this.rulerModeService.actions
        .setOriginModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.target = { state: { stamp: 'stamp' } };
        this.event = { 'click#': { target: this.target } };
      });
      
      it('should set ruler origin model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setRuler',
                                'setOrigin', this.target,
                                this.scope, this.scope.game);
        this.thenExpect(this.ret, function(result) {
          expect(result)
            .toBe('game.executeCommand.returnValue');
        });
      });
    });

    when('user set ruler target', function() {
      this.ret = this.rulerModeService.actions
        .setTargetModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.target = { state: { stamp: 'stamp' } };
        this.event = { 'click#': { target: this.target } };
      });
      
      it('should set ruler target model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setRuler',
                                'setTarget', this.target,
                                this.scope, this.scope.game);
        this.thenExpect(this.ret, function(result) {
          expect(result)
            .toBe('game.executeCommand.returnValue');
        });
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

    when('execute(<method>, <...args...>, <scope>, <game>)', function() {
      this.ret = this.setRulerCommandService
        .execute(this.method, 'args', this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { ruler: 'ruler' };
      });

      when('<method> does not exist', function() {
        this.method = 'unknown';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Ruler unknown method unknown');
          });
        });
      });
      
      when('<method> exists', function() {
        this.method = 'setRemote';
      }, function() {
        it('should save previous remote ruler state', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(ctxt.before).toEqual('rulerSave');
          });
        });
        
        it('should apply <method> on game ruler', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameRulerService.setRemote)
              .toHaveBeenCalledWith('args', this.scope, 'ruler');
            expect(this.game.ruler)
              .toBe('gameRuler.setRemote.returnValue');
          });
        });
        
        it('should save new remote ruler state', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(ctxt.after)
              .toBe('gameRuler.setRemote.returnValueSave');
          });
        });
      });
    });

    using([
      [ 'method', 'previous', 'result' ],
      [ 'replay', 'before'  , 'after'  ],
      [ 'undo'  , 'after'   , 'before' ],
    ], function(e, d) {
      when(e.method+'(<ctxt>, <scope>, <game>)', function() {
        this.setRulerCommandService[e.method](this.ctxt, this.scope, this.game);
      }, function() {
        beforeEach(function() {
          this.ctxt = {
            before: 'before',
            after: 'after'
          };
          this.game = { 'ruler': e.previous };
        });
      
        it('should set game remote ruler', function() {
          expect(this.gameRulerService.resetRemote)
            .toHaveBeenCalledWith(e.result, this.scope, e.previous);
          expect(this.game.ruler)
            .toBe('gameRuler.resetRemote.returnValue');
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
      this.scope.factions = 'factions';
      this.scope.game = { models: 'models' };

      mockReturnPromise(this.gameModelsService.findStamp);
      this.gameModelsService.findStamp.resolveWith = R.bind(function(s, m) {
        return ( s === 'origin' ? this.origin_model :
                 ( s === 'target' ? this.target_model : null )
               );
      }, this);
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
          .toHaveBeenCalledWith('changeRemoteRuler');
      });
    });

    when('setMaxLength(<start>, <end>, <scope>)', function() {
      this.ret = this.gameRulerService
        .setMaxLength(this.length, this.scope, this.ruler);
    }, function() {
      beforeEach(function() {
        this.ruler = this.gameRulerService.create();
        this.ruler.remote.start = { x: 240, y: 240 };
        this.ruler.remote.end = { x: 360, y: 240 };
        this.ruler.remote.origin = 'origin';
        this.ruler.remote.target = 'target';
        this.length = 5;
      });
      
      it('should set ruler max length', function() {
        this.thenExpect(this.ret, function(result) {
          expect(result.local.max)
            .toBe(this.length);
          expect(this.gameRulerService.maxLength(result))
            .toBe(this.length);
        });
      });

      it('should look up ruler origin & target', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.gameModelsService.findStamp)
            .toHaveBeenCalledWith('origin', 'models');
          expect(this.gameModelsService.findStamp)
            .toHaveBeenCalledWith('target', 'models');
        });
      });

      when('neither target nor origin is set', function() {
        this.origin_model = null;
        this.target_model = null;
      }, function() {
        using([
          [ 'max_length', 'length', 'reached', 'end' ],
          [ 5           , 5       , false    , { x: 290, y: 240 } ],
          [ 140         , 12      , true     , { x: 360, y: 240 } ],
          [ null        , 12      , true     , { x: 360, y: 240 } ],
        ], function(e, d) {
          when(d, function() {
            this.length = e.max_length;
          }, function() {
            it('should set ruler according to start/end points', function() {
              this.thenExpect(this.ret, function(result) {
                expect(result.remote.start)
                  .toEqual(this.ruler.remote.start);
                expect(result.remote.end)
                  .toEqual(e.end);
                expect(result.remote.length)
                  .toEqual(e.length);
                expect(result.remote.reached)
                  .toEqual(e.reached);
              });
            });
          });
        });
      });

      using([
        [ 'only' ],
        [ 'origin' ],
        [ 'target' ],
      ], function(e, d) {
        when('only '+e.only+' is set', function() {
          this[e.only+'_model'] = { state: { x: 120, y: 120 } };
        }, function() {
          it('should set ruler on '+e.only, function() {
            this.thenExpect(this.ret, function(result) {
              expect(result.remote.start)
                .toEqual(this[e.only+'_model'].state);
            expect(result.remote.end)
              .toEqual(this[e.only+'_model'].state);
              expect(result.remote.length)
                .toEqual(0);
              expect(result.remote.reached)
                .toEqual(true);
            });
          });
        });
      });
      
      when('only both origin and target are set', function() {
        this.origin_model = 'origin_model';
        this.target_model = 'target_model';
      }, function() {
        beforeEach(function() {
          this.modelService.shortestLineTo._retVal = {
            start: { x: 120, y: 120 },
            end:   { x: 120, y: 240 },
          };
        });
        
        using([
          [ 'max_length', 'length', 'reached', 'end' ],
          [ 5           , 5       , false    , { x: 120, y: 170 } ],
          [ 140         , 12      , true     , { x: 120.00000000000001, y: 240 } ],
          [ null        , 12      , true     , { x: 120.00000000000001, y: 240 } ],
        ], function(e, d) {
          when(d, function() {
            this.length = e.max_length;
          }, function() {
            it('should set ruler according to origin/target models', function() {
              this.thenExpect(this.ret, function(result) {
                expect(this.modelService.shortestLineTo)
                  .toHaveBeenCalledWith('factions', 'target_model', 'origin_model');
                
                expect(result.remote.start)
                  .toEqual({ x: 120, y: 120 });
                expect(result.remote.end)
                  .toEqual(e.end);
                expect(result.remote.length)
                  .toEqual(e.length);
                expect(result.remote.reached)
                  .toEqual(e.reached);
              });
            });
          });
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
          .toHaveBeenCalledWith('changeLocalRuler');
      });

      when('with max length', function() {
        this.ruler.local.max = 5;
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
        this.thenExpect(this.ret, function(result) {
          expect(result.local)
            .toEqual({ display: false });
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeLocalRuler');
        });
      });

      it('should set remote ruler state', function() {
        this.thenExpect(this.ret, function(result) {
          expect(result.remote)
            .toEqual({ origin: null,
                       target: null,
                       start: { x: 100, y: 0 },
                       end: { x: 100.00000000000001,
                              y: 100 },
                       length: 10,
                       reached: true,
                       display: true
                     });
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeRemoteRuler');
        });
      });

      when('with max length', function() {
        this.ruler.remote.max = 5;
      }, function() {
        it('should enforce max length', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result.remote)
              .toEqual({ max: 5,
                         origin: null,
                         target: null,
                         start: { x: 100, y: 0},
                         end: { x: 100,
                                y: 50 },
                         length: 5,
                         reached: false,
                         display: true
                       });
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
          .toHaveBeenCalledWith('changeRemoteRuler');
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
      this.ret = this.gameRulerService
        .setOrigin(this.origin, this.scope, this.ruler);
    }, function() {
      beforeEach(function() {
        this.origin = { state: { stamp: 'origin' } };
        this.ruler = {
          remote: { max: null,
                    target: null
                  }
        };
        this.modelService.rulerMaxLength._retVal = null;
      });

      when('only origin is set', function() {
        this.origin_model = { state: { x: 240, y: 240 } };
        this.ruler.remote.target = null;
      }, function() {
        it('should set ruler on origin', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result.remote.start)
              .toEqual(this.origin_model.state);
            expect(result.remote.end)
              .toEqual(this.origin_model.state);
            expect(result.remote.length)
              .toEqual(0);
            expect(result.remote.reached)
              .toEqual(true);
            expect(result.remote.display)
              .toBe(false);
          });
        });
      });

      when('target is the same as origin', function() {
        this.origin_model = { state: { x: 240, y: 240 } };
        this.ruler.remote.target = 'origin';
      }, function() {
        it('should set ruler on origin and reset target', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result.remote.start)
              .toEqual(this.origin_model.state);
            expect(result.remote.end)
              .toEqual(this.origin_model.state);
            expect(result.remote.length)
              .toEqual(0);
            expect(result.remote.reached)
              .toEqual(true);
            expect(result.remote.display)
              .toBe(false);
            expect(result.remote.target)
              .toBe(null);
          });
        });
      });
      
      when('both origin and target are set', function() {
        this.ruler.remote.origin = 'origin';
        this.ruler.remote.target = 'target';
        this.origin_model = 'origin_model';
        this.target_model = 'target_model';
      }, function() {
        beforeEach(function() {
          this.modelService.shortestLineTo._retVal = {
            start: { x: 120, y: 120 },
            end:   { x: 120, y: 240 },
          };
        });
        
        using([
          [ 'max_length', 'length', 'reached', 'end' ],
          [ 5           , 5       , false    , { x: 120, y: 170 } ],
          [ 140         , 12      , true     , { x: 120.00000000000001, y: 240 } ],
          [ null        , 12      , true     , { x: 120.00000000000001, y: 240 } ],
        ], function(e, d) {
          when(d, function() {
            this.ruler.remote.max = e.max_length;
          }, function() {
            it('should set ruler according to origin/target models', function() {
              this.thenExpect(this.ret, function(result) {
                expect(this.modelService.shortestLineTo)
                  .toHaveBeenCalledWith('factions', 'target_model', 'origin_model');
                
                expect(result.remote.start)
                  .toEqual({ x: 120, y: 120 });
                expect(result.remote.end)
                  .toEqual(e.end);
                expect(result.remote.length)
                  .toEqual(e.length);
                expect(result.remote.reached)
                  .toEqual(e.reached);
                expect(result.remote.display)
                  .toEqual(true);
              });
            });
          });
        });
        
        using([
          [ 'max_length', 'length', 'reached', 'end' ],
          [ 5           , 5       , false    , { x: 120, y: 170 } ],
          [ 140         , 12      , true     , { x: 120.00000000000001, y: 240 } ],
          [ null        , 12      , true     , { x: 120.00000000000001, y: 240 } ],
        ], function(e, d) {
          when('origin model\'s rulerMaxLength is '+e.max_length, function() {
            this.modelService.rulerMaxLength._retVal = e.max_length;
          }, function() {
            it('should set ruler according to origin\'s rulerMaxLength', function() {
              this.thenExpect(this.ret, function(result) {
                expect(this.modelService.shortestLineTo)
                  .toHaveBeenCalledWith('factions', 'target_model', 'origin_model');

                expect(result.remote.max)
                  .toBe(e.max_length);
                expect(result.remote.start)
                  .toEqual({ x: 120, y: 120 });
                expect(result.remote.end)
                  .toEqual(e.end);
                expect(result.remote.length)
                  .toEqual(e.length);
                expect(result.remote.reached)
                  .toEqual(e.reached);
                expect(result.remote.display)
                  .toEqual(true);
              });
            });
          });
        });
      });
    });

    when('setOriginResetTarget(<models>, <origin>, <scope>)', function() {
      this.ret = this.gameRulerService
        .setOriginResetTarget(this.origin, this.scope, this.ruler);
    }, function() {
      beforeEach(function() {
        this.origin = { state: { stamp: 'origin' } };
        this.origin_model = { state: { x: 240, y: 240 } };
        this.ruler = {
          remote: { max: null,
                    target: null
                  }
        };
        this.modelService.rulerMaxLength._retVal = null;
      });

      it('should set ruler on origin and reset target', function() {
        this.thenExpect(this.ret, function(result) {
          expect(result.remote.start)
            .toEqual(this.origin_model.state);
          expect(result.remote.end)
            .toEqual(this.origin_model.state);
          expect(result.remote.length)
            .toEqual(0);
          expect(result.remote.reached)
            .toEqual(true);
          expect(result.remote.display)
            .toBe(false);
          expect(result.remote.target)
            .toBe(null);
        });
      });

      when('origin model has a rulerMaxLength', function() {
        this.modelService.rulerMaxLength._retVal = 42;
      }, function() {
        it('should init ruler max lenght', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result.remote.max)
              .toBe(42);
          });
        });
      });
    });

    when('setTarget(<models>, <target>, <scope>)', function() {
      this.ret = this.gameRulerService
        .setTarget(this.target, this.scope, this.ruler);
    }, function() {
      beforeEach(function() {
        this.target = { state: { stamp: 'target' } };
        this.ruler = {
          remote: { max: null,
                    target: null
                  }
        };
      });

      when('only target is set', function() {
        this.target_model = { state: { x: 240, y: 240 } };
        this.ruler.remote.origin = null;
      }, function() {
        it('should set ruler on target', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result.remote.start)
              .toEqual(this.target_model.state);
            expect(result.remote.end)
              .toEqual(this.target_model.state);
            expect(result.remote.length)
              .toEqual(0);
            expect(result.remote.reached)
              .toEqual(true);
            expect(result.remote.display)
              .toBe(false);
          });
        });
      });

      when('target is the same as origin', function() {
        this.target_model = { state: { x: 240, y: 240 } };
        this.ruler.remote.origin = 'target';
      }, function() {
        it('should set ruler on target and reset origin', function() {
          this.thenExpect(this.ret, function(result) {
            expect(result.remote.start)
              .toEqual(this.target_model.state);
            expect(result.remote.end)
              .toEqual(this.target_model.state);
            expect(result.remote.length)
              .toEqual(0);
            expect(result.remote.reached)
              .toEqual(true);
            expect(result.remote.display)
              .toBe(false);
            expect(result.remote.origin)
              .toBe(null);
          });
        });
      });
      
      when('both origin and target are set', function() {
        this.ruler.remote.origin = 'origin';
        this.ruler.remote.target = 'target';
        this.origin_model = 'origin_model';
        this.target_model = 'target_model';
      }, function() {
        beforeEach(function() {
          this.modelService.shortestLineTo._retVal = {
            start: { x: 120, y: 120 },
            end:   { x: 120, y: 240 },
          };
        });
        
        using([
          [ 'max_length', 'length', 'reached', 'end' ],
          [ 5           , 5       , false    , { x: 120, y: 170 } ],
          [ 140         , 12      , true     , { x: 120.00000000000001, y: 240 } ],
          [ null        , 12      , true     , { x: 120.00000000000001, y: 240 } ],
        ], function(e, d) {
          when(d, function() {
            this.ruler.remote.max = e.max_length;
          }, function() {
            it('should set ruler according to origin/target models', function() {
              this.thenExpect(this.ret, function(result) {
                expect(this.modelService.shortestLineTo)
                  .toHaveBeenCalledWith('factions', 'target_model', 'origin_model');
                
                expect(result.remote.start)
                  .toEqual({ x: 120, y: 120 });
                expect(result.remote.end)
                  .toEqual(e.end);
                expect(result.remote.length)
                  .toEqual(e.length);
                expect(result.remote.reached)
                  .toEqual(e.reached);
                expect(result.remote.display)
                  .toEqual(true);
              });
            });
          });
        });
      });
    });
  });
});
