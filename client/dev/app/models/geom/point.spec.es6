describe('point model', function() {
  beforeEach(inject([
    'point',
    function(pointModel) {
      this.pointModel = pointModel;
    }
  ]));

  example(function(e, d) {
    describe(e.move+'(<arg>)', function() {
      it('should '+e.move+' point, '+d, function() {
        expect(this.pointModel[e.move](e.arg, e.before))
          .toEqual(e.after);
      });
    });
  }, [
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
  ]);

  describe('distanceTo(<other>)', function() {
    example(function(e, d) {
      it('should return distance to other point, '+d, function() {
        expect(this.pointModel.distanceTo(e.other, {
          x: 240,
          y: 240
        })).toBe(e.distance);
      });
    }, [
      ['other'              , 'distance'        ],
      [{x: 240 , y: 0}      , 240               ],
      [{x: 240 , y: 120}    , 120               ],
      [{x: 120 , y: 120}    , 169.7056274847714 ],
    ]);
  });

  describe('directionTo(<other>)', function() {
    example(function(e, d) {
      it('should return direction to other point, '+d, function() {
        expect(this.pointModel.directionTo(e.other, {
          x: 240,
          y: 240
        })).toBe(e.direction);
      });
    }, [
      ['other'           , 'direction'],
      [{x: 240 , y: 0}   , 0   ],
      [{x: 0   , y: 240} , -90 ],
      [{x: 120 , y: 120} , -45 ],
    ]);
  });

  describe('translateInDirection(<length>, <direction>)', function() {
    example(function(e, d) {
      it('should return translated point, '+d, function() {
        expect(this.pointModel.translateInDirection(e.length, e.dir, {
          x: 240,
          y: 240
        })).toEqual(e.translated);
      });
    }, [
      [ 'length',  'dir' , 'translated'       ],
      [ 10      ,  0     , { x: 240, y: 230 } ],
      [ 20      ,  90    , { x: 260, y: 240 } ],
      [ 30      ,  180   , { x: 240, y: 270 } ],
      [ 40      , -90    , { x: 200, y: 240 } ],
      [ 50      , -45    , { x: 204.64466094067262,
                             y: 204.64466094067262 } ],
    ]);
  });

  describe('translateInVector(<length>, <direction>)', function() {
    example(function(e, d) {
      it('should return translated point, '+d, function() {
        expect(this.pointModel.translateInVector(e.length, e.vector, {
          x: 240,
          y: 240
        })).toEqual(e.translated);
      });
    }, [
      [ 'length',  'vector'            , 'translated'       ],
      [ 10      ,  { x:  1, y:  0 }    , { x: 250, y: 240 } ],
      [ 10      ,  { x:  0, y:  1 }    , { x: 240, y: 250 } ],
      [ 10      ,  { x: -1, y:  0 }    , { x: 230, y: 240 } ],
      [ 10      ,  { x:  0, y: -1 }    , { x: 240, y: 230 } ],
    ]);
  });

  describe('rotateLeftAround(<angle>, <center>)', function() {
    example(function(e, d) {
      it('should return rotated point, '+d, function() {
        expect(this.pointModel.rotateLeftAround(e.angle, {
          x: 240,
          y: 240
        }, {
          x: 120,
          y: 240
        })).toEqual(e.res);
      });
    }, [
      [ 'angle' ,  'res'       ],
      [ 90      , { x: 239.99999999999997, y: 360 } ],
      [ 180     , { x: 360, y: 240.00000000000003 } ],
      [ -90     , { x: 240, y: 120 } ],
      [ 45      , { x: 155.1471862576143, y: 324.8528137423857 } ],
      [ 135     , { x: 324.8528137423857, y: 324.8528137423857 } ],
    ]);
  });

  describe('rotateRightAround(<angle>, <center>)', function() {
    example(function(e, d) {
      it('should return rotated point, '+d, function() {
        expect(this.pointModel.rotateRightAround(e.angle, {
          x: 240,
          y: 240
        }, {
          x: 120,
          y: 240
        })).toEqual(e.res);
      });
    }, [
      [ 'angle' ,  'res'       ],
      [ 90      , { x: 240, y: 120 } ],
      [ 180     , { x: 360, y: 240 } ],
      [ -90     , { x: 239.99999999999997, y: 360 } ],
      [ 45      , { x: 155.1471862576143, y: 155.1471862576143 } ],
      [ 135     , { x: 324.8528137423857, y: 155.1471862576143 } ],
    ]);
  });

  describe('rotateAroundTo(<angle>, <center>)', function() {
    example(function(e, d) {
      it('should return rotated point, '+d, function() {
        expect(this.pointModel.rotateAroundTo(e.angle, {
          x: 240,
          y: 240
        }, {
          x: 120,
          y: 240
        })).toEqual(e.res);
      });
    }, [
      [ 'angle' ,  'res'       ],
      [ 90      , { x: 360, y: 240 } ],
      [ 180     , { x: 240.00000000000003, y: 360 } ],
      [ -90     , { x: 120, y: 240 } ],
      [ 45      , { x: 324.8528137423857, y: 155.1471862576143 } ],
      [ 135     , { x: 324.8528137423857, y: 324.8528137423857 } ],
    ]);
  });

  describe('addToWithFlip(<flip>, <other>)', function() {
    example(function(e, d) {
      it('should add points coordinates, '+d, function() {
        expect(this.pointModel.addToWithFlip(e.flip, e.other, {
          x: 240,
          y: 240,
          r: 90
        })).toEqual(e.result);
      });
    }, [
      [ 'flip' ,  'other'                , 'result' ],
      [ false  , { x: 60, y: 40, r: 90 } , { x: 300, y: 280, r: 180 } ],
      [ true   , { x: 60, y: 40, r: 90 } , { x: -180, y: -200, r: 360 } ],
      [ false  , { x: -60, y: -40, r: -90 } , { x: 180, y: 200, r: 0 } ],
      [ true   , { x: -60, y: -40, r: -90 } , { x: -300, y: -280, r: 180 } ],
    ]);
  });

  describe('differenceFrom(<other>)', function() {
    example(function(e, d) {
      it('should substract <other> from point, '+d, function() {
        expect(this.pointModel.differenceFrom(e.other, {
          x: 240,
          y: 240,
          r: 90
        })).toEqual(e.result);
      });
    }, [
      [ 'other'                   , 'result' ],
      [ { x: 260, y: 240, r: -90 } , { x: -20, y: 0, r: 180 } ],
      [ { x: 260, y: 220, r: 0  } , { x: -20, y: 20, r: 90 } ],
    ]);
  });

  describe('vectorProduct(<other>)', function() {
    example(function(e, d) {
      it('should compute vector product, '+d, function() {
        expect(this.pointModel.vectorProduct(e.other, {
          x: 140,
          y: 340
        })).toEqual(e.result);
      });
    }, [
      [ 'other'            , 'result' ],
      [ { x: 1, y: 0 }     , -340  ],
      [ { x: 0, y: 1 }     , 140   ],
      [ { x: 140, y: 340 } , 0 ],
    ]);
  });

  describe('scalarProduct(<other>)', function() {
    example(function(e, d) {
      it('should compute scalar product, '+d, function() {
        expect(this.pointModel.scalarProduct(e.other, {
          x: 140,
          y: 340
        })).toEqual(e.result);
      });
    }, [
      [ 'other'             , 'result' ],
      [ { x: 1, y: 0 }      , 140      ],
      [ { x: 0, y: 1 }      , 340      ],
      [ { x: 340, y: -140 } , 0        ],
    ]);
  });
});
