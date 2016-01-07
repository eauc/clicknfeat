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
      
        this.state = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    when('user select all friendly models', function() {
      this.ret = this.modelModeService.actions
        .selectAllFriendly(this.state);
    }, function() {
      beforeEach(function() {
        this.state.game.models = {
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
          .toHaveBeenCalledWith('stamp1', this.state.game.models);
      });
      
      it('should select all models with the same user', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'setModelSelection', ['set', [ 'a1', 'a3', 'l1', 'l3' ]]);
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
        this.gameModelsService.findStamp.and.callFake((s) => {
          return { state: { stamp: s } };
        });
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);
        this.game = { models: 'models',
                      model_selection: 'selection' };
      }
    ]));

    when('execute(<method>, <..args..>, <stamps>, <state>, <game>)', function() {
      this.ret = this.onModelsCommandService
        .execute(this.method, ['arg1', 'arg2'], this.stamps, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2'];

        mockReturnPromise(this.gameModelsService.onStamps);
        this.gameModelsService.onStamps.resolveWith = (m) => {
          return this.gameModelsService.onStamps._retVal+'('+m+')';
        };
        mockReturnPromise(this.gameModelsService.fromStamps);
        this.gameModelsService.fromStamps.resolveWith = (m) => {
          return this.gameModelsService.fromStamps._retVal+'('+m+')';
        };
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
          this.thenExpect(this.ret, function([ctxt]) {
            expect(this.gameModelsService.fromStamps)
              .toHaveBeenCalledWith('saveState', [], this.stamps, 'models');
            expect(ctxt.before)
              .toEqual('gameModels.fromStamps.returnValue(saveState)');
          });
        });

        it('should apply <method> on <stamps>', function() {
          this.thenExpect(this.ret, function([ctxt,game]) {
            expect(this.gameModelsService.onStamps)
              .toHaveBeenCalledWith(this.method, ['arg1', 'arg2'], this.stamps, 'models');
            expect(game.models)
              .toBe(`gameModels.onStamps.returnValue(${this.method})`);
          });
        });

        it('should save <stamps> states after change', function() {
          this.thenExpect(this.ret, function([ctxt]) {
            expect(this.gameModelsService.fromStamps)
              .toHaveBeenCalledWith('saveState', [], this.stamps, 'models');
            expect(ctxt.after)
              .toEqual('gameModels.fromStamps.returnValue(saveState)');
          });
        });

        it('should emit changeModel changeEvents', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.model.change.stamp1');
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith('Game.model.change.stamp2');
          });
        });

        it('should return context', function() {
          this.thenExpect(this.ret, function([ctxt]) {
            expect(ctxt)
              .toEqual({
                before: 'gameModels.fromStamps.returnValue(saveState)',
                after: 'gameModels.fromStamps.returnValue(saveState)',
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
    ], function(e) {
      when(e.method+'(<ctxt>, <state>, <game>)', function() {
        this.ret = this.onModelsCommandService[e.method](this.ctxt, this.state, this.game);
      }, function() {
        beforeEach(function() {
          this.ctxt = {
            before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
            after: [ { stamp: 'after1' }, { stamp: 'after2' } ]
          };
          mockReturnPromise(this.gameModelsService.setStateStamps);
          this.gameModelsService.setStateStamps
            .resolveWith = 'gameModel.setStateStamps.returnValue';
        });

        when('setStateStamps fails', function() {
          this.gameModelsService.setStateStamps.rejectWith = 'reason';
        }, function() {
          it('should reject command', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('reason');
            });
          });
        });
        
        it('should set state for <stamps> in game models', function() {
          expect(this.gameModelsService.setStateStamps)
            .toHaveBeenCalledWith([ { stamp: e.state+'1' }, { stamp: e.state+'2' } ],
                                  [ e.state+'1', e.state+'2'],
                                  'models');
        });

        it('should emit changeModel changeEvents', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith(`Game.model.change.${e.state}1`);
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith(`Game.model.change.${e.state}2`);
          });
        });

        it('should set remote modelSelection to modified models', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameModelSelectionService.set)
              .toHaveBeenCalledWith('remote', [e.state+'1', e.state+'2'],
                                    this.state, 'selection');
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
          ]
        };
      }
    ]));

    describe('findStamp(<stamp>)', function() {
      using([
        [ 'stamp' ],
        [ 'stamp2' ],
        [ 'stamp3' ],
      ], function(e) {
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
      this.ret = this.gameModelsService
        .onStamps(this.method, ['arg1', 'arg2'], this.stamps, this.models);
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
          beforeEach(function() {
            this.modelService.isLocked.and.callFake((m) => {
              return m.state.stamp === 'stamp2';
            });
            this.modelService.setState.and.callFake((f,s,m) => {
              return R.assocPath(['state','set'],'set', m);
            });
          });
          it('should call <method> on <stamp> model', function() {
            this.thenExpect(this.ret, function(result) {
              expect(this.modelService[this.method])
                .toHaveBeenCalledWith('arg1', 'arg2',
                                      { state: { stamp: 'stamp2' } });
              expect(this.modelService[this.method])
                .toHaveBeenCalledWith('arg1', 'arg2',
                                      { state: { stamp: 'stamp3' } });
              expect(result)
                .toEqual({
                  active: [ { state: { stamp: 'stamp3', set: 'set' } },
                            { state: { stamp: 'stamp1' } }
                          ],
                  locked: [ { state: { stamp: 'stamp2', set: 'set' } }
                          ]
                });
            });
          });

          when('some calls to <method> fail', function() {
            this.modelService.setState.and.callFake((f,s,m) => {
              return ( m.state.stamp === 'stamp2' ?
                       R.assocPath(['state','set'],'set', m) :
                       self.Promise.reject('reason')
                     );
            });
          }, function() {
            it('should return partial result', function() {
              this.thenExpect(this.ret, function(result) {
                expect(result).toEqual({
                  active: [ { state: { stamp: 'stamp3' } },
                            { state: { stamp: 'stamp1' } }
                          ],
                  locked: [ { state: { stamp: 'stamp2', set: 'set' } }
                          ]
                });
              });
            });
          });
        });
      });
    });
    
    when('fromStamp(<method>, <...args...>, <stamps>)', function() {
      this.ret = this.gameModelsService
        .fromStamps(this.method, ['arg1', 'arg2'], this.stamps, this.models);
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
                .toEqual([
                  'model.setState.returnValue(stamp2)',
                  'model.setState.returnValue(stamp3)'
                ]);
            });
          });

          when('some calls to <method> fail', function() {
            this.modelService.setState.and.callFake((f,s,m) => {
              return ( m.state.stamp === 'stamp2' ?
                       'model.setState.returnValue('+m.state.stamp+')' :
                       self.Promise.reject('reason')
                     );
            });
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
        model = this.modelService.setState(state, model);
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
    
    when('shortestLineTo(<factions>, <other>)', function() {
      this.ret = this.modelService.shortestLineTo('factions', this.other, this.model);
    }, function() {
      beforeEach(function() {
        var info = {
          'model': { base_radius: 7.874 },
          'other': { base_radius: 9.842 }
        };
        this.model = { state: { info: 'model', x: 240, y: 240 } };
        this.other = { state: { info: 'other', x: 120, y: 120 } };

        mockReturnPromise(this.gameFactionsService.getModelInfo);
        this.gameFactionsService.getModelInfo.resolveWith = (i) =>{
          return info[i];
        };
      });

      it('should compute the shortest line between both models', function() {
        this.thenExpect(this.ret, function(result) {
          expect(result)
            .toEqual({
              start: { x: 234.43224120493713, y: 234.43224120493713 },
              end: { x: 126.959344940438, y: 126.959344940438 }
            });
        });
      });
    });

    when('baseEdgeInDirection(<factions>, <dir>)', function() {
      this.ret = this.modelService.baseEdgeInDirection('factions', 42, {
        state: { x: 140, y: 340 }
      });
    }, function() {
        beforeEach(function() {
        mockReturnPromise(this.gameFactionsService.getModelInfo);
        this.gameFactionsService.getModelInfo.resolveWith = {
          base_radius: 7.874
        };
      });

      it('should compute the point on model\s base edge in <direction>', function() {
        this.thenExpect(this.ret, function(result) {
          expect(result).toEqual({
            x: 145.26873439446965,
            y: 334.148477644191
          });
        });
      });
    });
  });
});
