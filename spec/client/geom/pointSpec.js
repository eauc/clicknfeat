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
    
    describe('directionTo(<other>)', function() {
      using([
        ['other', 'direction'],
        [{x: 240, y: 0}, 0],
        [{x: 0, y: 240}, -90],
        [{x: 120, y: 120}, -45],
      ], function(e, d) {
        it('should return direction to other point, '+d, function() {
          expect(this.pointService.directionTo(e.other, {
            x: 240,
            y: 240
          })).toBe(e.direction);
        });
      });
    });
    
    describe('translateInDirection(<length>, <direction>)', function() {
      using([
        [ 'length',  'dir' , 'translated'       ],
        [ 10      ,  0     , { x: 240, y: 230 } ],
        [ 20      ,  90    , { x: 260, y: 240 } ],
        [ 30      ,  180   , { x: 240, y: 270 } ],
        [ 40      , -90    , { x: 200, y: 240 } ],
        [ 50      , -45    , { x: 204.64466094067262,
                               y: 204.64466094067262 } ],
      ], function(e, d) {
        it('should return translated point, '+d, function() {
          expect(this.pointService.translateInDirection(e.length, e.dir, {
            x: 240,
            y: 240
          })).toEqual(e.translated);
        });
      });
    });
    
    describe('rotateLeftAround(<angle>, <center>)', function() {
      using([
        [ 'angle' ,  'res'       ],
        [ 90      , { x: 239.99999999999997, y: 360 } ],
        [ 180     , { x: 360, y: 240.00000000000003 } ],
        [ -90     , { x: 240, y: 120 } ],
        [ 45      , { x: 155.1471862576143, y: 324.8528137423857 } ],
        [ 135     , { x: 324.8528137423857, y: 324.8528137423857 } ],
      ], function(e, d) {
        it('should return rotated point, '+d, function() {
          expect(this.pointService.rotateLeftAround(e.angle, {
            x: 240,
            y: 240
          }, {
            x: 120,
            y: 240
          })).toEqual(e.res);
        });
      });
    });
    
    describe('rotateRightAround(<angle>, <center>)', function() {
      using([
        [ 'angle' ,  'res'       ],
        [ 90      , { x: 240, y: 120 } ],
        [ 180     , { x: 360, y: 240 } ],
        [ -90     , { x: 239.99999999999997, y: 360 } ],
        [ 45      , { x: 155.1471862576143, y: 155.1471862576143 } ],
        [ 135     , { x: 324.8528137423857, y: 155.1471862576143 } ],
      ], function(e, d) {
        it('should return rotated point, '+d, function() {
          expect(this.pointService.rotateRightAround(e.angle, {
            x: 240,
            y: 240
          }, {
            x: 120,
            y: 240
          })).toEqual(e.res);
        });
      });
    });
  });
});
