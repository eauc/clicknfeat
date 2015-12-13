'use strict';

describe('copy model', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameModelsService = spyOnService('gameModels');
        mockReturnPromise(this.gameModelsService.copyStamps);
        this.gameModelsService.copyStamps.resolveWith = 'gameModels.copyStamps.returnValue';
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        
        this.scope = jasmine.createSpyObj('scope', [
          'doSwitchToMode'
        ]);
        this.scope.doSwitchToMode
          .and.returnValue('doSwitchToMode.returnValue');
        this.scope.create = {  };
        this.scope.game = { models: 'models',
                            model_selection: 'selection'
                          };
      }
    ]));

    when('copySelection()', function() {
      this.ret = this.modelsModeService.actions
        .copySelection(this.scope);
    }, function() {
      it('should copy current selection', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsService.copyStamps)
          .toHaveBeenCalledWith('gameModelSelection.get.returnValue', 'models');
      });

      it('should enter createModel mode', function() {
        this.thenExpect(this.ret, function(result) {
          expect(this.scope.create.model)
            .toBe('gameModels.copyStamps.returnValue');
          expect(this.scope.doSwitchToMode)
            .toHaveBeenCalledWith('CreateModel');
          expect(result)
            .toBe('doSwitchToMode.returnValue');
        });
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

    when('copyStamps(<stamps>)', function() {
      this.ret = this.gameModelsService
        .copyStamps(this.stamps, this.models);
    }, function() {
      beforeEach(function() {
        this.models = {
          active: [
            { state: { stamp: 'stamp1', x: 240, y: 240, r:  90, l: ['toto'] } },
            { state: { stamp: 'stamp2', x: 240, y: 120, r:  90, l: ['tata'] } },
            { state: { stamp: 'stamp3', x: 240, y: 240, r: 180, l: ['titi'] } },
          ],
          locked: [
            { state: { stamp: 'stamp4', x: 120, y: 240, r: 90, l: ['tutu'] } },
            { state: { stamp: 'stamp5', x: 240, y: 360, r:  0, l: ['tete'] } },
            { state: { stamp: 'stamp6', x: 360, y: 240, r: 90, l: ['toto'] } },
          ],
        };
      });

      using([
        [ 'stamps' , 'result' ],
        [ [ 'stamp1' ], {
          base: { x: 240, y: 240, r: 90 },
          models: [ { stamp: 'stamp1', x: 0, y: 0, r: 0, l: [ 'toto' ] } ]
        } ],
        [ [ 'stamp1', 'stamp4' ], {
          base: { x: 240, y: 240, r: 90 },
          models: [ { stamp: 'stamp1', x: 0, y: 0, r: 0, l: [ 'toto' ] },
                    { stamp: 'stamp4', x: -120, y: 0, r: 0, l: [ 'tutu' ] } ]
        } ],
        [ [ 'stamp2', 'stamp4', 'stamp6' ], {
          base: { x: 240, y: 120, r: 90 },
          models: [ { stamp: 'stamp2', x: 0, y: 0, r: 0, l: [ 'tata' ] },
                    { stamp: 'stamp4', x: -120, y: 120, r: 0, l: [ 'tutu' ] },
                    { stamp: 'stamp6', x: 120, y: 120, r: 0, l: [ 'toto' ] } ]
        } ],
      ], function(e, d) {
        when(d, function() {
          this.stamps = e.stamps;
        }, function() {
          it('should return copy object for <stamps>', function() {
            this.thenExpect(this.ret, function(result) {
              expect(result).toEqual(e.result);
            });
          });
        });
      });
    });
  });

  describe('point service', function() {
    beforeEach(inject([
      'point',
      function(pointService) {
        this.pointService = pointService;
      }
    ]));

    when('differenceFrom(<other>)', function() {
      this.ret = this.pointService
        .differenceFrom(this.other, this.point);
    }, function() {
      beforeEach(function() {
        this.point = { x: 120, y: 360, r: 45, other: 'other' };
      });

      using([
        [ 'other', 'result' ],
        [ { x: 0, y: 0, r: 0 }, { x: 120, y: 360, r: 45, other: 'other' } ],
        [ { x: 120, y: 360, r: 45 }, { x: 0, y: 0, r: 0, other: 'other' } ],
        [ { x: 240, y: 240, r: 90 }, { x: -120, y: 120, r: -45, other: 'other' } ],
      ], function(e, d) {
        when(d, function() {
          this.other = e.other;
        }, function() {
          it('should return point with <other> substracted', function() {
            expect(this.ret).toEqual(e.result);
          });
        });
      });
    });
      
    when('differenceFrom(<other>)', function() {
      this.ret = this.pointService
        .addToWithFlip(this.flip, this.other, this.point);
    }, function() {
      beforeEach(function() {
        this.point = { x: 120, y: 60, r: 45, other: 'other' };
      });

      using([
        [ 'other', 'flip', 'result' ],
        [ { x: 0, y: 0, r: 0 }     , false, { x: 120, y: 60, r: 45, other: 'other' } ],
        [ { x: 120, y: 360, r: 45 }, false, { x: 240, y: 420, r: 90, other: 'other' } ],
        [ { x: 240, y: 240, r: 90 }, false, { x: 360, y: 300, r: 135, other: 'other' } ],
        [ { x: 0, y: 0, r: 0 }     , true, { x: -120, y: -60, r: 225, other: 'other' } ],
        [ { x: 120, y: 360, r: 45 }, true, { x: 0, y: 300, r: 270, other: 'other' } ],
        [ { x: 240, y: 240, r: 90 }, true, { x: 120, y: 180, r: 315, other: 'other' } ],
      ], function(e, d) {
        when(d, function() {
          this.other = e.other;
          this.flip = e.flip;
        }, function() {
          it('should return point with <other> substracted', function() {
            expect(this.ret).toEqual(e.result);
          });
        });
      });
    });
  });
});
