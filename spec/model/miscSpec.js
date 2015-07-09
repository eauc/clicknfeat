'use strict';

describe('misc model', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelMode',
      function(modelModeService) {
        this.modelModeService = modelModeService;
        this.gameService = spyOnService('game');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions'
                     };
      }
    ]));

    describe('when user select all friendly models', function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1'];
        this.gameModelsService.findStamp._retVal = {
          state: { user: 'user' }
        };
        this.scope.game.models = {
          active: [
            { state: { stamp: 'a1', user: 'user' } },
            { state: { stamp: 'a2', user: 'other' } },
            { state: { stamp: 'a3', user: 'user' } },
            { state: { stamp: 'a4', user: 'other' } },
          ],
          locked: [
            { state: { stamp: 'l1', user: 'user' } },
            { state: { stamp: 'l2', user: 'other' } },
            { state: { stamp: 'l3', user: 'user' } },
            { state: { stamp: 'l4', user: 'other' } },
          ]
        };
        this.gameModelsService.all.and.callThrough();
        
        this.modelModeService.actions.selectAllFriendly(this.scope);
      });

      it('should fetch selected model', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', this.scope.game.models);
      });
      
      it('should select all models with the same user', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setModelSelection', 'set', [ 'a1', 'a3', 'l1', 'l3' ],
                                this.scope, this.scope.game);
      });
    });
  });

  describe('onModelsCommand service', function() {
    beforeEach(inject([
      'onModelsCommand',
      function(onModelsCommandService) {
        this.onModelsCommandService = onModelsCommandService;
        this.modelService = spyOnService('model');
        this.modelService.eventName.and.callThrough();
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelsService.findStamp.and.callFake(R.bind(function(s) {
          return { state: { stamp: s } };
        }, this));
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { models: 'models',
                      model_selection: 'selection' };
      }
    ]));

    when('execute(<method>, <..args..>, <stamps>, <scope>, <game>)', function() {
      this.ctxt = this.onModelsCommandService
        .execute(this.method, 'arg1', 'arg2', this.stamps, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2'];

        this.gameModelsService.onStamps.and.callFake(R.bind(function(m) {
          return this.gameModelsService.onStamps._retVal+'('+m+')';
        }, this));
      });

      when('modelService does not respond to <method> ', function() {
        this.method = 'whatever';
      }, function() {
        it('should do nothing', function() {
          expect(this.gameModelsService.onStamps)
            .not.toHaveBeenCalled();
        });

        it('should return Nil', function() {
          expect(this.ctxt)
            .toBe(undefined);
        });
      });
      
      when('modelService responds to <method> ', function() {
        this.method = 'setState';
      }, function() {
        it('should save <stamps> states before change', function() {
          expect(this.gameModelsService.onStamps)
            .toHaveBeenCalledWith('saveState', this.stamps, 'models');
          expect(this.ctxt.before)
            .toEqual('gameModels.onStamps.returnValue(saveState)');
        });

        it('should apply <method> on <stamps>', function() {
          expect(this.gameModelsService.onStamps)
            .toHaveBeenCalledWith(this.method, 'arg1', 'arg2', this.stamps, 'models');
        });

        it('should save <stamps> states after change', function() {
          expect(this.gameModelsService.onStamps)
            .toHaveBeenCalledWith('saveState', this.stamps, 'models');
          expect(this.ctxt.after)
            .toEqual('gameModels.onStamps.returnValue(saveState)');
        });

        it('should emit changeModel gameEvents', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeModel-stamp2');
        });

        it('should return context', function() {
          expect(this.ctxt)
            .toEqual({
              before: 'gameModels.onStamps.returnValue(saveState)',
              after: 'gameModels.onStamps.returnValue(saveState)',
              desc: 'setState'
            });
        });
      });
    });

    when('replay(<ctxt>, <scope>, <game>)', function() {
      this.onModelsCommandService.replay(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
          after: [ { stamp: 'after1' }, { stamp: 'after2' } ],
        };
      });

      it('should find <stamps> in game models', function() {
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('after1', 'models');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('after2', 'models');
      });

      it('should set <after> states', function() {
        expect(this.modelService.setState)
          .toHaveBeenCalledWith({ stamp: 'after1' }, { state: { stamp: 'after1' } });
        expect(this.modelService.setState)
          .toHaveBeenCalledWith({ stamp: 'after2' }, { state: { stamp: 'after2' } });
      });

      it('should emit changeModel gameEvents', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-after1');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-after2');
      });

      it('should set remote modelSelection to modified models', function() {
        expect(this.gameModelSelectionService.set)
          .toHaveBeenCalledWith('remote', ['after1', 'after2'],
                                this.scope, 'selection');
      });
    });

    when('undo(<ctxt>, <scope>, <game>)', function() {
      this.onModelsCommandService.undo(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
          after: [ { stamp: 'after1' }, { stamp: 'after2' } ],
        };
      });

      it('should find <stamps> in game models', function() {
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('before1', 'models');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('before2', 'models');
      });

      it('should set <before> states', function() {
        expect(this.modelService.setState)
          .toHaveBeenCalledWith({ stamp: 'before1' }, { state: { stamp: 'before1' } });
        expect(this.modelService.setState)
          .toHaveBeenCalledWith({ stamp: 'before2' }, { state: { stamp: 'before2' } });
      });

      it('should emit changeModel gameEvents', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-before1');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeModel-before2');
      });

      it('should set remote modelSelection to modified models', function() {
        expect(this.gameModelSelectionService.set)
          .toHaveBeenCalledWith('remote', ['before1', 'before2'],
                                this.scope, 'selection');
      });
    });
  });

  describe('gameModels service', function() {
    beforeEach(inject([
      'gameModels',
      function(gameModelsService) {
        this.gameModelsService = gameModelsService;
        this.modelService = spyOnService('model');
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
    
    when('onStamp(<method>, <...args...>, <stamps>)', function() {
      this.ret = this.gameModelsService.onStamps(this.method, 'arg1', 'arg2',
                                                 this.stamps, this.models);
    }, function() {
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
        this.stamps = ['stamp2', 'stamp3'];

        this.modelService.setState.and.callFake(function(a1, a2, m) {
          return 'model.setState.returnValue('+m.state.stamp+')';
        });
      });

      when('modelService responds to <method>', function() {
        this.method = 'setState';
      }, function() {
        it('should call <method> on <stamp> model', function() {
          expect(this.modelService[this.method])
            .toHaveBeenCalledWith('arg1', 'arg2',
                                  { state: { stamp: 'stamp2' } });
          expect(this.modelService[this.method])
            .toHaveBeenCalledWith('arg1', 'arg2',
                                  { state: { stamp: 'stamp3' } });
          expect(this.ret)
            .toEqual(['model.setState.returnValue(stamp2)',
                      'model.setState.returnValue(stamp3)']);
        });
      });
    });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
        this.gameFactionsService = spyOnService('gameFactions');
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

    describe('shortestLineTo(<factions>, <other>)', function() {
      beforeEach(function() {
        var info = {
          'model': { base_radius: 7.874 },
          'other': { base_radius: 9.842 },
        };
        this.gameFactionsService.getModelInfo.and.callFake(function(i) {
          return info[i];
        });
      });

      it('should compute the shortest line between both models', function() {
        var model = { state: { info: 'model', x: 240, y: 240 } };
        var other = { state: { info: 'other', x: 120, y: 120 } };
        expect(this.modelService.shortestLineTo('factions', other, model))
          .toEqual({
            start: { x: 234.43224120493713, y: 234.43224120493713 },
            end: { x: 126.959344940438, y: 126.959344940438 }
          });
      });
    });

    describe('baseEdgeInDirection(<factions>, <dir>)', function() {
      beforeEach(function() {
        this.gameFactionsService.getModelInfo._retVal = {
          base_radius: 7.874
        };
      });

      it('should compute the point on model\s base edge in <direction>', function() {
        expect(this.modelService.baseEdgeInDirection('factions', 42, {
          state: { x: 140, y: 340 }
        })).toEqual({
          x: 145.26873439446965,
          y: 334.148477644191
        });
      });
    });
  });
});
