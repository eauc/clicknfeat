'use strict';

describe('point', function() {
  describe('point service', function() {
    beforeEach(inject([
      'point',
      function(pointService) {
        this.pointService = pointService;
      }
    ]));

    using([
      [ 'move', 'arg', 'before', 'after' ],
      [ 'rotateLeft', 10,
        { x: 240, y: 240, r: 120 },
        { x: 240, y: 240, r: 110 } ],
      [ 'rotateLeft', 1,
        { x: 240, y: 240, r: 120 },
        { x: 240, y: 240, r: 119 } ],
      [ 'rotateRight', 10,
        { x: 240, y: 240, r: 120 },
        { x: 240, y: 240, r: 130 } ],
      [ 'rotateRight', 1,
        { x: 240, y: 240, r: 120 },
        { x: 240, y: 240, r: 121 } ],
      [ 'moveFront', 10,
        { x: 240, y: 240, r: 180 },
        { x: 240, y: 250, r: 180 } ],
      [ 'moveFront', 1,
        { x: 240, y: 240, r: 180 },
        { x: 240, y: 241, r: 180 } ],
      [ 'moveFront', 10,
        { x: 240, y: 240, r: 90 },
        { x: 250, y: 240, r: 90 } ],
      [ 'moveBack', 10,
        { x: 240, y: 240, r: 180 },
        { x: 240, y: 230, r: 180 } ],
      [ 'moveBack', 1,
        { x: 240, y: 240, r: 180 },
        { x: 240, y: 239, r: 180 } ],
      [ 'moveBack', 10,
        { x: 240, y: 240, r: 90 },
        { x: 230, y: 240, r: 90 } ],
      [ 'shiftLeft', 10,
        { x: 240, y: 240, r: 180 },
        { x: 230, y: 240, r: 180 } ],
      [ 'shiftLeft', 1,
        { x: 240, y: 240, r: 180 },
        { x: 239, y: 240, r: 180 } ],
      [ 'shiftRight', 10,
        { x: 240, y: 240, r: 180 },
        { x: 250, y: 240, r: 180 } ],
      [ 'shiftRight', 1,
        { x: 240, y: 240, r: 180 },
        { x: 241, y: 240, r: 180 } ],
      [ 'shiftUp', 10,
        { x: 240, y: 240, r: 180 },
        { x: 240, y: 230, r: 180 } ],
      [ 'shiftUp', 1,
        { x: 240, y: 240, r: 180 },
        { x: 240, y: 239, r: 180 } ],
      [ 'shiftDown', 10,
        { x: 240, y: 240, r: 180 },
        { x: 240, y: 250, r: 180 } ],
      [ 'shiftDown', 1,
        { x: 240, y: 240, r: 180 },
        { x: 240, y: 241, r: 180 } ],
    ], function(e, d) {
      describe(e.move+'(<arg>)', function() {
        it('should '+e.move+' point, '+d, function() {
          expect(this.pointService[e.move](e.arg, e.before))
            .toEqual(e.after);
        });
      });
    });

    describe('distanceTo(<other>)', function() {
      using([
        ['other', 'distance'],
        [{x: 240, y: 0}, 240],
        [{x: 240, y: 120}, 120],
        [{x: 120, y: 120}, 169.7056274847714],
      ], function(e, d) {
        it('should return distance to other point, '+d, function() {
          expect(this.pointService.distanceTo(e.other, {
            x: 240,
            y: 240
          })).toBe(e.distance);
        });
      });
    });
  });
});
