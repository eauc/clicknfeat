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
                     game: { ruler: 'ruler' }
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
                                this.scope, { ruler: 'ruler' });
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
    }]));

    describe('execute(<method>, <...args...>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.game = { ruler: 'ruler' };
        this.ctxt = this.setRulerCommandService.execute('setRemote', 'args',
                                                        'scope', this.game);
      });
      
      it('should save previous remote ruler state', function() {
        expect(this.ctxt.before).toEqual('rulerSave');
      });
      
      it('should apply <method> on game ruler', function() {
        expect(this.gameRulerService.setRemote)
          .toHaveBeenCalledWith('args', 'scope', 'ruler');
        expect(this.game.ruler)
          .toBe('gameRuler.setRemote.returnValue');
      });

      it('should save new remote ruler state', function() {
        expect(this.ctxt.after)
          .toBe('gameRuler.setRemote.returnValueSave');
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

          this.setRulerCommandService[e.method](this.ctxt, 'scope', this.game);
        });
      
        it('should set game remote ruler', function() {
          expect(this.gameRulerService.resetRemote)
            .toHaveBeenCalledWith(e.result, 'scope', e.previous);
          expect(this.game.ruler)
            .toBe('gameRuler.resetRemote.returnValue');
        });
      });
    });
  });

  describe('gameRuler service', function() {
    beforeEach(inject([ 'gameRuler', function(gameRulerService) {
      this.gameRulerService = gameRulerService;
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

    describe('setLocal(<start>, <end>, <scope>)', function() {
      beforeEach(function() {
        this.ret = this.gameRulerService.setLocal('start', 'end',
                                                  this.scope, {
                                                    local: { }
                                                  });
      });

      it('should set local ruler state', function() {
        expect(this.ret)
          .toEqual({ local: { start: 'start',
                              end: 'end',
                              length: null,
                              display: true
                            }
                   });
      });

      it('should emit changeLocalRuler game event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeLocalRuler', { start: 'start',
                                                      end: 'end',
                                                      length: null,
                                                      display: true
                                                    });
      });
    });

    describe('setRemote(<start>, <end>, <scope>)', function() {
      beforeEach(function() {
        this.pointService = spyOnService('point');
        this.pointService.distanceTo._retVal = 12.3456;
        
        this.ret = this.gameRulerService.setRemote('start', 'end',
                                                  this.scope, {
                                                    local: {},
                                                    remote: {},
                                                  });
      });

      it('should reset local ruler state', function() {
        expect(this.ret.local)
          .toEqual({ display: false });
      });

      it('should set remote ruler state', function() {
        expect(this.ret.remote)
          .toEqual({ start: 'start',
                     end: 'end',
                     length: 12.35,
                     display: true
                   });
      });

      it('should emit changeLocalRuler & changeRemoteRuler game events', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeLocalRuler', { display: false });
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeRemoteRuler', { start: 'start',
                                                       end: 'end',
                                                       length: 12.35,
                                                       display: true
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
  });
});
