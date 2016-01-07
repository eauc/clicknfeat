describe('model charge', function() {
  describe('modelMode service', function() {
    beforeEach(inject([
      'modelMode',
      function(modelModeService) {
        this.modelModeService = modelModeService;

        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.state = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       modes: 'modes',
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    when('user starts charge on model', function() {
      this.ret = this.modelModeService.actions
        .startCharge(this.state);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
      });

      it('should start charge for model', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ 'startCharge', [], ['stamp'] ]);
        });
      });

      it('should switch to charge mode', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Modes.switchTo', 'ModelCharge');
        });
      });
    });
  });
  
  describe('modelChargeMode service', function() {
    beforeEach(inject([
      'modelChargeMode',
      function(modelChargeModeService) {
        this.modelChargeModeService = modelChargeModeService;

        this.modesService = spyOnService('modes');

        this.modelService = spyOnService('model');
        mockReturnPromise(this.modelService.chargeTarget);
        this.modelService.chargeTarget.resolveWith = 'model.chargeTarget.returnValue';
        // this.modelService.isPlacing._retVal = false;

        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');

        this.modelsModeService = spyOnService('modelsMode');
        // spyOn(this.modelsModeService.actions, 'clickModel');
      
        this.state = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       modes: 'modes',
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    when('user ends charge on model', function() {
      this.ret = this.modelChargeModeService.actions
        .endCharge(this.state);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
      });

      it('should end charge for model', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ 'endCharge', [], ['stamp'] ]);
        });
      });

      it('should switch to Model mode', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Modes.switchTo','Model');
        });
      });
    });

    when('user sets target model', function() {
      this.ret = this.modelChargeModeService.actions
        .setTargetModel(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp'];
        this.gameModelsService.findStamp.resolveWith = {
          state: { stamp: 'stamp' }
        };
        this.event = { 'click#': { target: { state: { stamp: 'target' } } } };
      });

      when('target is the same as selection', function() {
        this.event['click#'].target.state.stamp = 'stamp';
      }, function() {
        it('should do nothing', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.event)
              .not.toHaveBeenCalled();
          });
        });
      });

      when('target is another model', function() {
      }, function() {
        it('should set charge target for model', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [ 'setChargeTarget',
                                                  [this.state.factions, this.event['click#'].target],
                                                  ['stamp']
                                                  ]);
          });
        });
      });
    });

    using([
      ['action'          , 'flipped' , 'move'       , 'small'],
      ['moveFront'       , false     , 'moveFront'  , false  ],
      ['moveFront'       , true      , 'moveFront'  , false  ],
      ['moveFrontSmall'  , false     , 'moveFront'  , true   ],
      ['moveFrontSmall'  , true      , 'moveFront'  , true   ],
      ['moveBack'        , false     , 'moveBack'   , false  ],
      ['moveBack'        , true      , 'moveBack'   , false  ],
      ['moveBackSmall'   , false     , 'moveBack'   , true   ],
      ['moveBackSmall'   , true      , 'moveBack'   , true   ],
      ['rotateLeft'      , false     , 'rotateLeft' , false  ],
      ['rotateLeft'      , true      , 'rotateLeft' , false  ],
      ['rotateLeftSmall' , false     , 'rotateLeft' , true   ],
      ['rotateLeftSmall' , true      , 'rotateLeft' , true   ],
      ['rotateRight'     , false     , 'rotateRight', false  ],
      ['rotateRight'     , true      , 'rotateRight', false  ],
      ['rotateRightSmall', false     , 'rotateRight', true   ],
      ['rotateRightSmall', true      , 'rotateRight', true   ],
      ['shiftDown'       , false     , 'shiftDown'  , false  ],
      ['shiftDown'       , true      , 'shiftUp'    , false  ],
      ['shiftDownSmall'  , false     , 'shiftDown'  , true   ],
      ['shiftDownSmall'  , true      , 'shiftUp'    , true   ],
      ['shiftLeft'       , false     , 'shiftLeft'  , false  ],
      ['shiftLeft'       , true      , 'shiftRight' , false  ],
      ['shiftLeftSmall'  , false     , 'shiftLeft'  , true   ],
      ['shiftLeftSmall'  , true      , 'shiftRight' , true   ],
      ['shiftRight'      , false     , 'shiftRight' , false  ],
      ['shiftRight'      , true      , 'shiftLeft'  , false  ],
      ['shiftRightSmall' , false     , 'shiftRight' , true   ],
      ['shiftRightSmall' , true      , 'shiftLeft'  , true   ],
    ], function(e, d) {
      when('user '+e.action+' on model, '+d, function() {
        this.ret = this.modelChargeModeService
          .actions[e.action](this.state);
      }, function() {
        beforeEach(function() {
          this.gameModelSelectionService.get._retVal = ['stamp'];
          this.state.ui_state = { flip_map: e.flipped };
        });

        it('should fetch charging model', function() {
          expect(this.gameModelsService.findStamp)
            .toHaveBeenCalledWith('stamp', 'models');
        });

        it('should get current charge target', function() {
          this.thenExpect(this.ret, function() {
            expect(this.modelService.chargeTarget)
              .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
          });
        });

        when('current target is not set', function() {
          this.modelService.chargeTarget.rejectWith = 'reason';
        }, function() {
          it('should execute move without target', function() {
            this.thenExpect(this.ret, function() {
              expect(this.state.event)
                .toHaveBeenCalledWith('Game.command.execute',
                                      'onModels', [ e.move+'Charge',
                                                    ['factions', null, e.small],
                                                    ['stamp']
                                                  ]);
            });
          });
        });

        it('should fetch charge target model', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameModelsService.findStamp)
              .toHaveBeenCalledWith('model.chargeTarget.returnValue', 'models');
          });
        });
        
        it('should charge-move model with defined target', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [ e.move+'Charge',
                                                  ['factions',
                                                   'gameModels.findStamp.returnValue',
                                                   e.small],
                                                  ['stamp']
                                                ]);
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
        mockReturnPromise(this.gameModelsService.findStamp);
        this.gameModelsService.findStamp.resolveWith = 'gameModels.findStamp.returnValue';
        
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.state = { game: { model_selection: 'selection',
                               models: 'models'
                             },
                       factions: 'factions',
                       event: jasmine.createSpy('event')
                     };
      }
    ]));

    when('user set charge max length', function() {
      this.ret = this.modelsModeService.actions
        .setChargeMaxLength(this.state);
    }, function() {
      beforeEach(function() {
        this.gameModelSelectionService.get._retVal = ['stamp1','stamp2'];
        this.modelService.chargeMaxLength._retVal = 42;
        this.promptService.prompt.resolveWith = 71;
      });

      it('should fetch first model\'s charge max length', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.findStamp)
          .toHaveBeenCalledWith('stamp1', 'models');
        this.thenExpect(this.ret, function() {
          expect(this.modelService.chargeMaxLength)
            .toHaveBeenCalledWith('gameModels.findStamp.returnValue');
        });
      });
      
      it('should prompt user for max length', function() {
        this.thenExpect(this.ret, function() {
          expect(this.promptService.prompt)
            .toHaveBeenCalledWith('prompt',
                                  'Set charge max length :',
                                  42);
        });
      });

      when('user cancels prompt', function() {
        this.promptService.prompt.rejectWith = 'canceled';
      }, function() {
        it('should reset model\'s charge max length', function() {
          this.thenExpect(this.ret, function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [ 'setChargeMaxLength',
                                                  ['factions', null],
                                                  ['stamp1','stamp2']
                                                ]);
          });
        });
      });
      
      using([
        [ 'value', 'max' ],
        [ 42     , 42    ],
        [ 0      , null  ],
      ], function(e, d) {
        when('user validates prompt, '+d, function() {
          this.promptService.prompt.resolveWith = e.value;
        }, function() {
          it('should set model\'s charge max length', function() {
            this.thenExpect(this.ret, function() {
              expect(this.state.event)
                .toHaveBeenCalledWith('Game.command.execute',
                                      'onModels', [ 'setChargeMaxLength',
                                                    ['factions', e.max],
                                                    ['stamp1','stamp2']
                                                  ]);
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
        spyOn(this.modelService, 'checkState')
          .and.callFake((f,t,m) => m);
      }
    ]));

    when('startCharge()', function() {
      this.ret = this.modelService
        .startCharge(this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { x: 240, y:240, r: 180, dsp: [] }
        };
      });
      
      it('should start charge on model', function() {
        expect(this.ret.state.cha)
          .toEqual({
            s: { x: 240, y: 240, r: 180 },
            t: null
          });
        expect(this.modelService.isCharging(this.ret))
          .toBeTruthy();
      });

      when('model is locked', function() {
        this.model = this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject charge start', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Model is locked');
          });
        });
      });
    });

    when('endCharge()', function() {
      this.ret = this.modelService.endCharge(this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { x: 240, y:240, r: 180,
                   cha: {
                     s: { x: 240, y: 240 },
                     t: null
                   }
                 }
        };
      });

      it('should start charge on model', function() {
        expect(this.ret.state.cha)
          .toBe(null);
        expect(this.modelService.isCharging(this.ret))
          .toBeFalsy();
      });
    });

    when('setChargeTarget(<factions>, <target>)', function() {
      this.ret = this.modelService
        .setChargeTarget('factions', this.target, this.model);
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
      });
      
      it('should set charge <target> on model', function() {
        let target = this.modelService.chargeTarget(this.ret);
        this.thenExpect(target, function(result) {
          expect(result).toBe('target');
        });
      });

      it('should orient model toward <target>', function() {
        expect(this.ret.state.r)
          .toBe(-45);
      });

      when('model is locked', function() {
        this.model = this.modelService.setLock(true, this.model);
      }, function() {
        it('should reject set target', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Model is locked');
          });
        });
      });
    });

    when('setChargeMaxLength(<length>)', function() {
      this.ret = this.modelService
        .setChargeMaxLength('factions', 42, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { stamp: 'stamp' }
        };
      });
      
      it('should set charge max length on model', function() {
        expect(this.modelService.chargeMaxLength(this.ret))
          .toBe(42);
      });

      it('should check state', function() {
        expect(this.modelService.checkState)
          .toHaveBeenCalledWith('factions', null, this.ret);
      });
    });

    using([
      [ 'move', 'start',
        'start_result', 'result',
        'start_small_result', 'small_result' ],
      [ /* move                */ 'rotateLeftCharge',
        /* start               */ { x: 200,
                                    y: 240,
                                    r: 90 },
        /* start_result        */ { x: 200,
                                    y: 240,
                                    r: 80 },
        /* result              */ { x: 239.39231012048833,
                                    y: 233.0540728933228,
                                    r: 180 },
        /* start_small_result  */ { x: 200,
                                    y: 240,
                                    r: 88 },
        /* small_result        */ { x: 239.97563308076383,
                                    y: 238.60402013189994,
                                    r: 180 } ],
      [ 'rotateRightCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 100 },
        { x: 239.39231012048833, y: 246.9459271066772, r: 180 },
        { x: 200, y: 240, r: 92 },
        { x: 239.97563308076383, y: 241.39597986810003, r: 180 } ],
      // charge length === 0
      [ 'rotateLeftCharge',
        { x: 240, y: 240, r: 90 },
        { x: 240, y: 240, r: 80 }, { x: 240, y: 240, r: 180 },
        { x: 240, y: 240, r: 88 }, { x: 240, y: 240, r: 180 }, ],
      // charge length === 0
      [ 'rotateRightCharge',
        { x: 240, y: 240, r: 90 },
        { x: 240, y: 240, r: 100 }, { x: 240, y: 240, r: 180 },
        { x: 240, y: 240, r: 92  }, { x: 240, y: 240, r: 180 }, ],
      [ 'moveFrontCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 245, y: 240, r: 180 } ],
      [ 'moveBackCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 235, y: 240, r: 180 } ],
      [ 'shiftLeftCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 239, y: 240, r: 180 } ],
      [ 'shiftRightCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 241, y: 240, r: 180 } ],
      [ 'shiftUpCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 240, y: 230, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 240, y: 239, r: 180 } ],
      [ 'shiftDownCharge',
        { x: 200, y: 240, r: 90 },
        { x: 200, y: 240, r: 90 }, { x: 240, y: 250, r: 180 },
        { x: 200, y: 240, r: 90 }, { x: 240, y: 241, r: 180 } ],
    ], function(e) {
      when(e.move+'(<small>)', function() {
        this.ret = this.modelService[e.move]('factions', this.target, this.small, this.model);
      }, function() {
        beforeEach(function() {
          this.model = {
            state: { info: 'info', x: 240, y: 240, r: 180,
                     cha: { s: e.start, t: null },
                     dsp: []
                   }
          };
        });

        using([
          [ 'small', 'result'       , 'start_result'       ],
          [ false  , e.result       , e.start_result       ],
          [ true   , e.small_result , e.start_small_result ],
        ], function(ee, dd) {
          when('target is not set', function() {
            this.small = ee.small;
            this.target = null;
          }, function() {
            it('should '+e.move+' model, '+dd, function() {
              expect(R.pick(['x','y','r'], this.ret.state))
                .toEqual(ee.result);
              expect(this.ret.state.cha.s)
                .toEqual(ee.start_result);
            });

            it('should check state', function() {
              expect(this.modelService.checkState)
                .toHaveBeenCalledWith('factions', this.target, this.ret);
            });
          });
        });

        when('target is set', function() {
          this.target = {
            state: { info: 'info', x: 120, y: 120 }
          };
        }, function() {            
          it('should '+e.move+' model', function() {
            expect(R.pick(['x','y','r'], this.ret.state))
              .toEqual(e.result);
            expect(this.ret.state.cha.s)
              .toEqual(e.start_result);
          });

          it('should check state', function() {
            expect(this.modelService.checkState)
              .toHaveBeenCalledWith('factions', this.target, this.ret);
          });
        });

        when('model is locked', function() {
          this.model = this.modelService.setLock(true, this.model);
        }, function() {
          it('should reject move', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('Model is locked');
            });
          });
        });
      });
    });
  });
});
