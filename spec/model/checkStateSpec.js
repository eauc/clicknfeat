'use strict';

describe('model check state', function() {
  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
        this.gameFactionsService = spyOnService('gameFactions');
      }
    ]));

    describe('checkState(<factions>, <target>)', function() {
      beforeEach(function() {
        this.gameFactionsService.getModelInfo._retVal = {
          base_radius: 7.874
        };
      });

      using([
        [ 'pos', 'res' ],
        [ { x: 480, y: 240 }, { x: 472.126, y: 240 } ],
        [ { x: 0, y: 240 }, { x: 7.874, y: 240 } ],
        [ { x: 240, y: 480 }, { x: 240, y: 472.126 } ],
        [ { x: 240, y: 0 }, { x: 240, y: 7.874 } ],
      ], function(e, d) {
        it('should keep model on board, '+d, function() {
          this.state = R.merge(e.pos, { info: 'info' });

          this.res = this.modelService.checkState('factions', null, this.state);

          expect(R.pick(['x','y'], this.res))
            .toEqual(e.res);
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
        it('should ensure max charge distance, '+d, function() {
          this.state = R.merge(e.pos, {
            info: 'info',
            cml: 10,
            cha: { s: { x: 240, y: 240 } }
          });

          this.res = this.modelService.checkState('factions', null, this.state);

          expect(R.pick(['x','y'], this.res))
            .toEqual(e.res);
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
        it('should ensure charge orientation, '+d, function() {
          this.state = R.merge(e.pos, {
            info: 'info',
            cha: { s: { x: 240, y: 240 } }
          });

          this.res = this.modelService.checkState('factions', null, this.state);

          expect(R.pick(['r'], this.res))
            .toEqual(e.res);
        });
      });

      using([
        [ 'pos', 'res' ],
        [ { x: 480, y: 240 }, { r: -71.18155179962957 } ],
        [ { x: 0, y: 240 }, { r: 43.05720147751564 } ],
        [ { x: 240, y: 480 }, { r: -18.81844820037043 } ],
        [ { x: 240, y: 0 }, { r: -133.05720147751566 } ],
      ], function(e, d) {
        it('should orient model to target, '+d, function() {
          this.state = R.merge(e.pos, {
            info: 'info',
            cha: { s: { x: 240, y: 240 } }
          });
          this.target = { state: { x: 120, y: 120 } };

          this.res = this.modelService.checkState('factions', this.target, this.state);

          expect(R.pick(['r'], this.res))
            .toEqual(e.res);
        });
      });
    });
  });
});
