'use strict';

describe('model under AoE', function() {
  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;

        this.gameFactionsService = spyOnService('gameFactions');
        mockReturnPromise(this.gameFactionsService.getModelInfo);
      }
    ]));

    when('distanceToAoE(<factions>, <aoe>)', function() {
      this.ret = this.modelService
        .distanceToAoE('factions', this.aoe, this.model);
    }, function() {
      beforeEach(function() {
        this.fake_info = {
          info: { base_radius: 9.842 }
        };
        this.gameFactionsService.getModelInfo.resolveWith = (i) => {
          return this.fake_info[i];
        };
        this.aoe = {
          state: { s: 20, x: 270, y: 270 }
        };
        this.model = {
          state: { info: 'info'}
        };
      });

      using([
        ['model_pos', 'distance'],
        [{ x:240, y:240 }, 12.584406871192854 ],
        [{ x:245, y:245 }, 5.513339059327379 ],
        [{ x:250, y:250 }, -1.5577287525380967 ],
      ], function(e, d) {
        when(d, function() {
          this.model.state = R.merge(this.model.state, e.model_pos);
        }, function() {
          it('should return distance between model and <aoe>', function() {
            this.thenExpect(this.ret, (result) => {
              expect(result).toBe(e.distance);
            });
          });
        });
      });
    });
  });
});
