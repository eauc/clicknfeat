'use strict';

describe('model b2b', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelMode',
      function(modelModeService) {
        this.modelModeService = modelModeService;
        this.gameService = spyOnService('game');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.modelsModeService = spyOnService('modelsMode');
        spyOn(this.modelsModeService.actions, 'clickModel');
      
        this.scope = { game: { model_selection: 'selection' },
                       factions: 'factions'
                     };
      }
    ]));

    when('user toggles shift+click on model', function() {
      this.modelModeService.actions
        .clickModel(this.scope, this.event, { shiftKey: true, ctrlKey: true });
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'target' } }
        };
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp._retVal = {
          state: { stamp: 'stamp' }
        };
      });

      when('<target> is the selected model', function() {
        this.event.target.state.stamp = 'stamp';
      }, function() {
        it('should fwd event to modelsMode', function() {
          expect(this.modelsModeService.actions.clickModel)
            .toHaveBeenCalledWith(this.scope, this.event,
                                  { shiftKey: true, ctrlKey: true });
        });
      });

      when('<target> is not the selected model', function() {
        this.event.target.state.stamp = 'target';
      }, function() {
        it('should fwd event to modelsMode', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'setB2B',
                                  'factions', this.event.target, ['stamp'],
                                  this.scope, this.scope.game);
        });
      });
    });
  });

  describe('gameModelSelection service', function() {
    beforeEach(inject([
      'gameModelSelection',
      function(gameModelSelectionService) {
        this.gameModelSelectionService = gameModelSelectionService;
        this.modesService = spyOnService('modes');

        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        this.scope.game = { models: 'models' };
        this.scope.modes = 'modes';
      }
    ]));

    when('set(local, <stamps>, <scope>)', function() {
      this.ret = this.gameModelSelectionService.set('local', this.after,
                                                    this.scope, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: { stamps: [ 'before1', 'before2' ] },
                           remote: { stamps: [ 'before1', 'before2' ] }
                         };
      });

      when('<stamps> is multiple', function() {
        this.after = [ 'after1', 'after2' ];
      }, function() {
        it('should send disableSingleModelSelection gameEvent', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('disableSingleModelSelection');
        });
      });

      when('<stamps> is single', function() {
        this.after = [ 'after1' ];
      }, function() {
        it('should not send disableSingleModelSelection gameEvent', function() {
          expect(this.scope.gameEvent)
            .not.toHaveBeenCalledWith('disableSingleModelSelection');
        });
      });
    });

    when('addTo(local, <stamps>, <scope>)', function() {
      this.ret = this.gameModelSelectionService.addTo('local', this.add,
                                                      this.scope, this.selection);
    }, function() {
      beforeEach(function() {
        this.add = ['stamp2', 'stamp3'];
        this.selection = { local: { stamps: [ ] },
                           remote: { stamps: [ 'stamp1' ] }
                         };
      });

      when('resulting selection is multiple', function() {
        this.add = [ 'after1', 'after2' ];
      }, function() {
        it('should send disableSingleModelSelection gameEvent', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('disableSingleModelSelection');
        });
      });

      when('resulting selection is single', function() {
        this.add = [ 'after1' ];
      }, function() {
        it('should not send disableSingleModelSelection gameEvent', function() {
          expect(this.scope.gameEvent)
            .not.toHaveBeenCalledWith('disableSingleModelSelection');
        });
      });
    });

    when('removeFrom(local, <stamps>, <scope>)', function() {
      this.ret = this.gameModelSelectionService.removeFrom('local', this.remove,
                                                           this.scope, this.selection);
    }, function() {
      beforeEach(function() {
        this.remove = ['stamp2', 'stamp3'];
        this.selection = { local: { stamps: [ 'stamp1', 'stamp2' ] },
                           remote: { stamps: [ 'stamp1', 'stamp2' ] }
                         };
      });

      when('resulting selection is multiple', function() {
        this.remove = [ 'stamp1', 'stamp2' ];
      }, function() {
        it('should send disableSingleModelSelection gameEvent', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('disableSingleModelSelection');
        });
      });

      when('resulting selection is single', function() {
        this.add = [ 'stamp1' ];
      }, function() {
        it('should not send disableSingleModelSelection gameEvent', function() {
          expect(this.scope.gameEvent)
            .not.toHaveBeenCalledWith('disableSingleModelSelection');
        });
      });
    });

    when('clear(<where>, <stamps>, <scope>)', function() {
      this.ret = this.gameModelSelectionService.clear('local',
                                                      null,
                                                      this.scope,
                                                      this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: { stamps: ['stamp1', 'stamp2'] },
                           remote: { stamps: ['stamp1', 'stamp2'] }
                         };
      });

      it('should send disableSingleModelSelection gameEvent', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('disableSingleModelSelection');
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

    describe('distanceTo(<factions>, <other>)', function() {
      beforeEach(function() {
        this.fake_info = {
          info: { base_radius: 9.842 },
          other_info: { base_radius: 7.874 },
        };
        this.gameFactionsService.getModelInfo.and.callFake(R.bind(function(i) {
          return this.fake_info[i];
        }, this));
      });

      using([
        ['model_pos', 'distance'],
        [{ x:240, y:240 }, 10.568271247461904 ],
        [{ x:245, y:245 }, 3.4972034355964263 ],
        [{ x:250, y:250 }, -3.573864376269049 ],
      ], function(e, d) {
        it('should return distance between both models, '+d, function() {
          expect(this.modelService.distanceTo('factions', {
            state: { info: 'other_info',
                     x: 260, y: 260 }
          }, {
            state: R.merge({ info: 'info'}, e.model_pos)
          })).toBe(e.distance);
        });
      });
    });

    describe('setB2B(<factions>, <other>)', function() {
      beforeEach(function() {
        this.fake_info = {
          info: { base_radius: 9.842 },
          other_info: { base_radius: 7.874 },
        };
        this.gameFactionsService.getModelInfo.and.callFake(R.bind(function(i) {
          return this.fake_info[i];
        }, this));
      });

      it('should move model B2B with <other>', function() {
        this.model = {
          state: { info: 'info',
                   x: 240, y: 240 }
        };

        this.modelService.setB2B('factions', {
          state: { info: 'other_info',
                   x: 260, y: 260 }
        }, this.model);

        expect(R.pick(['x','y'], this.model.state))
          .toEqual({ x: 247.47289626449913, y: 247.47289626449913 });
      });
    });
  });
});
