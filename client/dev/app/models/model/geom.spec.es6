describe('model geom model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;

      this.gameFactionsModel = spyOnService('gameFactions');
    }
  ]));

  context('distanceTo(<factions>, <other>)', function() {
    return this.modelModel
      .distanceTo('factions', this.other, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { info: 'info'}
      };
      this.other = {
        state: { info: 'other_info',
                 x: 260, y: 260 }
      };
      this.fake_info = {
        info: { base_radius: 9.842 },
        other_info: { base_radius: 7.874 }
      };

      this.gameFactionsModel.getModelInfo
        .and.callFake((i) => {
          return this.fake_info[i];
        });
    });

    example(function(e, d) {
      context(d, function() {
        this.model.state = R.merge(this.model.state, e.model_pos);
      }, function() {
        it('should return distance between both models', function() {
          expect(this.context).toBe(e.distance);
        });
      });
    }, [
      [ 'model_pos'      , 'distance'],
      [ { x:240, y:240 } , 10.568271247461904 ],
      [ { x:245, y:245 } , 3.4972034355964263 ],
      [ { x:250, y:250 } , -3.573864376269049 ],
    ]);
  });

  context('setB2B(<factions>, <other>)', function() {
    return this.modelModel
      .setB2BP('factions', this.other, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { info: 'info',
                 x: 240, y: 240 }
      };
      this.other = {
        state: { info: 'other_info',
                 x: 260, y: 260 }
      };
      this.fake_info = {
        info: { base_radius: 9.842 },
        other_info: { base_radius: 7.874 }
      };

      this.gameFactionsModel.getModelInfo
        .and.callFake((i) => {
          return this.fake_info[i];
        });
    });

    it('should move model B2B with <other>', function() {
      expect(R.pick(['x','y'], this.context.state))
        .toEqual({ x: 247.47289626449913, y: 247.47289626449913 });
    });

    context('when model is locked', function() {
      this.model = this.modelModel.setLock(true, this.model);
      this.expectContextError();
    }, function() {
      it('should reject setB2B', function() {
        expect(this.contextError).toEqual([
          'Model is locked'
        ]);
      });
    });
  });

  context('shortestLineTo(<factions>, <other>)', function() {
    return this.modelModel
      .shortestLineTo('factions', this.other, this.model);
  }, function() {
    beforeEach(function() {
      const info = {
        'model': { base_radius: 7.874 },
        'other': { base_radius: 9.842 }
      };
      this.model = { state: { info: 'model', x: 240, y: 240 } };
      this.other = { state: { info: 'other', x: 120, y: 120 } };

      this.gameFactionsModel.getModelInfo
        .and.callFake((i) =>{
          return info[i];
        });
    });

    it('should compute the shortest line between both models', function() {
      expect(this.context)
        .toEqual({
          start: { x: 234.43224120493713, y: 234.43224120493713 },
          end: { x: 126.959344940438, y: 126.959344940438 }
        });
    });
  });

  context('baseEdgeInDirection(<factions>, <dir>)', function() {
    return this.modelModel.baseEdgeInDirection('factions', 42, {
      state: { x: 140, y: 340 }
    });
  }, function() {
    beforeEach(function() {
      this.gameFactionsModel.getModelInfo
        .and.returnValue({
          base_radius: 7.874
        });
    });

    it('should compute the point on model\s base edge in <direction>', function() {
      expect(this.context).toEqual({
        x: 145.26873439446965,
        y: 334.148477644191
      });
    });
  });

  describe('isBetweenPoints', function() {
    beforeEach(function() {
      this.model = {
        state : { stamp: 'stamp1',
                  x: 240, y: 240
                }
      };
    });

    example(function(e, d) {
      it('should find all models between the 2 points, '+d, function() {
        expect(this.modelModel.isBetweenPoints(e.tl, e.br, this.model))
          .toBe(e.result);
      });
    }, [
      [ 'tl', 'br', 'result' ],
      [ { x: 120, y: 120 }, {x: 180, y: 180 }, false ],
      [ { x: 300, y: 300 }, {x: 360, y: 360 }, false ],
      [ { x: 200, y: 120 }, {x: 300, y: 180 }, false ],
      [ { x: 120, y: 200 }, {x: 180, y: 300 }, false ],
      [ { x: 200, y: 200 }, {x: 300, y: 300 }, true ],
    ]);
  });

  context('distanceToAoEP(<factions>, <aoe>)', function() {
    return this.modelModel
      .distanceToAoE('factions', this.aoe, this.model);
  }, function() {
    beforeEach(function() {
      this.fake_info = {
        info: { base_radius: 9.842 }
      };
      this.gameFactionsModel.getModelInfo
        .and.callFake((i) => {
          return this.fake_info[i];
        });
      this.aoe = {
        state: { s: 20, x: 270, y: 270 }
      };
      this.model = {
        state: { info: 'info'}
      };
    });

    example(function(e, d) {
      context(d, function() {
        this.model.state = R.merge(this.model.state, e.model_pos);
      }, function() {
        it('should return distance between model and <aoe>', function() {
          expect(this.context).toBe(e.distance);
        });
      });
    }, [
      ['model_pos'     , 'distance'],
      [{ x:240, y:240 }, 12.584406871192854 ],
      [{ x:245, y:245 }, 5.513339059327379 ],
      [{ x:250, y:250 }, -1.5577287525380967 ],
    ]);
  });
});
