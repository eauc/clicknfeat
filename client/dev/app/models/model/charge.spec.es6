describe('model charge model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
      spyOn(this.modelModel, 'checkStateP')
        .and.callFake((_f_,_t_,m) => m);
      this.modelModel.checkStateP$ = R.curryN(3, this.modelModel.checkStateP);
    }
  ]));

  context('startChargeP()', function() {
    return this.modelModel
      .startChargeP(this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { x: 240, y:240, r: 180, dsp: [] }
      };
    });

    it('should start charge on model', function() {
      expect(this.context.state.cha)
        .toEqual({
          s: { x: 240, y: 240, r: 180 },
          t: null
        });
      expect(this.modelModel.isCharging(this.context))
        .toBeTruthy();
    });

    whenModelIsLockedShouldRejectMove();
  });

  context('endCharge()', function() {
    return this.modelModel
      .endCharge(this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { x: 240, y:240, r: 180,
                 cha: {
                   s: { x: 240, y: 240 },
                   t: null
                 }
               }
      };
    });

    it('should start charge on model', function() {
      expect(this.context.state.cha)
        .toBe(null);
      expect(this.modelModel.isCharging(this.context))
        .toBeFalsy();
    });
  });

  context('setChargeTargetP(<factions>, <target>)', function() {
    return this.modelModel
      .setChargeTargetP('factions', this.target, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { info: 'info',
                 x: 240, y:240, r: 180,
                 cha: {
                   s: { x: 160, y: 160 },
                   t: null
                 },
                 dsp: []
               }
      };
      this.target = {
        state: { x: 120, y: 120, stamp: 'target' }
      };
    });

    it('should set charge <target> on model', function() {
      return this.modelModel.chargeTargetP(this.context)
        .then((result) => {
          expect(result).toBe('target');
        });
    });

    it('should orient model toward <target>', function() {
      expect(this.context.state.r)
        .toBe(-45);
    });

    whenModelIsLockedShouldRejectMove();
  });

  context('setChargeMaxLengthP(<length>)', function() {
    return this.modelModel
      .setChargeMaxLengthP('factions', 42, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { stamp: 'stamp' }
      };
    });

    it('should set charge max length on model', function() {
      expect(this.modelModel.chargeMaxLength(this.context))
        .toBe(42);
    });

    it('should check state', function() {
      expect(this.modelModel.checkStateP)
        .toHaveBeenCalledWith('factions', null, this.context);
    });
  });

  example(function(e) {
    context(e.move+'(<small>)', function() {
      return this.modelModel[e.move]('factions', this.target, this.small, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: { info: 'info', x: 240, y: 240, r: 180,
                   cha: { s: e.start, t: null },
                   dsp: []
                 }
        };
      });

      example(function(ee, dd) {
        context('when target is not set', function() {
          this.small = ee.small;
          this.target = null;
        }, function() {
          it('should '+e.move+' model, '+dd, function() {
            expect(R.pick(['x','y','r'], this.context.state))
              .toEqual(ee.result);
            expect(this.context.state.cha.s)
              .toEqual(ee.start_result);
          });

          it('should check state', function() {
            expect(this.modelModel.checkStateP)
              .toHaveBeenCalledWith('factions', this.target, this.context);
          });
        });
      }, [
        [ 'small' , 'result'       , 'start_result'       ],
        [ false   , e.result       , e.start_result       ],
        [ true    , e.small_result , e.start_small_result ],
      ]);

      context('when target is set', function() {
        this.target = {
          state: { info: 'info', x: 120, y: 120 }
        };
      }, function() {
        it('should '+e.move+' model', function() {
          expect(R.pick(['x','y','r'], this.context.state))
            .toEqual(e.result);
          expect(this.context.state.cha.s)
            .toEqual(e.start_result);
        });

        it('should check state', function() {
          expect(this.modelModel.checkStateP)
            .toHaveBeenCalledWith('factions', this.target, this.context);
        });
      });

      whenModelIsLockedShouldRejectMove();
    });
  }, [
    [ 'move', 'start',
      'start_result', 'result',
      'start_small_result', 'small_result' ],
    [ /* move                */ 'rotateLeftChargeP',
      /* start               */ { x: 200,
                                  y: 240,
                                  r: 90 },
      /* start_result        */ { x: 200,
                                  y: 240,
                                  r: 80 },
      /* result              */ { x: 239.39231012048833,
                                  y: 233.0540728933228,
                                  r: 180 },
      /* start_small_result  */ { x: 200,
                                  y: 240,
                                  r: 88 },
      /* small_result        */ { x: 239.97563308076383,
                                  y: 238.60402013189994,
                                  r: 180 } ],
    [ 'rotateRightChargeP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 100 },
      { x: 239.39231012048833, y: 246.9459271066772, r: 180 },
      { x: 200, y: 240, r: 92 },
      { x: 239.97563308076383, y: 241.39597986810003, r: 180 } ],
    // charge length === 0
    [ 'rotateLeftChargeP',
      { x: 240, y: 240, r: 90 },
      { x: 240, y: 240, r: 80 }, { x: 240, y: 240, r: 180 },
      { x: 240, y: 240, r: 88 }, { x: 240, y: 240, r: 180 }, ],
    // charge length === 0
    [ 'rotateRightChargeP',
      { x: 240, y: 240, r: 90 },
      { x: 240, y: 240, r: 100 }, { x: 240, y: 240, r: 180 },
      { x: 240, y: 240, r: 92  }, { x: 240, y: 240, r: 180 }, ],
    [ 'moveFrontChargeP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 245, y: 240, r: 180 } ],
    [ 'moveBackChargeP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 235, y: 240, r: 180 } ],
    [ 'shiftLeftChargeP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 230, y: 240, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 239, y: 240, r: 180 } ],
    [ 'shiftRightChargeP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 250, y: 240, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 241, y: 240, r: 180 } ],
    [ 'shiftUpChargeP',
      { x: 200, y: 240, r: 90 },
      { x: 200, y: 240, r: 90 }, { x: 240, y: 230, r: 180 },
      { x: 200, y: 240, r: 90 }, { x: 240, y: 239, r: 180 } ],
    [ 'shiftDownChargeP',
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
