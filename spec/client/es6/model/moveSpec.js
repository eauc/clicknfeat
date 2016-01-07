describe('move model', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;

        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.gameModelSelectionService.get._retVal = 'stamps';

        this.state = {
          factions: 'factions',
          game: { model_selection: 'selection' },
          event: jasmine.createSpy('event')
        };
      }
    ]));

    using([
      [ 'action' ],
      [ 'moveFront' ],
      [ 'moveBack' ],
      [ 'rotateLeft' ],
      [ 'rotateRight' ],
    ], function(e) {
      when('user '+e.action+' model selection', function() {
        this.ret = this.modelsModeService.actions[e.action](this.state);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onModels/'+e.action+' command', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ e.action, ['factions', false],
                                                'stamps'
                                              ]);
        });
      });

      when('user '+e.action+'Small model selection', function() {
        this.ret = this.modelsModeService.actions[e.action+'Small'](this.state);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onModels/'+e.action+'Small command', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ e.action, ['factions', true],
                                                'stamps'
                                              ]);
        });
      });
    });

    using([
      [ 'action'     , 'flipped_action' ],
      [ 'shiftUp'    , 'shiftDown'      ],
      [ 'shiftDown'  , 'shiftUp'        ],
      [ 'shiftLeft'  , 'shiftRight'     ],
      [ 'shiftRight' , 'shiftLeft'      ],
    ], function(e) {
      when('user '+e.action+' model selection', function() {
        this.ret = this.modelsModeService.actions[e.action](this.state);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onModels/'+e.action+' command', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ e.action, ['factions', false],
                                                'stamps'
                                              ]);
        });

        when('map is flipped', function() {
          this.state.ui_state = { flip_map: true };
        }, function() {
          it('should execute onModels/'+e.flipped_action+' command', function() {
            expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ e.flipped_action, ['factions', false],
                                                'stamps'
                                              ]);
          });
        });
      });

      when('user '+e.action+'Small model selection', function() {
        this.ret = this.modelsModeService.actions[e.action+'Small'](this.state);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onModels/'+e.action+'Small command', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ e.action, ['factions', true],
                                                'stamps'
                                              ]);
        });

        when('map is flipped', function() {
          this.state.ui_state = { flip_map: true };
        }, function() {
          it('should execute onModels/'+e.flipped_action+'Small command', function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [ e.flipped_action, [ 'factions', true],
                                                  'stamps'
                                                ]);
          });
        });
      });
    });
    
    using([
      [ 'action'             , 'flipped' , 'dir' ],
      [ 'setOrientationUp'   , false     , 0     ],
      [ 'setOrientationUp'   , true      , 180   ],
      [ 'setOrientationDown' , false     , 180   ],
      [ 'setOrientationDown' , true      , 0     ],
    ], function(e) {
      when('user '+e.action+' on model selection', function() {
        this.modelsModeService.actions[e.action](this.state);
      }, function() {
        beforeEach(function() {
          this.state.ui_state = { flip_map: false };
        });
        
        it('should get current selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });
      
        when('map is '+(e.flipped?'':'not ')+'flipped', function() {
          this.state.ui_state = { flip_map: e.flipped };
        }, function() {
          it('should execute onModels/setOrientation command', function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [ 'setOrientation', ['factions', e.dir],
                                                  'stamps'
                                                ]);
          });
        });
      });
    });

    when('user set target model, ', function() {
      this.ret = this.modelsModeService.actions
        .setTargetModel(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.target = { state: { stamp: 'target' } };
        this.event = { 'click#': { target: this.target } };
      });
        
      it('should orient model selection to target model', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');

        expect(this.state.event)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [ 'orientTo', [ 'factions', this.target],
                                              'stamps'
                                            ]);
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

    using([
      [ 'move', 'base', 'result', 'small_result' ],
      [ 'rotateLeft', 5.905,
        { x: 240, y: 240, r: 165 },
        { x: 240, y: 240, r: 175 } ],
      [ 'rotateRight', 5.905,
        { x: 240, y: 240, r: 195 },
        { x: 240, y: 240, r: 185 } ],
      [ 'moveFront', 5.905,
        { x: 240, y: 250, r: 180 },
        { x: 240, y: 245, r: 180 } ],
      [ 'moveBack', 7.874,
        { x: 240, y: 230, r: 180 },
        { x: 240, y: 235, r: 180 } ],
      [ 'shiftLeft', 9.842,
        { x: 230, y: 240, r: 180 },
        { x: 239, y: 240, r: 180 } ],
      [ 'shiftRight', 24.605,
        { x: 250, y: 240, r: 180 },
        { x: 241, y: 240, r: 180 } ],
      [ 'shiftUp', 5.905,
        { x: 240, y: 230, r: 180 },
        { x: 240, y: 239, r: 180 } ],
      [ 'shiftDown', 5.905,
        { x: 240, y: 250, r: 180 },
        { x: 240, y: 241, r: 180 } ],
    ], function(e) {
      using([
        [ 'small', 'result' ],
        [ false  , e.result ],
        [ true   , e.small_result ],
      ], function(ee, dd) {
        when(e.move+'(<small>)', function() {
          this.ret = this.modelService[e.move]('factions', ee.small, this.model);
        }, function() {
          beforeEach(function() {
            this.model = {
              state: { stamp: 'stamp', info: 'info', x: 240, y: 240, r: 180, dsp:[] }
            };
          });

          it('should '+e.move+' model, '+dd, function() {
            expect(R.pick(['x','y','r'], this.ret.state))
              .toEqual(ee.result);
          });

          it('should check state', function() {
            expect(this.modelService.checkState)
              .toHaveBeenCalledWith('factions', null, this.ret);
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

    when('setOrientation(<dir>)', function() {
      this.ret = this.modelService
        .setOrientation('factions', 15, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info', x: 240, y: 240, r: 180, dsp: [] }
        };
      });

      it('should set model orientation', function() {
        expect(R.pick(['x','y','r'], this.ret.state))
          .toEqual({ x: 240, y: 240, r: 15 });
      });

      when('model is locked', function() {
        this.model = this.modelService.setLock(true, this.model);
      }, function() {
        it('should not orient model', function() {
          this.thenExpectError(this.ret, (reason) => {
            expect(reason).toBe('Model is locked');
          });
        });
      });

      it('should check state', function() {
        expect(this.modelService.checkState)
         .toHaveBeenCalledWith('factions', null, this.ret);
      });
    });

    when('orientTo(<factions>, <other>)', function() {
      this.ret = this.modelService
        .orientTo('factions', this.other, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { x: 240, y: 240, r: 0, dsp:[] }
        };
        this.other = {
          state: { x: 360, y: 360, r: 0 }
        };
      });
      
      it('should orient model to directly face <other>', function() {
        expect(R.pick(['x','y','r'], this.ret.state))
          .toEqual({ x: 240, y: 240, r: 135 });
      });

      when('model is locked', function() {
        this.model = this.modelService.setLock(true, this.model);
      }, function() {
        it('should not orient model', function() {
          this.thenExpectError(this.ret, (reason) => {
            expect(reason).toBe('Model is locked');
          });
        });
      });

      it('should check state', function() {
        expect(this.modelService.checkState)
         .toHaveBeenCalledWith('factions', null, this.ret);
      });
    });
  });
});
