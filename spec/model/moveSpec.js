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
      [ 'shiftUp' ],
      [ 'shiftDown' ],
      [ 'shiftLeft' ],
      [ 'shiftRight' ],
    ], function(e, d) {
      when('user '+e.action+' model selection', function() {
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
      });

      when('user '+e.action+'Small model selection', function() {
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
      });
    });

    when('user set orientation up on model selection', function() {
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

    when('user set orientation down on model selection', function() {
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
        this.gameFactionsService = spyOnService('gameFactions');
      }
    ]));

    using([
      [ 'move', 'base', 'result', 'small_result', 'before_check', 'after_check' ],
      [ 'rotateLeft', 'small',
        { info: 'info', x: 240, y: 240, r: 165 },
        { info: 'info', x: 240, y: 240, r: 175 } ],
      [ 'rotateRight', 'small',
        { info: 'info', x: 240, y: 240, r: 195 },
        { info: 'info', x: 240, y: 240, r: 185 } ],
      [ 'moveFront', 'small',
        { info: 'info', x: 240, y: 250, r: 180 },
        { info: 'info', x: 240, y: 245, r: 180 },
        { info: 'info', x: 240, y: 470, r: 180 },
        { info: 'info', x: 240, y: 474.095, r: 180 } ],
      [ 'moveBack', 'medium',
        { info: 'info', x: 240, y: 230, r: 180 },
        { info: 'info', x: 240, y: 235, r: 180 },
        { info: 'info', x: 240, y: 10, r: 180 },
        { info: 'info', x: 240, y: 7.874, r: 180 } ],
      [ 'shiftLeft', 'large',
        { info: 'info', x: 230, y: 240, r: 180 },
        { info: 'info', x: 239, y: 240, r: 180 },
        { info: 'info', x: 15, y: 240, r: 180 },
        { info: 'info', x: 9.842, y: 240, r: 180 } ],
      [ 'shiftRight', 'huge',
        { info: 'info', x: 250, y: 240, r: 180 },
        { info: 'info', x: 241, y: 240, r: 180 },
        { info: 'info', x: 450, y: 240, r: 180 },
        { info: 'info', x: 455.395, y: 240, r: 180 } ],
      [ 'shiftUp', 'small',
        { info: 'info', x: 240, y: 230, r: 180 },
        { info: 'info', x: 240, y: 239, r: 180 },
        { info: 'info', x: 240, y: 10, r: 180 },
        { info: 'info', x: 240, y: 5.905, r: 180 } ],
      [ 'shiftDown', 'small',
        { info: 'info', x: 240, y: 250, r: 180 },
        { info: 'info', x: 240, y: 241, r: 180 },
        { info: 'info', x: 240, y: 470, r: 180 },
        { info: 'info', x: 240, y: 474.095, r: 180 } ],
    ], function(e, d) {
      describe(e.move+'(<small>)', function() {
        beforeEach(function() {
          this.model = {
            state: { info: 'info', x: 240, y: 240, r: 180 }
          };
          this.gameFactionsService.getModelInfo._retVal = {
            base: e.base
          };
        });

        using([
          [ 'small', 'result' ],
          [ false  , e.result ],
          [ true   , e.small_result ],
        ], function(ee, dd) {
          it('should '+e.move+' model, '+dd, function() {
            this.modelService[e.move]('factions', ee.small, this.model);
            expect(this.model.state)
              .toEqual(ee.result);
          });
        });
        if(e.before_check) {
          it('should stay on the board', function() {
            this.model.state = e.before_check;
            this.modelService[e.move]('factions', false, this.model);
            expect(this.model.state)
              .toEqual(e.after_check);
          });
        }
      });
    });

    describe('setOrientation(<dir>)', function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info', x: 240, y: 240, r: 180 }
        };
        this.gameFactionsService.getModelInfo._retVal = {
          base: 'medium'
        };
      });

      it('should set model orientation', function() {
        this.modelService.setOrientation('factions', 15, this.model);
        expect(this.model.state)
          .toEqual({ info: 'info', x: 240, y: 240, r: 15 });
      });
    });
  });
});