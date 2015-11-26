'use strict';

describe('move model', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameService = spyOnService('game');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.gameModelSelectionService.get._retVal = 'stamps';

        this.scope = {
          factions: 'factions',
          game: { model_selection: 'selection' },
        };
      }
    ]));

    using([
      [ 'action' ],
      [ 'moveFront' ],
      [ 'moveBack' ],
      [ 'rotateLeft' ],
      [ 'rotateRight' ],
    ], function(e, d) {
      when('user '+e.action+' model selection', function() {
        this.ret = this.modelsModeService.actions[e.action](this.scope);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onModels/'+e.action+' command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', e.action, 'factions', false,
                                  'stamps', this.scope, this.scope.game);

          expect(this.ret).toBe('game.executeCommand.returnValue');
        });
      });

      when('user '+e.action+'Small model selection', function() {
        this.ret = this.modelsModeService.actions[e.action+'Small'](this.scope);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onModels/'+e.action+'Small command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', e.action, 'factions', true,
                                  'stamps', this.scope, this.scope.game);
          expect(this.ret).toBe('game.executeCommand.returnValue');
        });
      });
    });

    using([
      [ 'action'     , 'flipped_action' ],
      [ 'shiftUp'    , 'shiftDown'      ],
      [ 'shiftDown'  , 'shiftUp'        ],
      [ 'shiftLeft'  , 'shiftRight'     ],
      [ 'shiftRight' , 'shiftLeft'      ],
    ], function(e, d) {
      xwhen('user '+e.action+' model selection', function() {
        this.modelsModeService.actions[e.action](this.scope);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onModels/'+e.action+' command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', e.action, 'factions', false,
                                  'stamps', this.scope, this.scope.game);
        });

        when('map is flipped', function() {
          this.scope.ui_state = { flip_map: true };
        }, function() {
          it('should execute onModels/'+e.flipped_action+' command', function() {
            expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', e.flipped_action, 'factions', false,
                                  'stamps', this.scope, this.scope.game);
          });
        });
      });

      xwhen('user '+e.action+'Small model selection', function() {
        this.modelsModeService.actions[e.action+'Small'](this.scope);
      }, function() {
        it('should get current selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onModels/'+e.action+'Small command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', e.action, 'factions', true,
                                  'stamps', this.scope, this.scope.game);
        });

        when('map is flipped', function() {
          this.scope.ui_state = { flip_map: true };
        }, function() {
          it('should execute onModels/'+e.flipped_action+'Small command', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', e.flipped_action, 'factions', true,
                                    'stamps', this.scope, this.scope.game);
          });
        });
      });
    });

    xwhen('user set orientation up on model selection', function() {
      this.modelsModeService.actions.setOrientationUp(this.scope);
    }, function() {
      beforeEach(function() {
        this.scope.ui_state = { flip_map: false };
      });

      it('should get current selection', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
      });
      
      using([
        [ 'flipped' , 'dir' ],
        [ false     , 0     ],
        [ true      , 180   ],
      ], function(e, d) {
        when('map is '+(e.flipped?'':'not ')+'flipped', function() {
          this.scope.ui_state = { flip_map: e.flipped };
        }, function() {
          it('should execute onModels/setOrientation command', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setOrientation', 'factions', e.dir,
                                    'stamps', this.scope, this.scope.game);
          });
        });
      });
    });

    xwhen('user set orientation down on model selection', function() {
      this.modelsModeService.actions.setOrientationDown(this.scope);
    }, function() {
      beforeEach(function() {
        this.scope.ui_state = { flip_map: false };
      });

      it('should get current selection', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
      });
      
      using([
        [ 'flipped' , 'dir' ],
        [ false     , 180   ],
        [ true      , 0     ],
      ], function(e, d) {
        when('map is '+(e.flipped?'':'not ')+'flipped', function() {
          this.scope.ui_state = { flip_map: e.flipped };
        }, function() {
          it('should execute onModels/setOrientation command', function() {
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('onModels', 'setOrientation', 'factions', e.dir,
                                    'stamps', this.scope, this.scope.game);
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
          .and.returnValue('model.checkState.returnValue');
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
    ], function(e, d) {
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
            expect(R.pick(['x','y','r'], this.model.state))
              .toEqual(ee.result);
          });

          it('should check state', function() {
            expect(this.modelService.checkState)
              .toHaveBeenCalledWith('factions', null, this.model);
            expect(this.ret).toBe('model.checkState.returnValue');
          });
        
          when('model is locked', function() {
            this.modelService.setLock(true, this.model);
          }, function() {
            it('should reject move', function() {
              this.thenExpectError(this.ret, function(reason) {
                expect(reason).toBe('Model stamp is locked');
                
                expect(R.pick(['x','y','r'], this.model.state))
                  .toEqual({ x: 240, y: 240, r: 180 });
              });
            });
          });
        });
      });
    });

    xdescribe('setOrientation(<dir>)', function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info', x: 240, y: 240, r: 180, dsp: [] }
        };
        this.gameFactionsService.getModelInfo._retVal = {
          base_radius: 7.874
        };
      });

      it('should set model orientation', function() {
        this.modelService.setOrientation('factions', 15, this.model);
        expect(R.pick(['x','y','r'], this.model.state))
          .toEqual({ x: 240, y: 240, r: 15 });
      });

      when('model is locked', function() {
        this.modelService.setLock(true, this.model);
      }, function() {
        it('should not orient model', function() {
          this.modelService.setOrientation('factions', 15, this.model);
          expect(R.pick(['x','y','r'], this.model.state))
            .toEqual({ x: 240, y: 240, r: 180 });
        });
      });
    });
  });
});
