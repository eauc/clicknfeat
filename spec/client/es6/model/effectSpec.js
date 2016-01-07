describe('model effects', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;

        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];

        this.modelService = spyOnService('model');
      
        this.state = { game: { models: 'models',
                               model_selection: 'selection' },
                       factions: 'factions',
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    when('user toggles leader display on models', function() {
      this.ret = this.modelsModeService.actions
        .toggleLeaderDisplay(this.state);
    }, function() {
      using([
        ['first', 'set'],
        [ true  , false],
        [ false , true ],
      ], function(e, d) {
        when('first selected model\'s leaderDisplayed is '+e.first, function() {
          this.modelService.isLeaderDisplayed._retVal = e.first;
        }, function() {
          it('should toggle leader display on local selection, '+d, function() {
            expect(this.gameModelSelectionService.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('stamp1', 'models');
            this.thenExpect(this.ret, function() {
              expect(this.modelService.isLeaderDisplayed)
                .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
              expect(this.state.event)
                .toHaveBeenCalledWith('Game.command.execute',
                                      'onModels', [ 'setLeaderDisplay', [e.set],
                                                    this.gameModelSelectionService.get._retVal
                                                  ]);
            });
          });
        });
      });
    });

    when('user toggles incorporeal display on models', function() {
      this.ret = this.modelsModeService.actions
        .toggleIncorporealDisplay(this.state);
    }, function() {
      using([
        ['first', 'set'],
        [ true  , false],
        [ false , true ],
      ], function(e, d) {
        when('first selected model\'s incorporealDisplayed is '+e.first, function() {
          this.modelService.isIncorporealDisplayed._retVal = e.first;
        }, function() {
          it('should toggle incorporeal display on local selection, '+d, function() {
            expect(this.gameModelSelectionService.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('stamp1', 'models');
            this.thenExpect(this.ret, function() {
              expect(this.modelService.isIncorporealDisplayed)
                .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
              expect(this.state.event)
                .toHaveBeenCalledWith('Game.command.execute',
                                      'onModels', [ 'setIncorporealDisplay', [e.set],
                                                    this.gameModelSelectionService.get._retVal
                                                  ]);
            });
          });
        });
      });
    });

    using([
      [ 'effect' , 'flag' ], 
      [ 'Blind' , 'b' ],
      [ 'Corrosion' , 'c' ],
      [ 'Disrupt' , 'd' ],
      [ 'Fire' , 'f' ],
      [ 'Fleeing' , 'e' ],
      [ 'KD' , 'k' ],
      [ 'Stationary' , 't' ],
    ], function(e) {
      when('user toggles '+e.effect+' display on models', function() {
        this.ret = this.modelsModeService
          .actions['toggle'+e.effect+'EffectDisplay'](this.state);
      }, function() {
        using([
          ['first', 'set'],
          [ true  , false],
          [ false , true ],
        ], function(ee, dd) {
          when('first selected model\'s '+e.effect+'EffectDisplayed is '+ee.first, function() {
            this.modelService.isEffectDisplayed._retVal = ee.first;
          }, function() {
            it('should toggle '+e.effect+' display on local selection, '+dd, function() {
              expect(this.gameModelSelectionService.get)
                .toHaveBeenCalledWith('local', 'selection');
              expect(this.gameModelsService.findStamp)
                .toHaveBeenCalledWith('stamp1', 'models');
              this.thenExpect(this.ret, function() {
                expect(this.modelService.isEffectDisplayed)
                  .toHaveBeenCalledWith(e.flag, 'gameModels.findStamp.returnValue');
                expect(this.state.event)
                  .toHaveBeenCalledWith('Game.command.execute',
                                        'onModels', [ 'setEffectDisplay', [e.flag, ee.set],
                                                      this.gameModelSelectionService.get._retVal
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
      }
    ]));

    describe('toggleLeaderDisplay()', function() {
      it('should toggle leader display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.model = this.modelService.toggleLeaderDisplay(this.model);
        expect(this.modelService.isLeaderDisplayed(this.model))
          .toBeTruthy();
        
        this.model = this.modelService.toggleLeaderDisplay(this.model);
        expect(this.modelService.isLeaderDisplayed(this.model))
          .toBeFalsy();
      });
    });

    describe('setLeaderDisplay(<set>)', function() {
      it('should set leader display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.model = this.modelService.setLeaderDisplay(true, this.model);
        expect(this.modelService.isLeaderDisplayed(this.model))
          .toBeTruthy();
        
        this.model = this.modelService.setLeaderDisplay(false, this.model);
        expect(this.modelService.isLeaderDisplayed(this.model))
          .toBeFalsy();
      });
    });

    describe('toggleIncorporealDisplay()', function() {
      it('should toggle incorporeal display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.model = this.modelService.toggleIncorporealDisplay(this.model);
        expect(this.modelService.isIncorporealDisplayed(this.model))
          .toBeTruthy();
        
        this.model = this.modelService.toggleIncorporealDisplay(this.model);
        expect(this.modelService.isIncorporealDisplayed(this.model))
          .toBeFalsy();
      });
    });

    describe('setIncorporealDisplay(<set>)', function() {
      it('should set incorporeal display for <model>', function() {
        this.model = { state: { dsp: [] } };
        
        this.model = this.modelService.setIncorporealDisplay(true, this.model);
        expect(this.modelService.isIncorporealDisplayed(this.model))
          .toBeTruthy();
        
        this.model = this.modelService.setIncorporealDisplay(false, this.model);
        expect(this.modelService.isIncorporealDisplayed(this.model))
          .toBeFalsy();
      });
    });

    using([
      [ 'effect' , 'flag' ], 
      [ 'Blind' , 'b' ],
      [ 'Corrosion' , 'c' ],
      [ 'Disrupt' , 'd' ],
      [ 'Fire' , 'f' ],
      [ 'Fleeing' , 'r' ],
      [ 'KD' , 'k' ],
      [ 'Stationary' , 's' ],
    ], function(ee) {
      describe('toggleEffectDisplay(<effect>)', function() {
        it('should toggle effect display for <model>', function() {
          this.model = { state: { dsp: [] } };
          
          this.model = this.modelService.toggleEffectDisplay(ee.flag, this.model);
          expect(this.modelService.isEffectDisplayed(ee.flag, this.model))
            .toBeTruthy();
          
          this.model = this.modelService.toggleEffectDisplay(ee.flag, this.model);
          expect(this.modelService.isEffectDisplayed(ee.flag, this.model))
            .toBeFalsy();
        });
      });

      describe('setEffectDisplay(<set>)', function() {
        it('should set effect display for <model>', function() {
          this.model = { state: { dsp: [] } };
          
          this.model = this.modelService.setEffectDisplay(ee.flag, true, this.model);
          expect(this.modelService.isEffectDisplayed(ee.flag, this.model))
            .toBeTruthy();
          
          this.model = this.modelService.setEffectDisplay(ee.flag, false, this.model);
          expect(this.modelService.isEffectDisplayed(ee.flag, this.model))
            .toBeFalsy();
        });
      });
    });
  });
});
