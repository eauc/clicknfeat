'use strict';

describe('game los', function() {
  describe('defaultMode service', function() {
    beforeEach(inject([ 'defaultMode', function(defaultMode) {
      this.defaultModeService = defaultMode;
      this.modesService = spyOnService('modes');

      this.scope = {
        modes: 'modes',
        doSwitchToMode: jasmine.createSpy('doSwitchToMode'),
      };
    }]));

    when('user uses los', function() {
      this.defaultModeService.actions.enterLosMode(this.scope);
    }, function() {
      it('should switch to los mode', function() {
        expect(this.scope.doSwitchToMode)
          .toHaveBeenCalledWith('LoS');
      });
    });
  });

  describe('losMode service', function() {
    beforeEach(inject([ 'losMode', function(losMode) {
      this.losModeService = losMode;

      // this.modesService = spyOnService('modes');

      this.gameService = spyOnService('game');
      mockReturnPromise(this.gameService.executeCommand);
      this.gameService.executeCommand.resolveWith = 'game.executeCommand.returnValue';
      
      this.gameLosService = spyOnService('gameLos');

      // this.modelService = spyOnService('model');

      this.gameModelsService = spyOnService('gameModels');
      mockReturnPromise(this.gameModelsService.findStamp);
      this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';

      this.gameModelSelectionService = spyOnService('gameModelSelection');

      this.scope = { // modes: 'modes',
                     game: { los: 'los',
                             models: 'models',
                             model_selection: 'selection'
                           },
                     gameEvent: jasmine.createSpy('gameEvent'),
                     // $digest: jasmine.createSpy('$digest'),
                   };
    }]));

    when('user starts using los', function() {
      this.ret = this.losModeService
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
              .toHaveBeenCalledWith('setLos', 'setOriginResetTarget',
                                    'gameModels.findStamp.returnValue',
                                    this.scope, this.scope.game);
          });
        });
      });
    });

    when('user stops using los', function() {
      this.ret = this.losModeService
        .onLeave(this.scope);
    }, function() {
      it('should update Los state', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeRemoteLos', this.scope.game.los);
      });
    });

    using([
      ['action'],
      ['dragStartMap'],
      ['dragMap'],
    ], function(e, d) {
      when('user drags los, '+d, function() {
        this.drag = { start: 'start', now: 'now' };
        this.losModeService.actions[e.action](this.scope, this.drag);
      }, function() {
        it('should init local los', function() {
          expect(this.gameLosService.setLocal)
            .toHaveBeenCalledWith('start', 'now',
                                  this.scope, 'los');
          expect(this.scope.game.los)
            .toBe('gameLos.setLocal.returnValue');
        });
      });
    });
    
    when('user endDrags los', function() {
      this.drag = { start: 'start', now: 'now' };
      this.losModeService.actions
        .dragEndMap(this.scope, this.drag);
    }, function() {
      it('should execute setRemote command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setLos',
                                'setRemote', 'start', 'now',
                                this.scope, this.scope.game);
      });
    });

    when('user set los origin', function() {
      this.ret = this.losModeService.actions
        .setOriginModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.target = { state: { stamp: 'stamp' } };
        this.event = { 'click#': { target: this.target } };
      });
      
      it('should set los origin model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setLos',
                                'setOrigin', this.target,
                                this.scope, this.scope.game);
        this.thenExpect(this.ret, function(result) {
          expect(result)
            .toBe('game.executeCommand.returnValue');
        });
      });
    });

    when('user set los target', function() {
      this.ret = this.losModeService.actions
        .setTargetModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.target = { state: { stamp: 'stamp' } };
        this.event = { 'click#': { target: this.target } };
      });
      
      it('should set los target model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setLos',
                                'setTarget', this.target,
                                this.scope, this.scope.game);
        this.thenExpect(this.ret, function(result) {
          expect(result)
            .toBe('game.executeCommand.returnValue');
        });
      });
    });

    when('user toggle ignore model', function() {
      this.ret = this.losModeService.actions
        .toggleIgnoreModel(this.scope, this.event);
    }, function() {
      beforeEach(function() {
        this.target = { state: { stamp: 'stamp' } };
        this.event = { 'click#': { target: this.target } };
      });
      
      it('should toggle ignore model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setLos',
                                'toggleIgnoreModel', this.target,
                                this.scope, this.scope.game);
        this.thenExpect(this.ret, function(result) {
          expect(result)
            .toBe('game.executeCommand.returnValue');
        });
      });
    });
  });

  describe('setLosCommand service', function() {
    beforeEach(inject([ 'setLosCommand', function(setLosCommand) {
      this.setLosCommandService = setLosCommand;
      this.gameLosService = spyOnService('gameLos');
      this.gameLosService.saveRemoteState.and.callFake(function(r) {
        return r+'Save';
      });
      mockReturnPromise(this.gameLosService.resetRemote);
      this.gameLosService.resetRemote.resolveWith = 'gameLos.resetRemote.returnValue';
      
      this.scope = jasmine.createSpyObj('scope', [
        'gameEvent',
      ]);
    }]));

    when('execute(<method>, <...args...>, <scope>, <game>)', function() {
      this.ret = this.setLosCommandService
        .execute(this.method, 'args', this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { los: 'los' };
      });

      when('<method> does not exist', function() {
        this.method = 'unknown';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Los unknown method unknown');
          });
        });
      });
      
      when('<method> exists', function() {
        this.method = 'setRemote';
      }, function() {
        it('should save previous remote los state', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(ctxt.before).toEqual('losSave');
          });
        });
        
        it('should apply <method> on game los', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameLosService.setRemote)
              .toHaveBeenCalledWith('args', this.scope, this.game, 'los');
            expect(this.game.los)
              .toBe('gameLos.setRemote.returnValue');
          });
        });
        
        it('should save new remote los state', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(ctxt.after)
              .toBe('gameLos.setRemote.returnValueSave');
          });
        });
      });
    });

    using([
      [ 'method', 'previous', 'result' ],
      [ 'replay', 'before'  , 'after'  ],
      [ 'undo'  , 'after'   , 'before' ],
    ], function(e) {
      when(e.method+'(<ctxt>, <scope>, <game>)', function() {
        this.ret = this.setLosCommandService[e.method](this.ctxt, this.scope, this.game);
      }, function() {
        beforeEach(function() {
          this.ctxt = {
            before: 'before',
            after: 'after'
          };
          this.game = { 'los': e.previous };
        });
      
        it('should set game remote los', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameLosService.resetRemote)
              .toHaveBeenCalledWith(e.result, this.scope, this.game, e.previous);
            expect(this.game.los)
              .toBe('gameLos.resetRemote.returnValue');
          });
        });
      });
    });
  });

  describe('gameLos service', function() {
    beforeEach(inject([ 'gameLos', function(gameLosService) {
      this.gameLosService = gameLosService;

      this.modelService = spyOnService('model');
      this.gameModelsService = spyOnService('gameModels');

      this.game = { models: 'models' };
      this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
      this.scope.factions = 'factions';
      this.scope.game = this.game;

      mockReturnPromise(this.gameModelsService.findStamp);
      this.gameModelsService.findStamp.resolveWith = (s) => {
        return ( s === 'origin' ? this.origin_model :
                 ( s === 'target' ? this.target_model : null )
               );
      };
    }]));

    describe('toggleDisplay()', function() {
      beforeEach(function() {
        this.ret = this.gameLosService
          .toggleDisplay(this.scope, this.game, {
          remote: { display: false }
        });
      });

      it('should toggle remote los display', function() {
        this.thenExpect(this.ret, (result) => {
          expect(this.gameLosService.isDisplayed(result))
            .toEqual(true);
        });
      });

      it('should emit changeRemoteLos game event', function() {
        this.thenExpect(this.ret, (result) => {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeRemoteLos', result);
        });
      });
    });

    when('setLocal(<start>, <end>, <scope>)', function() {
      this.ret = this.gameLosService.setLocal(this.start, this.end,
                                                this.scope, this.los);
    }, function() {
      beforeEach(function() {
        this.start = { x: 100, y: 0 };
        this.end = { x: 100, y: 100 };
        this.los = { local: {}  };
      });

      it('should set local los state', function() {
        expect(this.ret)
          .toEqual({ local: { start: { x:100, y: 0},
                              end: { x: 100, y: 100 },
                              display: true
                            }
                   });
      });

      it('should emit changeLocalLos game event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeLocalLos');
      });
    });

    when('setRemote(<start>, <end>, <scope>)', function() {
      this.ret = this.gameLosService
        .setRemote(this.start, this.end, this.scope, this.game, this.los);
    }, function() {
      beforeEach(function() {
        this.pointService = spyOnService('point');
        this.pointService.distanceTo.and.callThrough();
        this.pointService.directionTo.and.callThrough();
        this.pointService.translateInDirection.and.callThrough();
        
        this.start = { x: 100, y: 0 };
        this.end = { x: 100, y: 100 };
        this.los = { local: {},
                       remote: {},
                     };
      });

      it('should reset local los state', function() {
        this.thenExpect(this.ret, (result) => {
          expect(result.local)
            .toEqual({ display: false });
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeLocalLos');
        });
      });

      it('should set remote los state', function() {
        this.thenExpect(this.ret, (result) => {
          expect(R.pick(['start', 'end', 'display'], result.remote))
            .toEqual({ start: { x: 100, y: 0 },
                       end: { x: 100, y: 100 },
                       display: true
                     });
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeRemoteLos', result);
        });
      });
    });

    describe('resetRemote(<state>, <scope>)', function() {
      beforeEach(function() {
        this.state = { state: 'state' };
        this.ret = this.gameLosService.resetRemote(this.state, this.scope);
      });

      it('should reset remote state', function() {
        this.thenExpect(this.ret, (result) => {
          expect(R.pick(['state'], result.remote))
            .toEqual(this.state);
          expect(result)
            .not.toBe(this.state);
        });
      });

      it('should emit changeRemoteLos game events', function() {
        this.thenExpect(this.ret, (result) => {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeRemoteLos', result);
        });
      });
    });

    describe('saveRemoteState', function() {
      beforeEach(function() {
        this.los = {
          remote: { state: 'state' }
        };
        this.ret = this.gameLosService.saveRemoteState(this.los);
      });

      it('should return a copy of remote state', function() {
        expect(this.ret)
          .toEqual(this.los.remote);
        expect(this.ret)
          .not.toBe(this.los.remote);
      });
    });

    when('clearOrigin(<scope>)', function() {
      this.ret = this.gameLosService
        .clearOrigin(this.scope, this.game, this.los);
    }, function() {
      beforeEach(function() {
        this.los = this.gameLosService.create();
        this.los.remote.origin = 'origin';
      });

      it('should clear origin', function() {
        this.thenExpect(this.ret, (result) => {
          expect(this.gameLosService.origin(result))
            .toBe(null);
        });
      });

      it('should reset envelopes', function() {
        this.thenExpect(this.ret, (result) => {
          expect(result.computed.envelope)
          .toBe(null);
          expect(result.computed.darkness)
            .toEqual([]);
          expect(result.computed.shadow)
            .toEqual([]);
          expect(result.remote.ignore)
            .toEqual([]);
        });
      });
    });

    when('clearTarget(<scope>)', function() {
      this.ret = this.gameLosService
        .clearTarget(this.scope, this.game, this.los);
    }, function() {
      beforeEach(function() {
        this.los = this.gameLosService.create();
        this.los.remote.target = 'target';
      });

      it('should clear origin', function() {
        this.thenExpect(this.ret, (result) => {
          expect(this.gameLosService.target(result))
            .toBe(null);
        });
      });

      it('should reset envelopes', function() {
        this.thenExpect(this.ret, (result) => {
          expect(result.computed.envelope)
          .toBe(null);
          expect(result.computed.darkness)
            .toEqual([]);
          expect(result.computed.shadow)
            .toEqual([]);
          expect(result.remote.ignore)
            .toEqual([]);
        });
      });
    });

    when('setOriginResetTarget(<origin>, <scope>)', function() {
      this.ret = this.gameLosService
        .setOriginResetTarget(this.origin, this.scope, this.game, this.los);
    }, function() {
      beforeEach(function() {
        this.los = this.gameLosService.create();
        this.origin = { state: { stamp: 'origin' } };
      });

      it('should set origin & reset target', function() {
        this.thenExpect(this.ret, (result) => {
          expect(this.gameLosService.origin(result))
            .toBe('origin');
          expect(this.gameLosService.target(result))
            .toBe(null);
        });
      });

      it('should reset envelopes', function() {
        this.thenExpect(this.ret, (result) => {
          expect(result.computed.envelope)
          .toBe(null);
          expect(result.computed.darkness)
            .toEqual([]);
          expect(result.computed.shadow)
            .toEqual([]);
          expect(result.remote.ignore)
            .toEqual([]);
        });
      });
    });
  });
});
