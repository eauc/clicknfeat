describe('sprayTemplate model', function() {
  beforeEach(inject([
    'sprayTemplate',
    function(sprayTemplateModel) {
      this.sprayTemplateModel = sprayTemplateModel;

      this.modelModel = spyOnService('model');
    }
  ]));

  context('setOriginP(<origin>), ', function() {
    return this.sprayTemplateModel
      .setOriginP(this.origin, this.template);
  }, function() {
    beforeEach(function() {
      this.template = {
        state: { x: 240, y: 240, r: 42 }
      };
      this.origin = {
        state: { stamp: 'origin' }
      };
      this.modelModel.baseEdgeInDirection
        .and.returnValue({
          x: 124, y: 124
        });
    });

    it('should set template position to <origin> base edge', function() {
      expect(this.modelModel.baseEdgeInDirection)
        .toHaveBeenCalledWith(42, this.origin);

      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 124, y: 124, r: 42 });
    });

    it('should set template origin', function() {
      expect(this.sprayTemplateModel.origin(this.context))
        .toEqual('origin');
    });

    whenSprayIsLockedShouldRejectAction();
  });

  context('setTargetP(<origin>, <target>), ', function() {
    return this.sprayTemplateModel
      .setTargetP(this.origin, this.target, this.template);
  }, function() {
    beforeEach(function() {
      this.template = {
        state: { x: 240, y: 240, r: 0 }
      };
      this.origin = {
        state: { x: 240, y: 240 }
      };
      this.modelModel.baseEdgeInDirection
        .and.returnValue({
        x: 236, y: 236
        });
      this.target = {
        state: { x: 120, y: 120 }
      };
    });

    it('should center template on <target>', function() {
      expect(this.modelModel.baseEdgeInDirection)
        .toHaveBeenCalledWith(-45, this.origin);

      expect(this.context.state)
        .toEqual({ x: 236, y: 236, r: -45 });
    });

    whenSprayIsLockedShouldRejectAction();
  });

  example(function(e) {
    context(`${e.move}(<small>)`, function() {
      return this.sprayTemplateModel[e.move](true, this.template);
    }, function() {
      beforeEach(function() {
        this.template = { state: { x: 240, y: 240, r: 0,
                                   o: 'origin', stamp: 'template' } };
      });

      it('should reset template origin', function() {
        expect(this.context.state.o)
          .toBe(null);
      });

      it('should forward to templateModel', function() {
        expect(R.pick(['x','y','r'], this.context.state))
          .toEqual(e.position);
      });

      whenSprayIsLockedShouldRejectAction();
    });
  }, [
    ['move'         , 'position'               ],
    ['moveFrontP'   , { x: 240, y: 239, r: 0 } ],
    ['moveBackP'    , { x: 240, y: 241, r: 0 } ],
    ['shiftLeftP'   , { x: 239, y: 240, r: 0 } ],
    ['shiftRightP'  , { x: 241, y: 240, r: 0 } ],
    ['shiftUpP'     , { x: 240, y: 239, r: 0 } ],
    ['shiftDownP'   , { x: 240, y: 241, r: 0 } ],
    ['setPositionP' , { x: 480, y: 480, r: 0 } ],
  ]);

  example(function(e) {
    context(`${e.move}(<origin>, <small>)`, function() {
      return this.sprayTemplateModel[e.move](this.origin,
                                             true, this.template);
    }, function() {
      beforeEach(function() {
        this.template = {
          state: {
            o: 'origin',
            stamp: 'template',
            x:240, y:240, r: 0
          }
        };
        this.modelModel.baseEdgeInDirection
          .and.returnValue({ x: 42, y: 71 });
      });

      it('should forward to templateModel', function() {
        expect(R.pick(['x','y','r'], this.context.state))
          .toEqual({ x: 240, y: 240, r: e.new_dir });
      });

      context('when <origin> exists', function() {
        this.origin = 'origin';
      }, function() {
        it('should rotate <template> around <origin> base edge', function() {
          expect(this.modelModel.baseEdgeInDirection)
            .toHaveBeenCalledWith(e.new_dir, 'origin');
          expect(R.pick(['x','y','r'], this.context.state))
            .toEqual({ x: 42, y: 71, r: e.new_dir });
        });
      });

      whenSprayIsLockedShouldRejectAction();
    });
  }, [
    ['move'         , 'new_dir' ],
    ['rotateLeftP'  , -6        ],
    ['rotateRightP' , 6         ],
  ]);

  example(function(e, d) {
    context(`setSizeP(<size>), ${d}`, function() {
      return this.sprayTemplateModel
        .setSizeP(e.size, this.template);
    }, function() {
      beforeEach(function() {
        this.template = {
          state: { }
        };
      });

      it('should set template size', function() {
        expect(this.sprayTemplateModel.size(this.context))
          .toEqual(e.result);
      });
    });
  }, [
    [ 'size', 'result' ],
    [ 6     , 6        ],
    [ 8     , 8        ],
    [ 10    , 10       ],
  ]);

  context('when size is not valid', function() {
    this.expectContextError();
    return this.sprayTemplateModel
      .setSizeP(42, this.template);
  }, function() {
    it('should reject size', function() {
      expect(this.contextError).toEqual([
        'Invalid size for a Spray'
      ]);
    });
  });

  function whenSprayIsLockedShouldRejectAction() {
    context('when spray is locked', function() {
      this.template.state.lk = true;
      this.expectContextError();
    }, function() {
      it('should reject action', function() {
        expect(this.contextError).toEqual([
          'Template is locked'
        ]);
      });
    });
  }
});
