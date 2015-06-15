'use strict';

describe('create model', function() {
  describe('gameModelCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.modesService = spyOnService('modes');

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          this.scope.onGameEvent = jasmine.createSpy('onGameEvent');
          this.scope.modes = 'modes';
          this.scope.create = {};
          this.scope.digestOnGameEvent = function() {};
          this.scope.user = { name: 'user' };

          this.scope.factions = {
            legion: {
              models: {
                locks: {
                  absylonia1: {
                    name: 'Absylonia, Terror of Everblight'
                  }
                },
                units: {
                  archers: {
                    name: 'Blighted Nyss Archers',
                    entries: {
                      unit: {
                        grunt: {
                          name: 'Leader & Grunts'
                        }
                      }
                    }
                  }
                }
              }
            }
          };
            
          $controller('gameModelCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    when('user creates a model', function() {
      this.scope.doCreateModel();
    }, function() {
      when('model is a single entry', function() {
        this.scope.faction = 'legion';
        this.scope.section = 'locks';
        this.scope.entry = 'absylonia1';
        this.scope.model = 'absylonia1';
        this.scope.repeat = 1;
      }, function() {
        it('should init scope\'s create object', function() {
          expect(this.scope.create)
            .toEqual({ model: {
              base: { x: 240, y: 240 },
              models: [ {
                info: ['legion','models','locks','absylonia1'],
                x: 0, y: 0,
                user: 'user'
              } ]
            } });
        });
      });

      it('should switch to CreateModel mode', function() {
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('CreateModel', this.scope, 'modes');
      });

      when('model is a unit entry', function() {
        this.scope.faction = 'legion';
        this.scope.section = 'units';
        this.scope.entry = 'archers';
        this.scope.type = 'unit';
        this.scope.model = 'grunt';
        this.scope.repeat = 3;
      }, function() {
        it('should init scope\'s create object', function() {
          expect(this.scope.create)
            .toEqual({ model: {
              base: { x: 240, y: 240 },
              models: [ {
                info: ['legion','models','units','archers','entries','unit','grunt'],
                x: 0, y: 0,
                user: 'user'
              }, {
                info: ['legion','models','units','archers','entries','unit','grunt'],
                x: 20, y: 0,
                user: 'user'
              }, {
                info: ['legion','models','units','archers','entries','unit','grunt'],
                x: 40, y: 0,
                user: 'user'
              } ]
            } });
        });
      });

      it('should switch to CreateModel mode', function() {
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('CreateModel', this.scope, 'modes');
      });
    });
  });

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
      ], function(e, d) {
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

    when('user click on map', function() {
      this.createModelModeService.actions.clickMap(this.scope, {
        x: 42, y: 71
      });
    }, function() {
      it('should update scope\'s create object', function() {
        expect(this.scope.create.model.base)
          .toEqual({
            x: 42, y: 71
          });
      });

      it('should execute createModelCommand', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('createModel',
                                this.scope.create.model,
                                this.scope, this.scope.game);
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
      ], function(e, d) {
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
        this.modelService.create.and.callFake(function(f,m) {
          return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
        });
      }
    ]));

    describe('execute(<create>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.create = {
          base: { x: 240, y: 240 },
          models: [ {
            info: ['legion','models','locks','absylonia1'],
            x: 0, y: 0
          }, {
            info: ['legion','models','units','archers','entries','unit','grunt'],
            x: 20, y: 0
          }, {
            info: ['legion','models','units','archers','entries','unit','grunt'],
            x: 40, y: 0
          } ]
        };

        this.ret = this.createModelCommandService
          .execute(this.create, this.scope, this.game);
      });

      it('should create new models from <create>', function() {
        expect(this.modelService.create)
          .toHaveBeenCalledWith('factions', {
            info: [ 'legion', 'models', 'locks', 'absylonia1' ],
            x: 240, y: 240
          });
        expect(this.modelService.create)
          .toHaveBeenCalledWith('factions', {
            info: ['legion','models','units','archers','entries','unit','grunt'],
            x: 260, y: 240
          });
        expect(this.modelService.create)
          .toHaveBeenCalledWith('factions', {
            info: ['legion','models','units','archers','entries','unit','grunt'],
            x: 280, y: 240
          });
      });

      it('should add new model to <game> models', function() {
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

      it('should set local modelSelection to new model', function() {
        expect(this.gameModelSelectionService.set)
          .toHaveBeenCalledWith('local', ['stamp1', 'stamp2', 'stamp3'],
                                this.scope, 'selection');
      });

      it('should emit createModel event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createModel');
      });

      it('should return context', function() {
        expect(this.modelService.saveState)
          .toHaveBeenCalledWith({
            state: { info: [ 'legion', 'models', 'locks', 'absylonia1' ],
                     x: 240, y: 240,
                     stamp: 'stamp1'
                   }
          });
        expect(this.modelService.saveState)
          .toHaveBeenCalledWith({
            state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                     x: 260, y: 240,
                     stamp: 'stamp2'
                   }
          });
        expect(this.modelService.saveState)
          .toHaveBeenCalledWith({
            state: { info: [ 'legion', 'models', 'units', 'archers', 'entries', 'unit', 'grunt' ],
                     x: 280, y: 240,
                     stamp: 'stamp3'
                   }
          });
        expect(this.ret)
          .toEqual({
            models: [ 'model.saveState.returnValue',
                     'model.saveState.returnValue',
                     'model.saveState.returnValue' ],
            desc: 'legion.models.locks.absylonia1',
          });
      });
    });

    describe('replay(<ctxt>, <scope>, <game>)', function() {
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
        
        this.createModelCommandService.replay(this.ctxt, this.scope, this.game);
      });

      it('should create new models from <ctxt.models>', function() {
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

      it('should add new model to <game> models', function() {
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

      it('should set remote modelSelection to new model', function() {
        expect(this.gameModelSelectionService.set)
          .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                this.scope, 'selection');
      });

      it('should emit createModel event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createModel');
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
        this.gameFactionsService = spyOnService('gameFactions');
        this.gameFactionsService.getModelInfo._retVal = null;
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
        this.gameFactionsService.getModelInfo._retVal = null;
      }, function() {
        it('should return Nil', function() {
          expect(this.ret).toBe(undefined);
        });
      });

      when('<state.info> is known', function() {
        this.state = { info: ['info'],
                       x:240,
                       l: ['label'],
                       stamp: 'stamp'
                     };
        this.gameFactionsService.getModelInfo._retVal = {
          damage: { type: 'warrior', n: 1 }
        };
      }, function() {
        it('should extend <state> with default values', function() {
          expect(this.ret)
            .toEqual({
              state: { x: 240, y: 0, r: 0,
                       dmg: { n: 0, t: 0 },
                       dsp: ['i'],
                       eff: [],
                       img: 0,
                       l: [ 'label' ],
                       c: 0, s: 0,
                       stamp: 'stamp',
                       info: [ 'info' ]
                     }
            });
        });
      });

      using([
        [ 'info', 'state' ],
        [ { type: 'warrior', n: 1 }, { n: 0, t: 0 } ],
        [ { type: 'jack',
            1: [ null, null,  null,  "b",  "l", null ],
            2: [ null,  "b",  "b",   "l",  "l",  "m" ],
            3: [ null,  "b",  "g",   "a",  "m",  "m" ],
            4: [ null,  "b",  "g",   "a",  "c",  "c" ],
            5: [ null,  "b",  "b",   "r",  "r",  "c" ],
            6: [ null, null,  null,  "b",  "r", null ],
            field: 10
          }, { 1: [ 0, 0, 0, 0, 0, 0 ],
               2: [ 0, 0, 0, 0, 0, 0 ],
               3: [ 0, 0, 0, 0, 0, 0 ],
               4: [ 0, 0, 0, 0, 0, 0 ],
               5: [ 0, 0, 0, 0, 0, 0 ],
               6: [ 0, 0, 0, 0, 0, 0 ],
               f: 0, t: 0
             } ],
      ], function(e, d) {
        when('<state.info> damage type is '+e.info.type, function() {
          this.gameFactionsService.getModelInfo._retVal = {
            damage: e.info
          };
        }, function() {
          it('should init <state> damage', function() {
            expect(this.ret.state.dmg)
              .toEqual(e.state);
          });
        });
      });

      using([
        [ 'type'    , 'dsp' ],
        [ 'warrior' , ['i'] ],
        [ 'wardude' , ['i','c'] ],
        [ 'beast'   , ['i','c'] ],
        [ 'jack'    , ['i','c'] ],
      ], function(e, d) {
        when('<state.info> type is '+e.type, function() {
          this.gameFactionsService.getModelInfo._retVal = {
            type: e.type,
            damage: { type: 'warrior', n: 1 }
          };
        }, function() {
          it('should init counter display', function() {
            expect(this.ret.state.dsp)
              .toEqual(e.dsp);
          });
        });
      });
    });
  });
});
