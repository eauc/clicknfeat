describe('model move model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
      spyOn(this.modelModel, 'checkStateP')
        .and.callFake((_f_,_t_,m) => m);
      this.modelModel.checkStateP$ = R.curryN(3, this.modelModel.checkStateP);
    }
  ]));

  context('setPositionP(<pos>)', function() {
    return this.modelModel
      .setPositionP('factions', this.target, { x: 15, y: 42 }, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { stamp: 'stamp', info: 'info',
                 x: 240, y: 240, r: 180, dsp:[] }
      };
      this.target = 'target';
    });

    it('should set model position', function() {
      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 15, y: 42, r: 180 });
    });

    it('should check state', function() {
      expect(this.modelModel.checkStateP)
        .toHaveBeenCalledWith('factions', 'target', this.context);
    });

    whenModelIsLockedShouldRejectMove();
  });

  context('setPosition_(<pos>)', function() {
    return this.modelModel
      .setPosition_('factions', this.target, { x: 15, y: 42 }, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { stamp: 'stamp', info: 'info',
                 x: 240, y: 240, r: 180, dsp:[] }
      };
      this.target = 'target';
    });

    it('should modify model position', function() {
      expect(R.pick(['x','y','r'], this.model.state))
        .toEqual({ x: 15, y: 42, r: 180 });
    });

    it('should check state', function() {
      expect(this.modelModel.checkStateP)
        .toHaveBeenCalledWith('factions', 'target', this.model);
    });

    whenModelIsLockedShouldRejectMove();
  });

  context('shiftPosition(<pos>)', function() {
    return this.modelModel
      .shiftPositionP('factions', this.target, { x: 15, y: 20 }, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { stamp: 'stamp', info: 'info',
                 x: 440, y: 440, r: 180, dsp:[] }
      };
      this.target = 'target';
    });

    it('should set model position', function() {
      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 455, y: 460, r: 180 });
    });

    it('should check state', function() {
      expect(this.modelModel.checkStateP)
        .toHaveBeenCalledWith('factions', 'target', this.context);
    });

    whenModelIsLockedShouldRejectMove();
  });

  example(function(e) {
    example(function(ee, dd) {
      context(e.move+'(<small>)', function() {
        return this.modelModel[e.move]('factions', ee.small, this.model);
      }, function() {
        beforeEach(function() {
          this.model = {
            state: { stamp: 'stamp', info: 'info', x: 240, y: 240, r: 180, dsp:[] }
          };
        });

        it('should '+e.move+' model, '+dd, function() {
          expect(R.pick(['x','y','r'], this.context.state))
            .toEqual(ee.result);
        });

        it('should check state', function() {
          expect(this.modelModel.checkStateP)
            .toHaveBeenCalledWith('factions', null, this.context);
        });

        whenModelIsLockedShouldRejectMove();
      });
    }, [
      [ 'small' , 'result'       ],
      [ false   , e.result       ],
      [ true    , e.small_result ],
    ]);
  }, [
    [ 'move', 'base', 'result', 'small_result' ],
    [ 'rotateLeftP', 5.905,
      { x: 240, y: 240, r: 165 },
      { x: 240, y: 240, r: 175 } ],
    [ 'rotateRightP', 5.905,
      { x: 240, y: 240, r: 195 },
      { x: 240, y: 240, r: 185 } ],
    [ 'moveFrontP', 5.905,
      { x: 240, y: 250, r: 180 },
      { x: 240, y: 245, r: 180 } ],
    [ 'moveBackP', 7.874,
      { x: 240, y: 230, r: 180 },
      { x: 240, y: 235, r: 180 } ],
    [ 'shiftLeftP', 9.842,
      { x: 230, y: 240, r: 180 },
      { x: 239, y: 240, r: 180 } ],
    [ 'shiftRightP', 24.605,
      { x: 250, y: 240, r: 180 },
      { x: 241, y: 240, r: 180 } ],
    [ 'shiftUpP', 5.905,
      { x: 240, y: 230, r: 180 },
      { x: 240, y: 239, r: 180 } ],
    [ 'shiftDownP', 5.905,
      { x: 240, y: 250, r: 180 },
      { x: 240, y: 241, r: 180 } ],
  ]);

  context('setOrientation(<dir>)', function() {
    return this.modelModel
      .setOrientationP('factions', 15, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { info: 'info', x: 240, y: 240, r: 180, dsp: [] }
      };
    });

    it('should set model orientation', function() {
      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 240, y: 240, r: 15 });
    });

    it('should check state', function() {
      expect(this.modelModel.checkStateP)
        .toHaveBeenCalledWith('factions', null, this.context);
    });

    whenModelIsLockedShouldRejectMove();
  });

  context('orientTo(<factions>, <other>)', function() {
    return this.modelModel
      .orientToP('factions', this.other, this.model);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { x: 240, y: 240, r: 0, dsp:[] }
      };
      this.other = {
        state: { x: 360, y: 360, r: 0 }
      };
    });

    it('should orient model to directly face <other>', function() {
      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 240, y: 240, r: 135 });
    });

    it('should check state', function() {
      expect(this.modelModel.checkStateP)
        .toHaveBeenCalledWith('factions', null, this.context);
    });

    whenModelIsLockedShouldRejectMove();
  });

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
