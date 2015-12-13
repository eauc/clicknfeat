'use strict';

describe('create model', function() {
  describe('createModelMode service', function() {
    beforeEach(inject([
      'createModelMode',
      function(createModelModeService) {
        this.createModelModeService = createModelModeService;
        this.gameService = spyOnService('game');

        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.scope.create = { model: { base: {} } };
        this.game = 'game';
      }
    ]));

    describe('onEnter()', function() {
      beforeEach(function() {
        this.createModelModeService.onEnter(this.scope);
      });

      using([
        [ 'event' ],
        [ 'enableCreateModel' ],
        [ 'enableMoveMap' ],
      ], function(e) {
        it('should emit '+e.event+' event', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith(e.event);
        });
      });
    });

    when('user move mouse over map', function() {
      this.createModelModeService.actions.moveMap(this.scope, {
        x: 42, y: 71
      });
    }, function() {
      it('should update scope\'s create object', function() {
        expect(this.scope.create.model.base)
          .toEqual({
            x: 42, y: 71
          });
      });

      it('should emit moveCreateModel event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('moveCreateModel');
      });
    });

    when('user create model', function() {
      this.ret = this.createModelModeService.actions.create(this.scope, {
        'click#': { x: 42, y: 71 }
      });
    }, function() {
      it('should update scope\'s create object', function() {
        expect(this.scope.create.model.base)
          .toEqual({
            x: 42, y: 71
          });
      });

      using([
        [ 'flip_map' ],
        [ true       ],
        [ false      ],
      ], function(e) {
        when('map is '+(e.flip_map ? '' : 'not ')+'flipped', function() {
          this.scope.ui_state = { flip_map: e.flip_map };
        }, function() {
          it('should execute createModelCommand', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('createModel',
                                    this.scope.create.model, e.flip_map,
                                    this.scope, this.scope.game);

            expect(this.ret).toBe('game.executeCommand.returnValue');
          });
        });
      });
    });

    describe('onLeave()', function() {
      beforeEach(function() {
        this.createModelModeService.onLeave(this.scope);
      });

      it('should reset scope\'s create object', function() {
        expect(this.scope.create)
          .toEqual({ model: null });
      });

      using([
        [ 'event' ],
        [ 'disableCreateModel' ],
        [ 'disableMoveMap' ],
      ], function(e) {
        it('should emit '+e.event+' event', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith(e.event);
        });
      });
    });
  });

  describe('createModelCommand service', function() {
    beforeEach(inject([
      'createModelCommand',
      function(createModelCommandService) {
        this.createModelCommandService = createModelCommandService;
        this.modelService = spyOnService('model');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.scope = {
          factions: 'factions',
          gameEvent: jasmine.createSpy('gameEvent')
        };
        this.game = { models: 'models',
                      model_selection: 'selection' };

        var stamp_index = 1;
        mockReturnPromise(this.modelService.create);
        this.modelService.create.resolveWith = function(f, m) {
          return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
        };
      }
    ]));

    when('execute(<create>, <flip>, <scope>, <game>)', function() {
      this.ret = this.createModelCommandService
        .execute(this.create, this.flip, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.create = {
          base: { x: 240, y: 240, r: 180 },
          models: [ {
            info: ['legion','models','locks','absylonia1'],
            x: 0, y: 0, r: 45,
            l: [ 'toto' ],
          }, {
            info: ['legion','models','units','archers','entries','unit','grunt'],
            x: 20, y: 0, r: 0,
            l: [ 'titi' ],
          }, {
            info: ['legion','models','units','archers','entries','unit','grunt'],
            x: 40, y: 0, r: -45,
            l: [ 'tata' ],
          } ]
        };
        this.flip = false;
      });

      it('should create new models from <create>', function() {
        this.thenExpect(this.ret, function() {
          expect(this.modelService.create)
            .toHaveBeenCalledWith('factions', {
              info: [ 'legion', 'models', 'locks', 'absylonia1' ],
              x: 240, y: 240, r: 225,
              l: [ 'toto' ],
            });
          expect(this.modelService.create)
            .toHaveBeenCalledWith('factions', {
              info: ['legion','models','units','archers','entries','unit','grunt'],
              x: 260, y: 240, r: 180,
              l: [ 'titi' ],
            });
          expect(this.modelService.create)
            .toHaveBeenCalledWith('factions', {
              info: ['legion','models','units','archers','entries','unit','grunt'],
              x: 280, y: 240, r: 135,
              l: [ 'tata' ],
            });
        });
      });

      when('map is flipped', function() {
        this.flip = true;
      }, function() {
        it('should flip new models positions', function() {
          this.thenExpect(this.ret, function() {
            expect(this.modelService.create)
              .toHaveBeenCalledWith('factions', {
                info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                x: 240, y: 240, r: 405,
                l: [ 'toto' ],
              });
            expect(this.modelService.create)
              .toHaveBeenCalledWith('factions', {
                info: ['legion','models','units','archers','entries','unit','grunt'],
                x: 220, y: 240, r: 360,
                l: [ 'titi' ],
              });
            expect(this.modelService.create)
              .toHaveBeenCalledWith('factions', {
                info: ['legion','models','units','archers','entries','unit','grunt'],
                x: 200, y: 240, r: 315,
                l: [ 'tata' ],
              });
          });
        });
      });

      when('create models fails', function() {
        this.modelService.create.rejectWith = 'reason';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No valid model definition');
          });
        });
      });

      it('should add new model to <game> models', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelsService.add)
            .toHaveBeenCalledWith([
              { state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                         x: 240, y: 240, r: 225,
                         l: [ 'toto' ],
                         stamp: 'stamp1'
                       }
              },
              { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                         x: 260, y: 240, r: 180,
                         l: [ 'titi' ],
                         stamp: 'stamp2'
                       }
              },
              { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                         x: 280, y: 240, r: 135,
                         l: [ 'tata' ],
                         stamp: 'stamp3'
                       }
              }
            ], 'models');
          expect(this.game.models)
            .toBe('gameModels.add.returnValue');
        });
      });

      it('should set local modelSelection to new model', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelSelectionService.set)
            .toHaveBeenCalledWith('local', ['stamp1', 'stamp2', 'stamp3'],
                                  this.scope, 'selection');
        });
      });

      it('should emit createModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('createModel');
        });
      });

      it('should return context', function() {
        this.thenExpect(this.ret, function(ctxt) {
          expect(this.modelService.saveState)
            .toHaveBeenCalledWith({
              state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                       x: 240, y: 240, r: 225,
                       l: [ 'toto' ],
                       stamp: 'stamp1'
                     }
            });
          expect(this.modelService.saveState)
            .toHaveBeenCalledWith({
              state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                       x: 260, y: 240, r: 180,
                       l: [ 'titi' ],
                       stamp: 'stamp2'
                     }
            });
          expect(this.modelService.saveState)
            .toHaveBeenCalledWith({
              state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                       x: 280, y: 240, r: 135,
                       l: [ 'tata' ],
                       stamp: 'stamp3'
                     }
            });

          expect(ctxt)
            .toEqual({
              models: [ 'model.saveState.returnValue',
                        'model.saveState.returnValue',
                        'model.saveState.returnValue' ],
              desc: 'legion.models.locks.absylonia1',
            });
        });
      });
    });

    when('replay(<ctxt>, <scope>, <game>)', function() {
      this.ret = this.createModelCommandService
        .replay(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          models: [
            { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
              x: 240, y: 240,
              stamp: 'stamp'
            },
            { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 260, y: 240,
              stamp: 'stamp'
            },
            { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 280, y: 240,
              stamp: 'stamp'
            }
          ],
          desc: 'type',
        };
      });

      it('should create new models from <ctxt.models>', function() {
        this.thenExpect(this.ret, function() {
          expect(this.modelService.create)
            .toHaveBeenCalledWith('factions', {
              info: [ 'legion', 'models', 'locks', 'absylonia1' ],
              x: 240, y: 240,
              stamp: 'stamp'
            });
          expect(this.modelService.create)
            .toHaveBeenCalledWith('factions', {
              info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 260, y: 240,
              stamp: 'stamp'
            });
          expect(this.modelService.create)
            .toHaveBeenCalledWith('factions', {
              info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 280, y: 240,
              stamp: 'stamp'
            });
        });
      });

      when('create models fails', function() {
        this.modelService.create.rejectWith = 'reason';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No valid model definition');
          });
        });
      });

      it('should add new model to <game> models', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelsService.add)
            .toHaveBeenCalledWith([
              { state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                         x: 240, y: 240,
                         stamp: 'stamp1'
                       }
              },
              { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                         x: 260, y: 240,
                         stamp: 'stamp2'
                       }
              },
              { state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                         x: 280, y: 240,
                         stamp: 'stamp3'
                       }
              }
            ], 'models');
          expect(this.game.models)
            .toBe('gameModels.add.returnValue');
        });
      });

      it('should set remote modelSelection to new model', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameModelSelectionService.set)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                  this.scope, 'selection');
        });
      });

      it('should emit createModel event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('createModel');
        });
      });
    });

    describe('undo(<ctxt>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.ctxt = {
          models: [
            { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
              x: 240, y: 240,
              stamp: 'stamp1'
            },
            { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 260, y: 240,
              stamp: 'stamp2'
            },
            { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 280, y: 240,
              stamp: 'stamp3'
            }
          ],
          desc: 'type',
        };

        this.createModelCommandService.undo(this.ctxt, this.scope, this.game);
      });

      it('should remove <ctxt.model> from <game> models', function() {
        expect(this.gameModelsService.removeStamps)
          .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'models');
        expect(this.game.models)
          .toBe('gameModels.removeStamps.returnValue');
      });

      it('should remove <ctxt.model> from modelSelection', function() {
        expect(this.gameModelSelectionService.removeFrom)
          .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                                this.scope, 'selection');
        expect(this.gameModelSelectionService.removeFrom)
          .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                this.scope, 'gameModelSelection.removeFrom.returnValue');
      });

      it('should emit createModel event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createModel');
      });
    });
  });

  describe('gameModels service', function() {
    beforeEach(inject([
      'gameModels',
      function(gameModelsService) {
        this.gameModelsService = gameModelsService;
      }
    ]));

    describe('add(<models>)', function() {
      beforeEach(function() {
        this.models = {
          active: [ { state: { stamp: 'other1', x: 1 } } ],
          locked: [ { state: { stamp: 'other2', x: 1 } } ]
        };
      });

      using([
        [ 'new', 'result' ],
        [ [ { state: { stamp: 'new1' } },
            { state: { stamp: 'new2' } } ], { active: [ { state: { stamp: 'other1', x: 1 } },
                                                        { state: { stamp: 'new1' } },
                                                        { state: { stamp: 'new2' } } ],
                                              locked: [ { state: { stamp: 'other2', x: 1 } } ]
                                            }
        ],
        // remove other identics stamps
        [ [ { state: { stamp: 'other1' } },
            { state: { stamp: 'other2' } },
            { state: { stamp: 'new2' } } ], { active: [ { state: { stamp: 'other1' } },
                                                        { state: { stamp: 'other2' } },
                                                        { state: { stamp: 'new2' } } ],
                                              locked: []
                                            }
        ],
      ], function(e, d) {
        it('should add <model> to active models list, '+d, function() {
          expect(this.gameModelsService.add(e.new, this.models))
            .toEqual(e.result);
        });
      });
    });

    describe('removeStamps(<model>)', function() {
      beforeEach(function() {
        this.models = {
          active: [ { state: { stamp: 'active1' } },
                    { state: { stamp: 'active2' } },
                  ],
          locked: [ { state: { stamp: 'locked1' } },
                    { state: { stamp: 'locked2' } },
                  ]
        };
      });

      using([
        [ 'stamps', 'result' ],
        [ [ 'active1', 'active2' ],  { active: [ ],
                                       locked: [ { state: { stamp: 'locked1' } },
                                                 { state: { stamp: 'locked2' } }
                                               ]
                                     }
        ],
        [ [ 'locked1', 'active1' ],  { active: [ { state: { stamp: 'active2' } } ],
                                       locked: [ { state: { stamp: 'locked2' } } ]
                                     }
        ],
        [ [ 'unknwown', 'active1' ],  { active: [ { state: { stamp: 'active2' } } ],
                                        locked: [ { state: { stamp: 'locked1' } },
                                                  { state: { stamp: 'locked2' } }
                                                ]
                                      }
        ]
      ], function(e, d) {
        it('should remove <stamp> from models list, '+d, function() {
          expect(this.gameModelsService.removeStamps(e.stamps, this.models))
            .toEqual(e.result);
        });
      });
    });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
        spyOn(this.modelService, 'checkState')
          .and.callFake(function(f,t,m) { return m; });
        this.gameFactionsService = spyOnService('gameFactions');
        mockReturnPromise(this.gameFactionsService.getModelInfo);
        spyOn(R, 'guid').and.returnValue('newGuid');
      }
    ]));

    when('create(<state>)', function() {
      this.ret = this.modelService.create('factions', this.state);
    }, function() {     
      beforeEach(function() {
        this.state = { info: ['info'] };
      });

      it('should check whether model info exists', function() {
        expect(this.gameFactionsService.getModelInfo)
          .toHaveBeenCalledWith(['info'], 'factions');
      });
      
      when('<state.info> is unknown', function() {
        this.gameFactionsService.getModelInfo.rejectWith = 'reason';
      }, function() {
        it('should reject creation', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
          });
        });
      });

      when('<state.info> is known', function() {
        this.state = { info: ['info'],
                       x:240,
                       l: ['label'],
                       stamp: 'stamp'
                     };
        this.gameFactionsService.getModelInfo.resolveWith = {
          damage: { type: 'warrior', n: 1 }
        };
      }, function() {
        it('should check <state>', function() {
          this.thenExpect(this.ret, function() {
            expect(this.modelService.checkState)
              .toHaveBeenCalledWith('factions', null, {
                state: { x: 240, y: 0, r: 0,
                         dmg: { n: 0, t: 0 },
                         dsp: ['i'],
                         eff: [],
                         img: 0,
                         l: [ 'label' ],
                         c: 0, s: 0,
                         u : null,
                         aur: null,
                         are: null,
                         rml: null,
                         cml: null,
                         pml: [null,false],
                         cha: null,
                         pla: null,
                         stamp: 'stamp',
                         info: [ 'info' ]
                       }
              });
          });
        });
        
        it('should extend <state> with default values', function() {
          this.thenExpect(this.ret, function(model) {
            expect(model)
              .toEqual({
                state: { x: 240, y: 0, r: 0,
                         dmg: { n: 0, t: 0 },
                         dsp: ['i'],
                         eff: [],
                         img: 0,
                         l: [ 'label' ],
                         c: 0, s: 0,
                         u : null,
                         aur: null,
                         are: null,
                         rml: null,
                         cml: null,
                         pml: [null,false],
                         cha: null,
                         pla: null,
                         stamp: 'stamp',
                         info: [ 'info' ]
                       }
              });
          });
        });
      });

      using([
        [ 'info', 'state' ],
        [ { type: 'warrior', n: 1 }, { n: 0, t: 0 } ],
        [ { type: 'jack',
            1: [ null, null,  null,  'b',  'l', null ],
            2: [ null,  'b',  'b',   'l',  'l',  'm' ],
            3: [ null,  'b',  'g',   'a',  'm',  'm' ],
            4: [ null,  'b',  'g',   'a',  'c',  'c' ],
            5: [ null,  'b',  'b',   'r',  'r',  'c' ],
            6: [ null, null,  null,  'b',  'r', null ],
            field: 10
          }, { 1: [ 0, 0, 0, 0, 0, 0 ],
               2: [ 0, 0, 0, 0, 0, 0 ],
               3: [ 0, 0, 0, 0, 0, 0 ],
               4: [ 0, 0, 0, 0, 0, 0 ],
               5: [ 0, 0, 0, 0, 0, 0 ],
               6: [ 0, 0, 0, 0, 0, 0 ],
               f: 0, t: 0
             } ],
      ], function(e) {
        when('<state.info> damage type is '+e.info.type, function() {
          this.gameFactionsService.getModelInfo.resolveWith = {
            damage: e.info
          };
        }, function() {
          it('should init <state> damage', function() {
            this.thenExpect(this.ret, function(model) {
              expect(model.state.dmg)
                .toEqual(e.state);
            });
          });
        });
      });

      using([
        [ 'type'    , 'dsp' ],
        [ 'warrior' , false ],
        [ 'wardude' , true ],
        [ 'beast'   , true ],
        [ 'jack'    , true ],
      ], function(e) {
        when('<state.info> type is '+e.type, function() {
          this.gameFactionsService.getModelInfo.resolveWith = {
            type: e.type,
            damage: { type: 'warrior', n: 1 }
          };
        }, function() {
          it('should init counter display', function() {
            this.thenExpect(this.ret, function(model) {
              expect(this.modelService.isCounterDisplayed('c', model))
                .toBe(e.dsp);
            });
          });
        });
      });

      when('<state.info> is immovable', function() {
        this.gameFactionsService.getModelInfo.resolveWith = {
          type: 'objective',
          immovable: true,
          damage: { type: 'warrior', n: 1 }
        };
      }, function() {
        it('should init lock model', function() {
          this.thenExpect(this.ret, function(model) {
            expect(this.modelService.isLocked(model))
              .toBe(true);
          });
        });
      });
    });
  });
});
