describe('aoeTemplate model', function() {
  beforeEach(inject([
    'aoeTemplate',
    function(aoeTemplateModel) {
      this.aoeTemplateModel = aoeTemplateModel;
    }
  ]));

  context('deviate(<dir>, <len>)', function() {
    return this.aoeTemplateModel
      .deviate(this.dir, this.len, this.template);
  }, function() {
    beforeEach(function() {
      this.template = {
        state: { x: 240, y:240, r: 30 }
      };
      this.dir = 42;
      this.len = 71;
    });

    example(function(e, d) {
      context(d, function() {
        this.dir = e.dir;
        this.len = e.len;
      }, function() {
        it('should deviate template, '+d, function() {
          expect(this.context.state)
            .toEqual(e.result);
        });
      });
    }, [
      [ 'dir' , 'len' , 'result' ],
      [ 1     , 2     , { x: 250 , y: 222.67949192431124 , r: 30 }  ],
      [ 2     , 3     , { x: 270 , y: 240                , r: 90 }  ],
      [ 3     , 4     , { x: 260 , y: 274.6410161513775  , r: 150 } ],
      [ 4     , 5     , { x: 215 , y: 283.30127018922195 , r: 210 } ],
      [ 5     , 6     , { x: 180 , y: 240                , r: 270 } ],
      [ 6     , 1     , { x: 235 , y: 231.3397459621556  , r: 330 } ],
    ]);

    describe('enforces max deviation', function() {
      example(function(e, d) {
        beforeEach(function() {
          this.template.state.r = 180;
        });

        context(d, function() {
          this.template = this.aoeTemplateModel
            .setMaxDeviation(e.max, this.template);
          expect(this.aoeTemplateModel.maxDeviation(this.template))
            .toBe(e.max);

          this.dir = e.dir;
          this.len = e.len;
        }, function() {
          it('should deviate template, '+d, function() {
            expect(this.context.state)
              .toEqual(e.result);
          });
        });
      }, [
        [ 'max' , 'dir' , 'len' , 'result' ],
        [ 10    , 1     , 2     , { x: 240 , y: 260 , r: 180 , m:10 } ],
        [ 3     , 1     , 3     , { x: 240 , y: 270 , r: 180 , m:3 }  ],
        [ 2     , 1     , 4     , { x: 240 , y: 260 , r: 180 , m:2 }  ],
      ]);
    });

    context('aoe is locked', function() {
      this.template.state.lk = true;
      this.expectContextError();
    }, function() {
      it('should not deviate template', function() {
        expect(this.contextError).toEqual([
          'Template is locked'
        ]);
      });
    });
  });

  context('setTarget(<factions>, <origin>, <target>), ', function() {
    return this.aoeTemplateModel
      .setTargetP('factions', null, this.target, this.template);
  }, function() {
    beforeEach(function() {
      this.template = {
        state: { x: 240, y: 240, r: 0 }
      };
      this.target = {
        state: { x: 120, y: 120 }
      };
    });

    it('should center template on <target>', function() {
      expect(this.context.state)
        .toEqual({ x: 120, y: 120, r: 0 });
    });

    context('when aoe is locked', function() {
      this.template.state.lk = true;
      this.expectContextError();
    }, function() {
      it('should reject set target', function() {
        expect(this.contextError).toEqual([
          'Template is locked'
        ]);
      });
    });
  });

  context('setSizeP(<size>)', function() {
    return this.aoeTemplateModel
      .setSizeP(this.size, this.template);
  }, function() {
    beforeEach(function() {
      this.template = {
        state: { }
      };
    });

    example(function(e, d) {
      context(d, function() {
        this.size = e.size;
      }, function() {
        it('should set template size', function() {
          expect(this.aoeTemplateModel.size(this.context))
            .toEqual(e.result);
        });
      });
    }, [
      [ 'size', 'result' ],
      [ 3     , 15       ],
      [ 4     , 20       ],
      [ 5     , 25       ],
    ]);

    context('when size is not valid', function() {
      this.size = 42;
      this.expectContextError();
    }, function() {
      it('should reject size', function() {
        expect(this.contextError).toEqual([
          'Invalid size for an AoE'
        ]);
      });
    });
  });

  context('setToRulerP(<position>)', function() {
    return this.aoeTemplateModel.setToRulerP({
      x: 42, y: 71, r: 83, m: 32
    }, this.template);
  }, function() {
    beforeEach(function() {
      this.template = {
        state: { stamp: 'stamp',
                 x: 240, y: 240, r: 180,
                 m: null }
      };
    });

    it('should set AoE position to end of ruler', function() {
      expect(this.context.state)
        .toEqual({
          stamp: 'stamp',
          x: 42, y: 71, r: 83,
          m: 32
        });
    });

    context('when aoe is locked', function() {
      this.template.state.lk = true;
      this.expectContextError();
    }, function() {
      it('should reject set to ruler', function() {
        expect(this.contextError).toEqual([
          'Template is locked'
        ]);
      });
    });
  });
});
