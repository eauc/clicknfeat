'use strict';

describe('model check state', function() {
  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
        this.gameFactionsService = spyOnService('gameFactions');
        mockReturnPromise(this.gameFactionsService.getModelInfo);
      }
    ]));

    when('checkState(<factions>, <target>)', function() {
      this.ret = this.modelService.checkState('factions', this.target, this.model);
    }, function() {
      beforeEach(function() {
        this.gameFactionsService.getModelInfo.resolveWith = {
          base_radius: 7.874
        };
        this.model = { state: { info: 'info' } };
        this.target = null;
      });

      it('should fetch model info', function() {
        this.thenExpect(this.ret, function(model) {
          expect(this.gameFactionsService.getModelInfo)
            .toHaveBeenCalledWith('info', 'factions');
        });
      });

      using([
        [ 'pos', 'res' ],
        [ { x: 480, y: 240 }, { x: 472.126, y: 240 } ],
        [ { x: 0, y: 240 }, { x: 7.874, y: 240 } ],
        [ { x: 240, y: 480 }, { x: 240, y: 472.126 } ],
        [ { x: 240, y: 0 }, { x: 240, y: 7.874 } ],
      ], function(e, d) {
        when(d, function() {
          this.model.state = R.merge(e.pos, this.model.state);
        }, function() {          
          it('should keep model on board, '+d, function() {
            this.thenExpect(this.ret, function(model) {
              expect(R.pick(['x','y'], model.state))
                .toEqual(e.res);
            });
          });
        });
      });

      using([
        [ 'pos', 'res' ],
        [ { x: 480, y: 240 }, { x: 340, y: 240 } ],
        [ { x: 0, y: 240 }, { x: 140, y: 240 } ],
        [ { x: 240, y: 480 }, { x: 240, y: 340 } ],
        [ { x: 240, y: 0 }, { x: 240, y: 140 } ],
        [ { x: 0, y: 0 }, { x: 169.28932188134524, y: 169.28932188134524 } ],
        [ { x: 480, y: 480 }, { x: 310.71067811865476, y: 310.71067811865476 } ],
      ], function(e, d) {
        when(d, function() {
          this.model.state = R.merge(e.pos, {
            info: 'info',
            cml: 10,
            cha: { s: { x: 240, y: 240 } }
          });
        }, function() {
          it('should ensure max charge distance, '+d, function() {
            this.thenExpect(this.ret, function(model) {
              expect(R.pick(['x','y'], model.state))
                .toEqual(e.res);
            });
          });
        });
      });

      using([
        [ 'pos', 'res' ],
        [ { x: 480, y: 240 }, { r: 90 } ],
        [ { x: 0, y: 240 }, { r: -90 } ],
        [ { x: 240, y: 480 }, { r: 180 } ],
        [ { x: 240, y: 0 }, { r: 0 } ],
        [ { x: 0, y: 0 }, { r: -45 } ],
        [ { x: 480, y: 480 }, { r: 135 } ],
      ], function(e, d) {
        when(d, function() {
          this.model.state = R.merge(e.pos, {
            info: 'info',
            cha: { s: { x: 240, y: 240 } }
          });
        }, function() {
          it('should ensure charge orientation, '+d, function() {
            this.thenExpect(this.ret, function(model) {
              expect(R.pick(['r'], model.state))
                .toEqual(e.res);
            });
          });
        });
      });

      using([
        [ 'pos', 'res' ],
        [ { x: 480, y: 240 }, { r: -71.18155179962957 } ],
        [ { x: 0, y: 240 }, { r: 43.05720147751564 } ],
        [ { x: 240, y: 480 }, { r: -18.81844820037043 } ],
        [ { x: 240, y: 0 }, { r: -133.05720147751566 } ],
      ], function(e, d) {
        when(d, function() {
          this.model.state = R.merge(e.pos, {
            info: 'info',
            cha: { s: { x: 240, y: 240 } }
          });
        }, function() {
          beforeEach(function() {
            this.target = { state: { x: 120, y: 120 } };
          });
          
          it('should orient model to target, '+d, function() {
            this.thenExpect(this.ret, function(model) {
              expect(R.pick(['r'], model.state))
                .toEqual(e.res);
            });
          });
        });
      });

      using([
        [ 'within', 'pos'              , 'res'                      ],
        [ false   , { x: 480, y: 240 } , { x: 340    , y: 240     } ],
        [ true    , { x: 480, y: 240 } , { x: 355.748, y: 240     } ],
        [ false   , { x: 0, y: 240 }   , { x: 140    , y: 240     } ],
        [ true    , { x: 0, y: 240 }   , { x: 124.252, y: 240     } ],
        [ false   , { x: 240, y: 480 } , { x: 240    , y: 340     } ],
        [ true    , { x: 240, y: 480 } , { x: 240    , y: 355.748 } ],
        [ false   , { x: 240, y: 0 }   , { x: 240    , y: 140     } ],
        [ true    , { x: 240, y: 0 }   , { x: 240    , y: 124.252 } ],
        [ false   , { x: 0, y: 0 }     , { x: 169.28932188134524 , y: 169.28932188134524 } ],
        [ true    , { x: 0, y: 0 }     , { x: 158.1538042912195  , y: 158.1538042912195  } ],
        [ false   , { x: 480, y: 480 } , { x: 310.71067811865476 , y: 310.71067811865476 } ],
        [ true    , { x: 480, y: 480 } , { x: 321.8461957087805  , y: 321.8461957087805  } ],
      ], function(e, d) {
        when(d, function() {
          this.model.state = R.merge(e.pos, {
            info: 'info',
            pml: [ 10, e.within ],
            pla: { s: { x: 240, y: 240 } }
          });
        }, function() {
          it('should ensure max place distance, '+d, function() {
            this.thenExpect(this.ret, function(model) {
              expect(R.pick(['x','y'], model.state))
                .toEqual(e.res);
            });
          });
        });
      });
    });
  });
});
