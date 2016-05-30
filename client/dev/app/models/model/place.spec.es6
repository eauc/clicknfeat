describe('model place model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
      spyOn(this.modelModel, 'checkState')
        .and.callFake(R.nthArg(1));
      this.modelModel
        .checkState$ = R.curryN(2, this.modelModel.checkState);
    }
  ]));

  context('startPlaceP()', function() {
    return this.modelModel
      .startPlaceP(this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { x: 240, y:240, r: 180 }
      };
    });

    it('should start place on model', function() {
      expect(this.context.state.pla)
        .toEqual({
          s: { x: 240, y: 240, r: 180 }
        });
      expect(this.modelModel.isPlacing(this.context))
        .toBeTruthy();
    });

    whenModelIsLockedShouldRejectMove();
  });

  context('endPlace()', function() {
    return this.modelModel
      .endPlace(this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { x: 240, y:240, r: 180,
                 sta: {
                   s: { x: 240, y: 240 }
                 }
               }
      };
    });

    it('should end place on model', function() {
      expect(this.context.state.pla)
        .toBe(null);
      expect(this.modelModel.isPlacing(this.context))
        .toBeFalsy();
    });
  });

  context('setPlaceTargetP(<target>)', function() {
    return this.modelModel
      .setPlaceTargetP(this.target, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { info: 'info',
                 x: 240, y:240, r: 180,
                 pla: {
                   s: { x: 160, y: 160 }
                 }
               }
      };
      this.target = {
        state: { x: 120, y: 120, stamp: 'target' }
      };
    });

    it('should orient place lane toward <target>', function() {
      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 80, y: 79.99999999999999, r: 180 });
      expect(R.pick(['x','y','r'], this.context.state.pla.s))
        .toEqual({ x: 160, y: 160, r: -45 });
    });

    it('should check state', function() {
      expect(this.modelModel.checkState)
        .toHaveBeenCalledWith(null, this.context);
    });

    whenModelIsLockedShouldRejectMove();
  });

  context('setPlaceOriginP(<origin>)', function() {
    return this.modelModel
      .setPlaceOriginP(this.origin, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { info: 'info',
                 x: 240, y:240, r: 180,
                 pla: {
                   s: { x: 160, y: 160 }
                 }
               }
      };
      this.origin = {
        state: { x: 120, y: 240, stamp: 'origin' }
      };
    });

    it('should orient place lane toward <target>', function() {
      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 210.59644256269408, y: 58.807114874611855, r: 180 });
      expect(R.pick(['x','y','r'], this.context.state.pla.s))
        .toEqual({ x: 160, y: 160, r: 26.56505117707799 });
    });

    it('should check state', function() {
      expect(this.modelModel.checkState)
        .toHaveBeenCalledWith(null, this.context);
    });

    whenModelIsLockedShouldRejectMove();
  });

  context('setPlaceMaxLengthP(<length>)', function() {
    return this.modelModel
      .setPlaceMaxLengthP(42, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { stamp: 'stamp', pml: [] }
      };
    });

    it('should set place max length on model', function() {
      expect(this.modelModel.placeMaxLength(this.context))
        .toBe(42);
    });

    it('should check state', function() {
      expect(this.modelModel.checkState)
        .toHaveBeenCalledWith(null, this.context);
    });
  });

  example(function(e) {
    context(`${e.move}(<small>)`, function() {
      return this.modelModel[e.move](this.small, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info', x: 240, y: 240, r: 180,
                   pla: { s: e.start }
                 }
        };
      });

      example(function(ee, dd) {
        context(dd, function() {
          this.small = ee.small;
        }, function() {
          it(`should ${e.move} model`, function() {
            expect(R.pick(['x','y','r'], this.context.state))
              .toEqual(ee.result);
            expect(this.context.state.pla.s)
              .toEqual(ee.start_result);
          });
        });
      }, [
        [ 'small' , 'result'       , 'start_result'       ],
        [ false   , e.result       , e.start_result       ],
        [ true    , e.small_result , e.start_small_result ],
      ]);

      it('should check state', function() {
        expect(this.modelModel.checkState)
          .toHaveBeenCalledWith(null, this.context);
      });

      whenModelIsLockedShouldRejectMove();
    });
  }, [
    [ 'move', 'start',
      'start_result', 'result',
      'start_small_result', 'small_result' ],
    [ 'rotateLeftPlaceP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 80 },
      { x: 239.39231012048833, y: 233.0540728933228, r: 180 },
      { x: 200, y: 240, r: 88 },
      { x: 239.97563308076383, y: 238.60402013189994, r: 180 } ],
    [ 'rotateRightPlaceP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 100 },
      { x: 239.39231012048833, y: 246.9459271066772, r: 180 },
      { x: 200, y: 240, r: 92 },
      { x: 239.97563308076383, y: 241.39597986810003, r: 180 } ],
    // place length === 0
    [ 'rotateLeftPlaceP',
      { x: 240, y: 240, r: 90 },
      { x: 240, y: 240, r: 80 }, { x: 240, y: 240, r: 180 },
      { x: 240, y: 240, r: 88 }, { x: 240, y: 240, r: 180 }, ],
    // place length === 0
    [ 'rotateRightPlaceP',
      { x: 240, y: 240, r: 90 },
      { x: 240, y: 240, r: 100 }, { x: 240, y: 240, r: 180 },
      { x: 240, y: 240, r: 92 }, { x: 240, y: 240, r: 180 }, ],
    [ 'moveFrontPlaceP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 245, y: 240, r: 180 } ],
    [ 'moveBackPlaceP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 235, y: 240, r: 180 } ],
    [ 'shiftLeftPlaceP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 239, y: 240, r: 180 } ],
    [ 'shiftRightPlaceP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 241, y: 240, r: 180 } ],
    [ 'shiftUpPlaceP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 240, y: 230, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 240, y: 239, r: 180 } ],
    [ 'shiftDownPlaceP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 240, y: 250, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 240, y: 241, r: 180 } ],
  ]);

  function whenModelIsLockedShouldRejectMove(){
    context('when model is locked', function() {
      this.model = this.modelModel.setLock(true, this.model);
      this.expectContextError();
    }, function() {
      it('should reject move', function() {
        expect(this.contextError).toEqual([
          'Model is locked'
        ]);
      });
    });
  }
});
