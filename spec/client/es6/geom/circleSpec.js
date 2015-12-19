'use strict';

describe('circle', function() {
  describe('circle service', function() {
    beforeEach(inject([
      'circle',
      function(circleService) {
        this.circleService = circleService;
      }
    ]));

    describe('isRightOfLine(<line>)', function() {
      using([
        [ 'circle', 'result'],
        [ {  x: 240, y: 0, radius: 10 }, false ],
        [ {  x: 0, y: 240, radius: 10 }, true  ],
        [ {  x: 480, y: 240, radius: 10 }, false ],
        [ {  x: 240, y: 480, radius: 10 }, true  ],
        [ {  x: 240, y: 240, radius: 10 }, true  ],
        // right side but behind start
        [ {  x: 0, y: 220, radius: 10 }, false  ],
        // right side but forward end
        [ {  x: 480, y: 260, radius: 10 }, false  ],
        // left side overlaps
        [ {  x: 235, y: 235, radius: 10 }, true  ],
      ], function(e, d) {
        it('should check if circle overflows to the right of <line>, '+d, function() {
          expect(this.circleService.isRightOfLine({
            start: { x: 120, y: 120 },
            end:   { x: 360, y: 360 }
          }, e.circle)).toBe(e.result);
        });
      });
    });

    describe('isLeftOfLine(<line>)', function() {
      using([
        [ 'circle', 'result'],
        [ {  x: 240, y: 0, radius: 10 }, true ],
        [ {  x: 0, y: 240, radius: 10 }, false ],
        [ {  x: 480, y: 240, radius: 10 }, true ],
        [ {  x: 240, y: 480, radius: 10 }, false  ],
        [ {  x: 240, y: 240, radius: 10 }, true  ],
        // left side but behind start
        [ {  x: 220, y: 0, radius: 10 }, false  ],
        // left side but forward end
        [ {  x: 260, y: 480, radius: 10 }, false  ],
        // right side overlaps
        [ {  x: 245, y: 245, radius: 10 }, true  ],
      ], function(e, d) {
        it('should check if circle overflows to the left of <line>, '+d, function() {
          expect(this.circleService.isLeftOfLine({
            start: { x: 120, y: 120 },
            end:   { x: 360, y: 360 }
          }, e.circle)).toBe(e.result);
        });
      });
    });

    describe('isInEnvelope(<envelope>)', function() {
      using([
        [ 'circle', 'result'],
        [ {  x: 200, y: 240, radius: 10 }, false ],
        [ {  x: 215, y: 240, radius: 10 }, true ],
        [ {  x: 220, y: 240, radius: 10 }, true ],
        [ {  x: 225, y: 240, radius: 10 }, true ],
        [ {  x: 240, y: 240, radius: 10 }, true ],
        [ {  x: 255, y: 240, radius: 10 }, true ],
        [ {  x: 260, y: 240, radius: 10 }, true ],
        [ {  x: 265, y: 240, radius: 10 }, true ],
        [ {  x: 280, y: 240, radius: 10 }, false ],
        // behind
        [ {  x: 240, y: 105, radius: 10 }, false ],
        [ {  x: 240, y: 110, radius: 10 }, true ],
        [ {  x: 240, y: 115, radius: 10 }, true ],
        [ {  x: 220, y: 120, radius: 10 }, true ],
        [ {  x: 210, y: 105, radius: 10 }, false ],
        // forward
        [ {  x: 240, y: 375, radius: 10 }, false ],
        [ {  x: 240, y: 370, radius: 10 }, true ],
        [ {  x: 240, y: 365, radius: 10 }, true ],
        [ {  x: 260, y: 360, radius: 10 }, true ],
        [ {  x: 270, y: 375, radius: 10 }, false ],
      ], function(e, d) {
        it('should check if circle is in <envelope>, '+d, function() {
          expect(this.circleService.isInEnvelope({
            left: { start: { x: 260, y: 120 },
                    end:   { x: 260, y: 360 }
                  },
            right: { start: { x: 220, y: 120 },
                     end:   { x: 220, y: 360 }
                   }
          }, e.circle)).toBe(e.result);
        });
      });
    });


    describe('isInBox(<line>)', function() {
      using([
        [ 'circle', 'result'],
        [ {  x: 240, y: 240, radius: 10 }, true ],
        [ {  x: 120, y: 120, radius: 10 }, true ],
        [ {  x: 120, y: 360, radius: 10 }, true ],
        [ {  x: 360, y: 120, radius: 10 }, true ],
        [ {  x: 360, y: 360, radius: 10 }, true ],
        [ {  x: 110, y: 110, radius: 10 }, false ],
        [ {  x: 110, y: 370, radius: 10 }, false ],
        [ {  x: 370, y: 110, radius: 10 }, false ],
        [ {  x: 370, y: 370, radius: 10 }, false ],
        [ {  x: 115, y: 115, radius: 10 }, true ],
        [ {  x: 115, y: 365, radius: 10 }, true ],
        [ {  x: 365, y: 115, radius: 10 }, true ],
        [ {  x: 365, y: 365, radius: 10 }, true ],
        [ {  x: 109, y: 240, radius: 10 }, false ],
        [ {  x: 371, y: 240, radius: 10 }, false ],
        [ {  x: 240, y: 109, radius: 10 }, false ],
        [ {  x: 240, y: 371, radius: 10 }, false ],
      ], function(e, d) {
        it('should check if circle is in <box>, '+d, function() {
          expect(this.circleService.isInBox({
            low:  { x: 120, y: 120 },
            high: { x: 360, y: 360 }
          }, e.circle)).toBe(e.result);
        });
      });
    });

    describe('intersectLine(<line>)', function() {
      using([
        [ 'circle', 'result'],
        // too far
        [ { x: 240, y: 0, radius: 10 }, false   ],
        // middle
        [ { x: 250, y: 230, radius: 10 }, false ],
        [ { x: 245, y: 245, radius: 10 }, true  ],
        [ { x: 240, y: 240, radius: 10 }, true  ],
        // behind
        [ { x: 110, y: 110, radius: 10 }, false ],
        [ { x: 115, y: 110, radius: 10 }, false ],
        [ { x: 115, y: 115, radius: 10 }, true ],
        [ { x: 120, y: 120, radius: 10 }, true  ],
        // forward
        [ { x: 370, y: 370, radius: 10 }, false ],
        [ { x: 365, y: 370, radius: 10 }, false ],
        [ { x: 365, y: 365, radius: 10 }, true ],
        [ { x: 360, y: 360, radius: 10 }, true ],
      ], function(e, d) {
        it('should check if circle intersects <line>, '+d, function() {
          expect(this.circleService.intersectLine({
            start: { x: 120, y: 120 },
            end:   { x: 360, y: 360 }
          }, e.circle)).toBe(e.result);
        });
      });
    });

    describe('pointOnEdgeInDirection(<dir>)', function() {
      using([
        [ 'dir', 'result'],
        [ 0    , { x: 240, y: 230 } ],
        [ 90   , { x: 250, y: 240 } ],
        [ 180  , { x: 240, y: 250 } ],
        [ 270  , { x: 230, y: 240 } ],
        [ 45   , { x: 247.07106781186548, y: 232.92893218813452 } ],
      ], function(e, d) {
        it('should return point on circle in <dir>, '+d, function() {
          expect(this.circleService.pointOnEdgeInDirection(e.dir, {
            x: 240, y: 240, radius: 10
          })).toEqual(e.result);
        });
      });
    });

    describe('pointOnEdgeTangentTo(<point>, <left>)', function() {
      using([
        [ 'point', 'left', 'result'],
        [ { x: 240, y: 200 }, false, { x: 230.31754163448147, y: 237.5 } ],
        [ { x: 240, y: 200 }, true,  { x: 249.68245836551853, y: 237.5 } ],
        [ { x: 280, y: 240 }, false, { x: 242.5, y: 230.31754163448147 } ],
        [ { x: 280, y: 240 }, true,  { x: 242.5, y: 249.68245836551856 } ],
        [ { x: 240, y: 280 }, false, { x: 249.68245836551853, y: 242.5 } ],
        [ { x: 240, y: 280 }, true,  { x: 230.31754163448147, y: 242.5 } ],
        [ { x: 200, y: 240 }, false, { x: 237.5, y: 249.68245836551856 } ],
        [ { x: 200, y: 240 }, true,  { x: 237.5, y: 230.31754163448147 } ],
        [ { x: 200, y: 280 }, false, { x: 245.70970545353754, y: 248.20970545353754 } ],
        [ { x: 200, y: 280 }, true,  { x: 231.79029454646246, y: 234.29029454646246 } ],
      ], function(e, d) {
        it('should return point on circle tangent to <point>, '+d, function() {
          expect(this.circleService.pointOnEdgeTangentTo(e.point, e.left, {
            x: 240, y: 240, radius: 10
          })).toEqual(e.result);
        });
      });
    });

    describe('envelopeDirectionsTo(<target>)', function() {
      using([
        [ 'target', 'result'],
        [ { x: 240, y: 200, radius: 10 }, { left: -90, right: 90} ],
        [ { x: 240, y: 200, radius: 20 }, { left: -104.47751218592992, right: 104.47751218592992 } ],
        [ { x: 240, y: 200, radius: 5 }, { left: -82.81924421854171, right: 82.81924421854171 } ],
        [ { x: 220, y: 220, radius: 10 }, { left: -135, right: 45 } ],
      ], function(e, d) {
        it('should return arc facing target, '+d, function() {
          expect(this.circleService.envelopeDirectionsTo(e.target, {
            x: 240, y: 240, radius: 10
          })).toEqual(e.result);
        });
      });
    });

    describe('envelopeTo(<target>)', function() {
      using([
        [ 'target', 'result'],
        [ { x: 240, y: 200, radius: 10 },
          { right: { start: { x: 250, y: 240 },
                     end: { x: 250, y: 200 }
                   },
            left: { start: { x: 230, y: 240 },
                    end: { x: 230, y: 200 }
                  }
          }
        ],
        [ { x: 240, y: 200, radius: 20 },
          { right: { start: { x: 249.68245836551853, y: 242.5 },
                     end: { x: 259.36491673103706, y: 205 }
                   },
            left: { start: { x: 230.31754163448147, y: 242.5 },
                    end: { x: 220.63508326896292, y: 205 }
                  }
          }
        ],
        [ { x: 240, y: 200, radius: 5 },
          { right: { start: { x: 249.92156741649222, y: 238.75 },
                     end: { x: 244.9607837082461, y: 199.375 } },
            left: { start: { x: 230.07843258350778, y: 238.75 },
                    end: { x: 235.0392162917539, y: 199.375 }
                  }
          }
        ],
        [ { x: 220, y: 220, radius: 10 },
          { right: { start: { x: 247.07106781186548, y: 232.92893218813452 },
                     end: { x: 227.07106781186548, y: 212.92893218813452 }
                   },
            left: { start: { x: 232.92893218813452, y: 247.07106781186548 },
                    end: { x: 212.92893218813452, y: 227.07106781186548 }
                  }
          }
        ],
      ], function(e, d) {
        it('should return envelope facing target, '+d, function() {
          expect(this.circleService.envelopeTo(e.target, {
            x: 240, y: 240, radius: 10
          })).toEqual(e.result);
        });
      });
    });

    describe('outsideEnvelopeTo(<target>)', function() {
      using([
        [ 'target', 'result'],
        [ { x: 240, y: 200, radius: 10 },
          { right: { start: { x: 250, y: 200 },
                     end: { x: 250, y: -600 }
                   },
            left: { start: { x: 230, y: 200 },
                    end: { x: 230, y: -600 }
                  }
          }
        ],
        [ { x: 240, y: 200, radius: 20 },
          { right: { start: { x: 259.36491673103706, y: 205 },
                     end: { x: 459.3649167310368, y: -569.5966692414834 }
                   },
            left: { start: { x: 220.63508326896292, y: 205 },
                    end: { x: 20.635083268962603, y: -569.5966692414834 }
                  }
          }
        ],
        [ { x: 240, y: 200, radius: 5 },
          { left: { start: { x: 235.0392162917539, y: 199.375 },
                    end: { x: 240, y: 160 }
                  },
            right: { start: { x: 244.9607837082461, y: 199.375 },
                     end: { x: 240, y: 160 }
                   }
          }
        ],
        [ { x: 220, y: 220, radius: 10 },
          { right: { start: { x: 227.07106781186548, y: 212.92893218813452 },
                     end: { x: -338.61435713737245, y: -352.7564927611034 }
                   },
            left: { start: { x: 212.92893218813452, y: 227.07106781186548 },
                    end: { x: -352.7564927611034, y: -338.61435713737245 }
                  }
          }
        ],
      ], function(e, d) {
        it('should return outside envelope facing target, '+d, function() {
          expect(this.circleService.outsideEnvelopeTo(e.target, [], {
            x: 240, y: 240, radius: 10
          })).toEqual(e.result);
        });
      });
    });
  });
});
