describe('model b2b', function() {
  describe('modelBaseMode service', function() {
    beforeEach(inject([
      'modelBaseMode',
      function(modelBaseModeService) {
        this.modelBaseModeService = modelBaseModeService;

        this.gameService = spyOnService('game');

        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.state = { game: { model_selection: 'selection' },
                       factions: 'factions',
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    when('user set model B2B', function() {
      this.ret = this.modelBaseModeService.actions
        .setB2B(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.target = { state: { stamp: 'target' } };
        this.event = {
          'click#': { target: this.target }
        };

        this.gameModelSelectionService.get._retVal = ['stamp'];

        this.gameModelsService.findStamp.resolveWith = {
          state: { stamp: 'stamp' }
        };
      });

      when('<target> is the selected model', function() {
        this.target.state.stamp = 'stamp';
      }, function() {
        it('should do nothing', function() {
          this.thenExpect(this.ret, () => {
            expect(this.state.event)
              .not.toHaveBeenCalled();
          });
        });
      });

      when('<target> is not the selected model', function() {
        this.target.state.stamp = 'target';
      }, function() {
        it('should place selected model B2B with target', function() {
          this.thenExpect(this.ret, () => {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [ 'setB2B',
                                                  ['factions', this.target],
                                                  ['stamp']
                                                ]);
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
        mockReturnPromise(this.gameFactionsService.getModelInfo);
      }
    ]));

    when('distanceTo(<factions>, <other>)', function() {
      this.ret = this.modelService
        .distanceTo('factions', this.other, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info'}
        };
        this.other = {
          state: { info: 'other_info',
                   x: 260, y: 260 }
        };
        this.fake_info = {
          info: { base_radius: 9.842 },
          other_info: { base_radius: 7.874 },
        };

        this.gameFactionsService.getModelInfo.resolveWith = (i) => {
          return this.fake_info[i];
        };
      });

      using([
        [ 'model_pos'      , 'distance'],
        [ { x:240, y:240 } , 10.568271247461904 ],
        [ { x:245, y:245 } , 3.4972034355964263 ],
        [ { x:250, y:250 } , -3.573864376269049 ],
      ], function(e, d) {
        when(d, function() {
          this.model.state = R.merge(this.model.state, e.model_pos);
        }, function() {
          it('should return distance between both models', function() {
            this.thenExpect(this.ret, (result) => {
              expect(result).toBe(e.distance);
            });
          });
        });
      });
    });

    when('setB2B(<factions>, <other>)', function() {
      this.ret = this.modelService
        .setB2B('factions', this.other, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info',
                   x: 240, y: 240 }
        };
        this.other = {
          state: { info: 'other_info',
                   x: 260, y: 260 }
        };
        this.fake_info = {
          info: { base_radius: 9.842 },
          other_info: { base_radius: 7.874 }
        };

        this.gameFactionsService.getModelInfo
          .resolveWith = (i) => { return this.fake_info[i]; };
      });

      it('should move model B2B with <other>', function() {
        this.thenExpect(this.ret, (model) => {
          expect(R.pick(['x','y'], model.state))
            .toEqual({ x: 247.47289626449913, y: 247.47289626449913 });
        });
      });
      
      when('model is locked', function() {
        this.model = this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject setB2B', function() {
          this.thenExpectError(this.ret, (reason) => {
            expect(reason).toBe('Model is locked');
          });
        });
      });
    });
  });
});
