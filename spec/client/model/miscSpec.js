'use strict';

describe('misc model', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelMode',
      function(modelModeService) {
        this.modelModeService = modelModeService;
        this.gameService = spyOnService('game');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelsService.all.and.callThrough();
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions'
                     };
      }
    ]));

    when('user select all friendly models', function() {
      this.ret = this.modelModeService.actions
        .selectAllFriendly(this.scope);
    }, function() {
      beforeEach(function() {
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
        this.gameModelSelectionService.get._retVal = ['stamp1'];
        this.gameModelsService.findStamp.resolveWith = {
          state: { user: 'user' }
        };
      });

      it('should fetch selected model', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', this.scope.game.models);
      });
      
      it('should select all models with the same user', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('setModelSelection',
                                  'set', [ 'a1', 'a3', 'l1', 'l3' ],
                                  this.scope, this.scope.game);
          expect(result).toBe('game.executeCommand.returnValue');
        });
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
      this.ret = this.onModelsCommandService
        .execute(this.method, 'arg1', 'arg2', this.stamps, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2'];

        mockReturnPromise(this.gameModelsService.onStamps);
        this.gameModelsService.onStamps.resolveWith = R.bind(function(m) {
          return this.gameModelsService.onStamps._retVal+'('+m+')';
        }, this);
      });

      when('modelService does not respond to <method> ', function() {
        this.method = 'whatever';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(this.gameModelsService.onStamps)
              .not.toHaveBeenCalled();

            expect(reason).toBe('Unknown method whatever on model');
          });
        });
      });
      
      when('modelService responds to <method> ', function() {
        this.method = 'setState';
      }, function() {
        it('should save <stamps> states before change', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(this.gameModelsService.onStamps)
              .toHaveBeenCalledWith('saveState', this.stamps, 'models');
            expect(ctxt.before)
              .toEqual('gameModels.onStamps.returnValue(saveState)');
          });
        });

        it('should apply <method> on <stamps>', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(this.gameModelsService.onStamps)
              .toHaveBeenCalledWith(this.method, 'arg1', 'arg2', this.stamps, 'models');
          });
        });

        it('should save <stamps> states after change', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(this.gameModelsService.onStamps)
              .toHaveBeenCalledWith('saveState', this.stamps, 'models');
            expect(ctxt.after)
              .toEqual('gameModels.onStamps.returnValue(saveState)');
          });
        });

        it('should emit changeModel gameEvents', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('changeModel-stamp1');
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('changeModel-stamp2');
          });
        });

        it('should return context', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(ctxt)
              .toEqual({
                before: 'gameModels.onStamps.returnValue(saveState)',
                after: 'gameModels.onStamps.returnValue(saveState)',
                desc: 'setState'
              });
          });
        });
      });
    });

    using([
      [ 'method', 'state'  ],
      [ 'replay', 'after'  ],
      [ 'undo'  , 'before' ],
    ], function(e, d) {
      when(e.method+'(<ctxt>, <scope>, <game>)', function() {
        this.ret = this.onModelsCommandService[e.method](this.ctxt, this.scope, this.game);
      }, function() {
        beforeEach(function() {
          this.ctxt = {
            before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
            after: [ { stamp: 'after1' }, { stamp: 'after2' } ],
          };
          mockReturnPromise(this.gameModelsService.findAnyStamps);
          this.gameModelsService.findAnyStamps.resolveWith = function(ss) {
            return R.map(function(s) { return { state: { stamp: s } }; }, ss);
          };
        });

        when('no stamps are found', function() {
          this.gameModelsService.findAnyStamps.rejectWith = 'reason';
        }, function() {
          it('should reject command', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('reason');
            });
          });
        });
        
        it('should find <stamps> in game models', function() {
          expect(this.gameModelsService.findAnyStamps)
            .toHaveBeenCalledWith([ e.state+'1', e.state+'2'], 'models');
        });

        it('should set <'+e.state+'> states', function() {
          this.thenExpect(this.ret, function() {
            expect(this.modelService.setState)
              .toHaveBeenCalledWith({ stamp: e.state+'1' },
                                    { state: { stamp: e.state+'1' } });
            expect(this.modelService.setState)
              .toHaveBeenCalledWith({ stamp: e.state+'2' },
                                    { state: { stamp: e.state+'2' } });
          });
        });

        it('should emit changeModel gameEvents', function() {
          this.thenExpect(this.ret, function() {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('changeModel-'+e.state+'1');
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('changeModel-'+e.state+'2');
          });
        });

        it('should set remote modelSelection to modified models', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameModelSelectionService.set)
              .toHaveBeenCalledWith('remote', [e.state+'1', e.state+'2'],
                                    this.scope, 'selection');
          });
        });
      });
    });
  });

  describe('gameModels service', function() {
    beforeEach(inject([
      'gameModels',
      function(gameModelsService) {
        this.gameModelsService = gameModelsService;
        this.modelService = spyOnService('model');
        this.models = {
          active: [
            { state: { stamp: 'stamp1' } },
            { state: { stamp: 'stamp2' } },
          ],
          locked: [
            { state: { stamp: 'stamp3' } },
          ],
        };
      }
    ]));

    describe('findStamp(<stamp>)', function() {
      using([
        [ 'stamp' ],
        [ 'stamp2' ],
        [ 'stamp3' ],
      ], function(e, d) {
        it('should find <stamp> in models', function() {
          this.ret = this.gameModelsService.findStamp(e.stamp, this.models);
          
          this.thenExpect(this.ret, function(model) {
            expect(model).toEqual({ state: { stamp: e.stamp } });
          });
        });
      });

      describe('when <stamp> is not  found', function() {
        it('should reject result', function() {
          this.ret = this.gameModelsService.findStamp('unknown', this.models);
          
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toEqual('Model unknown not found');
          });
        });
      });
    });
    
    when('findAnyStamps(<stamps>)', function() {
      this.ret = this.gameModelsService
        .findAnyStamps(this.stamps, this.models);
    }, function() {
      when('some <stamps> exist', function() {
        this.stamps = ['stamp2', 'whatever', 'stamp3'];
      }, function() {
        it('should find stamps', function() {
          this.thenExpect(this.ret, function(models) {
            expect(models).toEqual([
              { state: { stamp: 'stamp2' } },
              null,
              { state: { stamp: 'stamp3' } },
            ]);
          });
        });
      });

      when('none of the <stamps> exist', function() {
        this.stamps = ['whatever', 'unknown'];
      }, function() {
        it('should reject result', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No model found');
          });
        });
      });
    });
    
    when('onStamp(<method>, <...args...>, <stamps>)', function() {
      this.ret = this.gameModelsService.onStamps(this.method, 'arg1', 'arg2',
                                                 this.stamps, this.models);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp2', 'stamp3'];

        mockReturnPromise(this.modelService.setState);
        this.modelService.setState.resolveWith = function(a1, a2, m) {
          return 'model.setState.returnValue('+m.state.stamp+')';
        };
      });

      when('modelService does not respond to <method>', function() {
        this.method = 'whatever';
      }, function() {
        it('should reject method', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Unknown method whatever on models');
          });
        });
      });
      
      when('modelService responds to <method>', function() {
        this.method = 'setState';
      }, function() {
        when('none of the <stamps> are found', function() {
          this.stamps = ['whatever', 'unknown'];
        }, function() {
          it('should reject method', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('No model found');
            });
          });
        });

        when('some <stamps> are found', function() {
          this.stamps = ['stamp2', 'whatever', 'stamp3'];
        }, function() {
          it('should call <method> on <stamp> model', function() {
            this.thenExpect(this.ret, function(result) {
              expect(this.modelService[this.method])
                .toHaveBeenCalledWith('arg1', 'arg2',
                                      { state: { stamp: 'stamp2' } });
              expect(this.modelService[this.method])
                .toHaveBeenCalledWith('arg1', 'arg2',
                                      { state: { stamp: 'stamp3' } });
              expect(result)
                .toEqual(['model.setState.returnValue(stamp2)',
                          'model.setState.returnValue(stamp3)']);
            });
          });

          when('some calls to <method> fail', function() {
            this.modelService.setState.resolveWith = function(a1,a2,m) {
              return ( m.state.stamp === 'stamp2' ?
                       'model.setState.returnValue('+m.state.stamp+')' :
                       self.Promise.reject('reason')
                     );
            };
          }, function() {
            it('should return partial result', function() {
              this.thenExpect(this.ret, function(result) {
                expect(result).toEqual([
                  'model.setState.returnValue(stamp2)',
                  null
                ]);
              });
            });
          });

          when('all calls to <method> fail', function() {
            this.modelService.setState.rejectWith = 'reason';
          }, function() {
            it('should reject method', function() {
              this.thenExpectError(this.ret, function(reason) {
                expect(reason).toBe('reason');
              });
            });
          });
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

    describe('descriptionFromInfo', function() {
      using([
        [ 'info' , 'state' , 'desc' ],
        [ { name: 'Name' }, { user: 'User' }, 'User/Name' ],
        [ { unit_name: 'Unit', name: 'Name' }, { user: 'User' }, 'User/Unit/Name' ],
        [ { unit_name: 'Unit', name: 'Name' }, { }, 'Unit/Name' ],
        [ { unit_name: 'Unit' }, { user: 'User' }, 'User/Unit' ],
      ], function(e, d) {
        it('should give model\'s description, '+d, function() {
          var desc = this.modelService
              .descriptionFromInfo(e.info, { state: e.state });
          expect(desc).toBe(e.desc);
        });
      });
    });
    
    xdescribe('shortestLineTo(<factions>, <other>)', function() {
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

    xdescribe('baseEdgeInDirection(<factions>, <dir>)', function() {
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
