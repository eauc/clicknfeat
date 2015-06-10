'use strict';

describe('misc model', function() {
  // describe('onModelsCommand service', function() {
  //   beforeEach(inject([
  //     'onModelsCommand',
  //     function(onModelsCommandService) {
  //       this.onModelsCommandService = onModelsCommandService;
  //       this.modelService = spyOnService('model');
  //       this.modelService.eventName.and.callThrough();
  //       this.gameModelsService = spyOnService('gameModels');
  //       this.gameModelsService.findStamp.and.callFake(function(s) {
  //         return { state: { stamp: s } };
  //       });
  //       this.gameModelSelectionService = spyOnService('gameModelSelection');
  //     }
  //   ]));

  //   when('execute(<method>, <..args..>, <stamps>, <scope>, <game>)', function() {
  //     this.ctxt = this.onModelsCommandService
  //       .execute('method', 'arg1', 'arg2', this.stamps, this.scope, this.game);
  //   }, function() {
  //     beforeEach(function() {
  //       this.stamps = ['stamp1', 'stamp2'];
  //       this.scope = jasmine.createSpyObj('scope', [
  //         'gameEvent'
  //       ]);
  //       this.game = { models: 'models',
  //                     model_selection: 'selection' };

  //       this.modelService.saveState.and.callFake(function(t) {
  //         return t.state.stamp+'State';
  //       });
  //       this.modelService.call.and.callFake(function(m, a1, a2, t) {
  //         t.state.stamp += 'After';
  //       });
  //     });

  //     it('should find <stamps> in game models', function() {
  //       expect(this.gameModelsService.findStamp)
  //         .toHaveBeenCalledWith('stamp1', 'models');
  //       expect(this.gameModelsService.findStamp)
  //         .toHaveBeenCalledWith('stamp2', 'models');
  //     });

  //     it('should save <stamps> states before change', function() {
  //       expect(this.ctxt.before)
  //         .toEqual(['stamp1State', 'stamp2State']);
  //     });

  //     it('should apply <method> on <stamps>', function() {
  //       expect(this.modelService.call)
  //         .toHaveBeenCalledWith('method', 'arg1', 'arg2', { state: { stamp: 'stamp1After' } });
  //       expect(this.modelService.call)
  //         .toHaveBeenCalledWith('method', 'arg1', 'arg2', { state: { stamp: 'stamp2After' } });
  //     });

  //     it('should save <stamps> states after change', function() {
  //       expect(this.ctxt.after)
  //         .toEqual(['stamp1AfterState', 'stamp2AfterState']);
  //     });

  //     it('should emit changeModel gameEvents', function() {
  //       expect(this.scope.gameEvent)
  //         .toHaveBeenCalledWith('changeModel-stamp1After');
  //       expect(this.scope.gameEvent)
  //         .toHaveBeenCalledWith('changeModel-stamp2After');
  //     });

  //     it('should return context', function() {
  //       expect(this.ctxt.desc)
  //         .toBe('method');
  //     });
  //   });

  //   when('replay(<ctxt>, <scope>, <game>)', function() {
  //     this.onModelsCommandService.replay(this.ctxt, this.scope, this.game);
  //   }, function() {
  //     beforeEach(function() {
  //       this.ctxt = {
  //         before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
  //         after: [ { stamp: 'after1' }, { stamp: 'after2' } ],
  //       };
  //       this.scope = jasmine.createSpyObj('scope', [
  //         'gameEvent'
  //       ]);
  //       this.game = { models: 'models',
  //                     model_selection: 'selection' };
  //     });

  //     it('should find <stamps> in game models', function() {
  //       expect(this.gameModelsService.findStamp)
  //         .toHaveBeenCalledWith('after1', 'models');
  //       expect(this.gameModelsService.findStamp)
  //         .toHaveBeenCalledWith('after2', 'models');
  //     });

  //     it('should set <after> states', function() {
  //       expect(this.modelService.setState)
  //         .toHaveBeenCalledWith({ stamp: 'after1' }, { state: { stamp: 'after1' } });
  //       expect(this.modelService.setState)
  //         .toHaveBeenCalledWith({ stamp: 'after2' }, { state: { stamp: 'after2' } });
  //     });

  //     it('should set remote modelSelection to modified models', function() {
  //       expect(this.gameModelSelectionService.set)
  //         .toHaveBeenCalledWith('remote', 'after2', this.scope, 'selection');
  //     });

  //     it('should emit changeModel gameEvents', function() {
  //       expect(this.scope.gameEvent)
  //         .toHaveBeenCalledWith('changeModel-after1');
  //       expect(this.scope.gameEvent)
  //         .toHaveBeenCalledWith('changeModel-after2');
  //     });
  //   });

  //   when('undo(<ctxt>, <scope>, <game>)', function() {
  //     this.onModelsCommandService.undo(this.ctxt, this.scope, this.game);
  //   }, function() {
  //     beforeEach(function() {
  //       this.ctxt = {
  //         before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
  //         after: [ { stamp: 'after1' }, { stamp: 'after2' } ],
  //       };
  //       this.scope = jasmine.createSpyObj('scope', [
  //         'gameEvent'
  //       ]);
  //       this.game = { models: 'models',
  //                     model_selection: 'selection' };
  //     });

  //     it('should find <stamps> in game models', function() {
  //       expect(this.gameModelsService.findStamp)
  //         .toHaveBeenCalledWith('before1', 'models');
  //       expect(this.gameModelsService.findStamp)
  //         .toHaveBeenCalledWith('before2', 'models');
  //     });

  //     it('should set <before> states', function() {
  //       expect(this.modelService.setState)
  //         .toHaveBeenCalledWith({ stamp: 'before1' }, { state: { stamp: 'before1' } });
  //       expect(this.modelService.setState)
  //         .toHaveBeenCalledWith({ stamp: 'before2' }, { state: { stamp: 'before2' } });
  //     });

  //     it('should set remote modelSelection to modified models', function() {
  //       expect(this.gameModelSelectionService.set)
  //         .toHaveBeenCalledWith('remote', 'before2', this.scope, 'selection');
  //     });

  //     it('should emit changeModel gameEvents', function() {
  //       expect(this.scope.gameEvent)
  //         .toHaveBeenCalledWith('changeModel-before1');
  //       expect(this.scope.gameEvent)
  //         .toHaveBeenCalledWith('changeModel-before2');
  //     });
  //   });
  // });

  describe('gameModels service', function() {
    beforeEach(inject([
      'gameModels',
      function(gameModelsService) {
        this.gameModelsService = gameModelsService;
        // this.modelService = spyOnService('model');
      }
    ]));

    describe('findStamp(<stamp>)', function() {
      beforeEach(function() {
        this.models = {
          active: [
            { state: { stamp: 'stamp1' } },
            { state: { stamp: 'stamp2' } },
          ],
          locked: [
            { state: { stamp: 'stamp3' } },
          ],
        };
      });

      using([
        [ 'stamp' ],
        [ 'stamp2' ],
        [ 'stamp3' ],
      ], function(e, d) {
        it('should find <stamp> in models', function() {
          expect(this.gameModelsService.findStamp(e.stamp, this.models))
            .toEqual({ state: { stamp: e.stamp } });
        });
      });
    });
    
  //   describe('onStamp(<stamp>, <method>, <...args...>)', function() {
  //     beforeEach(function() {
  //       this.models = {
  //         active: [
  //           { state: { stamp: 'stamp1' } },
  //           { state: { stamp: 'stamp2' } },
  //         ],
  //         locked: [
  //           { state: { stamp: 'stamp3' } },
  //         ],
  //       };
  //     });

  //     it('should call <method> on <stamp> model', function() {
  //       this.gameModelsService.onStamp('stamp2',
  //                                         'method', 'arg1', 'arg2',
  //                                         this.models);
  //       expect(this.modelService.call)
  //         .toHaveBeenCalledWith('method', 'arg1', 'arg2',
  //                               { state: { stamp: 'stamp2' } });

  //       this.gameModelsService.onStamp('stamp3',
  //                                         'method',
  //                                         this.models);
  //       expect(this.modelService.call)
  //         .toHaveBeenCalledWith('method',
  //                               { state: { stamp: 'stamp3' } });
  //     });
  //   });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
      }
    ]));

    describe('saveState()', function() {
      it('should return a copy of model\'s state', function() {
        var model = { state: { stamp: 'stamp' } };
        var ret = this.modelService.saveState(model);
        expect(ret).toEqual({ stamp: 'stamp' });
        expect(ret).not.toBe(model.state);
      });
    });

    describe('setState(<state>)', function() {
      it('should set a copy of <state> as model\'s state', function() {
        var model = { state: null };
        var state = { stamp: 'stamp' };
        this.modelService.setState(state, model);
        expect(model.state).toEqual(state);
        expect(model.state).not.toBe(state);
      });
    });
  });
});
