'use strict';

describe('line', function() {
  describe('line service', function() {
    beforeEach(inject([
      'line',
      function(lineService) {
        this.lineService = lineService;
      }
    ]));

    describe('length()', function() {
      using([
        [ 'line', 'length'],
        [ { start: { x: 240, y: 0   },
            end:   { x: 240, y: 120 } },
          120
        ],
        [ { start: { x: 0, y: 240   },
            end:   { x: 140, y: 240 } },
          140
        ],
        [ { start: { x: 0, y: 0     },
            end:   { x: 140, y: 140 } },
          197.9898987322333
        ],
      ], function(e, d) {
        it('should return line length, '+d, function() {
          expect(this.lineService.length(e.line))
            .toBe(e.length);
        });
      });
    });

    describe('vector()', function() {
      using([
        [ 'line', 'length'],
        [ { start: { x: 240, y: 0   },
            end:   { x: 240, y: 120 } },
          { x: 0, y: 1 }
        ],
        [ { start: { x: 0, y: 240   },
            end:   { x: 140, y: 240 } },
          { x: 1, y: 0 }
        ],
        [ { start: { x: 0, y: 0     },
            end:   { x: 140, y: 140 } },
          { x: 0.7071067811865475,
            y: 0.7071067811865475 }
        ],
      ], function(e, d) {
        it('should return line unit vector, '+d, function() {
          expect(this.lineService.vector(e.line))
            .toEqual(e.length);
        });
      });
    });
  });
});
