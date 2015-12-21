describe('terrain check state', function() {
  describe('terrain service', function() {
    beforeEach(inject([
      'terrain',
      function(terrainService) {
        this.terrainService = terrainService;
      }
    ]));

    when('checkState(<factions>, <target>)', function() {
      this.ret = this.terrainService
        .checkState(this.terrain);
    }, function() {
      beforeEach(function() {
        this.terrain = { state: { info: 'info' } };
      });

      using([
        [ 'pos', 'res' ],
        [ { x: 490, y: 240 }, { x: 480, y: 240 } ],
        [ { x: -10, y: 240 }, { x: 0,   y: 240 } ],
        [ { x: 240, y: 490 }, { x: 240, y: 480 } ],
        [ { x: 240, y: -10 }, { x: 240, y: 0   } ],
      ], function(e, d) {
        when(d, function() {
          this.terrain.state = R.merge(e.pos, this.terrain.state);
        }, function() {          
          it('should keep terrain on board, '+d, function() {
            expect(R.pick(['x','y'], this.ret.state))
              .toEqual(e.res);
          });
        });
      });
    });
  });
});
