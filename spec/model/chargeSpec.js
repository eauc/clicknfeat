'use strict';

describe('model charge', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelMode',
      function(modelModeService) {
        this.modelModeService = modelModeService;
        this.modesService = spyOnService('modes');
        this.gameService = spyOnService('game');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       modes: 'modes',
                     };
      }
    ]));

    when('user starts charge on model', function() {
      this.modelModeService.actions.startCharge(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
      });

      it('should start charge for model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'startCharge', ['stamp'],
                                this.scope, this.scope.game);
      });

      it('should switch to charge mode', function() {
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('ModelCharge', this.scope, 'modes');
      });
    });
  });
  
  describe('modelChargeMode service', function() {
    beforeEach(inject([
      'modelChargeMode',
      function(modelChargeModeService) {
        this.modelChargeModeService = modelChargeModeService;
        this.modesService = spyOnService('modes');
        this.gameService = spyOnService('game');
        this.modelService = spyOnService('model');
        this.modelService.isPlacing._retVal = false;
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.modelsModeService = spyOnService('modelsMode');
        spyOn(this.modelsModeService.actions, 'clickModel');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       modes: 'modes',
                     };
      }
    ]));

    when('user ends charge on model', function() {
      this.modelChargeModeService.actions.endCharge(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
      });

      it('should end charge for model', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'endCharge', ['stamp'],
                                this.scope, this.scope.game);
      });

      it('should switch to Model mode', function() {
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('Model', this.scope, 'modes');
      });
    });

    when('user shift click on model', function() {
      this.modelChargeModeService.actions
        .clickModel(this.scope, this.event, { shiftKey: true });
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp._retVal = {
          state: { stamp: 'stamp' }
        };
        this.event = { target: { state: { stamp: 'target' } } };
      });

      when('target is the same as selection', function() {
        this.event.target.state.stamp = 'stamp';
      }, function() {
        it('should forward to modelsMode', function() {
          expect(this.modelsModeService.actions.clickModel)
            .toHaveBeenCalledWith(this.scope, this.event, { shiftKey: true });
        });
      });

      when('target is another model', function() {
      }, function() {
        it('should set charge target for model', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels',
                                  'setChargeTarget', this.scope.factions, this.event.target,
                                  ['stamp'], this.scope, this.scope.game);
        });
      });
    });

    using([
      ['move'            , 'cmd'         , 'flipMove'    , 'small'],
      ['moveFront'       , 'moveFront'   , 'moveFront'   , false  ],
      ['moveFrontSmall'  , 'moveFront'   , 'moveFront'   , true   ],
      ['moveBack'        , 'moveBack'    , 'moveBack'    , false  ],
      ['moveBackSmall'   , 'moveBack'    , 'moveBack'    , true   ],
      ['rotateLeft'      , 'rotateLeft'  , 'rotateLeft'  , false  ],
      ['rotateLeftSmall' , 'rotateLeft'  , 'rotateLeft'  , true   ],
      ['rotateRight'     , 'rotateRight' , 'rotateRight' , false  ],
      ['rotateRightSmall', 'rotateRight' , 'rotateRight' , true   ],
      ['shiftUp'         , 'shiftUp'     , 'shiftDown'   , false  ],
      ['shiftUpSmall'    , 'shiftUp'     , 'shiftDown'   , true   ],
      ['shiftDown'       , 'shiftDown'   , 'shiftUp'     , false  ],
      ['shiftDownSmall'  , 'shiftDown'   , 'shiftUp'     , true   ],
      ['shiftLeft'       , 'shiftLeft'   , 'shiftRight'  , false  ],
      ['shiftLeftSmall'  , 'shiftLeft'   , 'shiftRight'  , true   ],
      ['shiftRight'      , 'shiftRight'  , 'shiftLeft'   , false  ],
      ['shiftRightSmall' , 'shiftRight'  , 'shiftLeft'   , true   ],
    ], function(e, d) {
      when('user '+e.move+' on model', function() {
        this.modelChargeModeService.actions[e.move](this.scope);
      }, function() {
        beforeEach(function() {
          this.gameModelSelectionService.get._retVal = ['stamp'];
          spyOn(this.modelsModeService.actions, e.move);
        });

        it('should fetch charge target', function() {
          expect(this.modelService.chargeTarget)
            .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
          expect(this.gameModelsService.findStamp)
            .toHaveBeenCalledWith('model.chargeTarget.returnValue', 'models');
        });

        it('should charge-move model with defined target', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', e.cmd+'Charge',
                                  this.scope.factions, 'gameModels.findStamp.returnValue', e.small,
                                  ['stamp'], this.scope, this.scope.game);
        });

        when('map is flipped', function() {
          this.scope.ui_state = { flip_map: true };
        }, function() {
          it('should charge-flipMove model with defined target', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', e.flipMove+'Charge',
                                    this.scope.factions, 'gameModels.findStamp.returnValue', e.small,
                                    ['stamp'], this.scope, this.scope.game);
          });
        });
      });
    });
  });

  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameService = spyOnService('game');
        this.modelService = spyOnService('model');
        this.gameModelsService = spyOnService('gameModels');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions'
                     };
      }
    ]));

    describe('when user set charge max length', function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.modelService.chargeMaxLength._retVal = 42;

        this.modelsModeService.actions.setChargeMaxLength(this.scope);
      });

      it('should fetch first model\'s charge max length', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', 'models');
        expect(this.modelService.chargeMaxLength)
          .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
      });
      
      it('should prompt user for max length', function() {
        expect(this.promptService.prompt)
          .toHaveBeenCalledWith('prompt',
                                'Set charge max length :',
                                42);
      });

      using([
        [ 'value', 'max' ],
        [ 42     , 42    ],
        [ 0      , null  ],
      ], function(e, d) {
        describe('when user validates prompt, '+d, function() {
          beforeEach(function() {
            this.promptService.prompt.resolve(e.value);
          });
          
          it('should set model\'s charge max length', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setChargeMaxLength', e.max,
                                    ['stamp1','stamp2'], this.scope, this.scope.game);
          });
        });
      });

      describe('when user cancel prompt', function() {
        beforeEach(function() {
          this.promptService.prompt.reject('canceled');
        });
        
        it('should reset model\'s charge max length', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'setChargeMaxLength', null,
                                  ['stamp1','stamp2'], this.scope, this.scope.game);
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

    describe('startCharge()', function() {
      beforeEach(function() {
        this.model = {
          state: { x: 240, y:240, r: 180, dsp: [] }
        };
      });
      
      it('should start charge on model', function() {
        this.modelService.startCharge(this.model);

        expect(this.model.state.cha)
          .toEqual({
            s: { x: 240, y: 240, r: 180 },
            t: null
          });
        expect(this.modelService.isCharging(this.model))
          .toBeTruthy();
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should not start charge on model', function() {
          this.modelService.startCharge(this.model);
          
          expect(this.modelService.isCharging(this.model))
            .toBeFalsy();
        });
      });
    });

    describe('endCharge()', function() {
      it('should start charge on model', function() {
        this.model = {
          state: { x: 240, y:240, r: 180,
                   cha: {
                     s: { x: 240, y: 240 },
                     t: null
                   }
                 }
        };
        
        this.modelService.endCharge(this.model);

        expect(this.model.state.cha)
          .toBe(null);
        expect(this.modelService.isCharging(this.model))
          .toBeFalsy();
      });
    });

    when('setChargeTarget(<factions>, <target>)', function() {
      this.modelService.setChargeTarget('factions', this.target, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info',
                   x: 240, y:240, r: 180,
                   cha: {
                     s: { x: 160, y: 160 },
                     t: null
                   },
                   dsp: []
                 }
        };
        this.target = {
          state: { x: 120, y: 120, stamp: 'target' }
        };
        this.gameFactionsService.getModelInfo._retVal = {
          base_radius: 9.842,
        };
        
      });
      
      it('should set charge <target> on model', function() {
        expect(this.modelService.chargeTarget(this.model))
          .toBe('target');
      });

      it('should orient model toward <target>', function() {
        expect(this.model.state.r)
          .toBe(-45);
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should not orient model', function() {
          expect(this.model.state.r)
            .toBe(180);
        });
      });
    });

    describe('setChargeMaxLength(<length>)', function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp' }
        };
        
        this.modelService.setChargeMaxLength(42, this.model);
      });
      
      it('should set charge max length on model', function() {
        expect(this.modelService.chargeMaxLength(this.model))
          .toBe(42);
      });
    });
    using([
      [ 'move', 'start',
        'start_result', 'result',
        'start_small_result', 'small_result',
        'start_target_result', 'target_result' ],
      [ 'rotateLeftCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 80.00000000000003 },
        { x: 239.39231012048833, y: 233.0540728933228, r: 80.00000000000003 },
        { x: 200, y: 240, r: 87.99999999999999 },
        { x: 239.97563308076383, y: 238.60402013189994, r: 87.99999999999999 },
        { x: 200, y: 240, r: 80.00000000000003 },
        { x: 239.39231012048833, y: 233.0540728933228, r: -46.56192698809119 } ],
      [ 'rotateRightCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 99.99999999999999 },
        { x: 239.39231012048833, y: 246.9459271066772, r: 99.99999999999999 },
        { x: 200, y: 240, r: 92 },
        { x: 239.97563308076383, y: 241.39597986810003, r: 92 },
        { x: 200, y: 240, r: 99.99999999999999 },
        { x: 239.39231012048833, y: 246.9459271066772, r: -43.24365551169685 } ],
      // charge length === 0
      [ 'rotateLeftCharge',
        { x: 240, y: 240, r: 90 },
        { x: 240, y: 240, r: 80 }, { x: 240, y: 240, r: 180 },
        { x: 240, y: 240, r: 88 }, { x: 240, y: 240, r: 180 },
        { x: 240, y: 240, r: 80 }, { x: 240, y: 240, r: -45 }, ],
      // charge length === 0
      [ 'rotateRightCharge',
        { x: 240, y: 240, r: 90 },
        { x: 240, y: 240, r: 100 }, { x: 240, y: 240, r: 180 },
        { x: 240, y: 240, r: 92 }, { x: 240, y: 240, r: 180 },
        { x: 240, y: 240, r: 100 }, { x: 240, y: 240, r: -45 }, ],
      [ 'moveFrontCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 245, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: -47.290610042638534 } ],
      [ 'moveBackCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 235, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: -42.51044707800085 } ],
      [ 'shiftLeftCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 239, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: -42.51044707800085 } ],
      [ 'shiftRightCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 241, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: -47.290610042638534 } ],
      [ 'shiftUpCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 75.96375653207353 }, { x: 240, y: 230, r: 75.96375653207353 },
        { x: 200, y: 240, r: 88.56790381583536 }, { x: 240, y: 239, r: 88.56790381583536 },
        { x: 200, y: 240, r: 75.96375653207353 }, { x: 240, y: 230, r: -47.48955292199916 } ],
      [ 'shiftDownCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 104.0362434679265 }, { x: 240, y: 250, r: 104.0362434679265 },
        { x: 200, y: 240, r: 91.43209618416466 }, { x: 240, y: 241, r: 91.43209618416466 },
        { x: 200, y: 240, r: 104.0362434679265 }, { x: 240, y: 250, r: -42.70938995736147 } ],
    ], function(e, d) {
      describe(e.move+'(<small>)', function() {
        beforeEach(function() {
          this.model = {
            state: { info: 'info', x: 240, y: 240, r: 180,
                     cha: { s: e.start, t: null },
                     dsp: []
                   }
          };
          this.target = {
            state: { info: 'info', x: 120, y: 120 }
          };
          this.gameFactionsService.getModelInfo._retVal = {
            base_radius: 7.874
          };
          spyOn(this.modelService, 'checkState')
            .and.callThrough();
          this.modelService.checkState$ = R.curryN(3, this.modelService.checkState);
        });

        using([
          [ 'small', 'result', 'start_result' ],
          [ false  , e.result, e.start_result ],
          [ true   , e.small_result, e.start_small_result ],
        ], function(ee, dd) {
          when('target is not set', function() {
            this.modelService[e.move]('factions', null, ee.small, this.model);
          }, function() {
            it('should '+e.move+' model, '+dd, function() {
              expect(R.pick(['x','y','r'], this.model.state))
                .toEqual(ee.result);
              expect(this.model.state.cha.s)
                .toEqual(ee.start_result);
            });
          });
        });

        when('target is set', function() {
          this.modelService[e.move]('factions', this.target, false, this.model);
        }, function() {            
          it('should '+e.move+' model', function() {
            expect(R.pick(['x','y','r'], this.model.state))
              .toEqual(e.target_result);
            expect(this.model.state.cha.s)
              .toEqual(e.start_target_result);
          });
        });

        it('should check state', function() {
          this.modelService[e.move]('factions', this.target, false, this.model);
          expect(this.modelService.checkState)
            .toHaveBeenCalledWith('factions', this.target, jasmine.any(Object));
        });

        when('model is locked', function() {
          this.modelService.setLock(true, this.model);
        }, function() {
          it('should not '+e.move+' model', function() {
            expect(R.pick(['x','y','r'], this.model.state))
              .toEqual({ x: 240, y: 240, r: 180 });
          });
        });
      });
    });
  });
});
