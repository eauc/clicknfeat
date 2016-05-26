describe('element model', function() {
  beforeEach(inject([
    'element',
    function(elementModel) {
      this.MOVES = {
        Move: 10,
        MoveSmall: 1,
        Rotate: 15,
        RotateSmall: 5,
        Shift: 10,
        ShiftSmall: 1
      };
      this.elementModel = elementModel('type', this.MOVES);
    }
  ]));

  context('checkState(<factions>, <target>)', function() {
    return this.elementModel
      .checkState(this.element);
  }, function() {
    beforeEach(function() {
      this.element = { state: { info: 'info' } };
    });

    example(function(e, d) {
      context(d, function() {
        this.element.state = R.merge(e.pos, this.element.state);
      }, function() {
        it('should keep element on board, '+d, function() {
          expect(R.pick(['x','y'], this.context.state))
            .toEqual(e.res);
        });
      });
    }, [
      [ 'pos', 'res' ],
      [ { x: 490, y: 240 }, { x: 480, y: 240 } ],
      [ { x: -10, y: 240 }, { x: 0,   y: 240 } ],
      [ { x: 240, y: 490 }, { x: 240, y: 480 } ],
      [ { x: 240, y: -10 }, { x: 240, y: 0   } ],
    ]);
  });

  context('create(<state>)', function() {
    return this.elementModel
      .create(this.state);
  }, function() {
    beforeEach(function() {
      this.state = { info: ['info'],
                     x:240,
                     lk: true,
                     stamp: 'stamp'
                   };

      spyOn(this.elementModel, 'checkState')
        .and.returnValue('element.checkState.returnValue');
      spyOn(R, 'guid').and.returnValue('newGuid');
    });

    it('should check <state>', function() {
      expect(this.elementModel.checkState)
        .toHaveBeenCalledWith({
          state: { x: 240, y: 0, r: 0,
                   l: [],
                   lk: true,
                   stamp: 'stamp',
                   info: [ 'info' ]
                 }
        });
      expect(this.context).toBe('element.checkState.returnValue');
    });
  });

  context('setPositionP(<pos>)', function() {
    return this.elementModel
      .setPositionP({ x: 15, y: 42 }, this.element);
  }, function() {
    beforeEach(function() {
      this.element = {
        state: { stamp: 'stamp', info: 'info',
                 x: 240, y: 240, r: 180, dsp:[] }
      };
      spyOn(this.elementModel, 'checkState')
        .and.callFake(R.identity);
    });

    it('should set element position', function() {
      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 15, y: 42, r: 180 });
    });

    it('should check state', function() {
      expect(this.elementModel.checkState)
        .toHaveBeenCalledWith(this.context);
    });

    context('when element is locked', function() {
      this.element = this.elementModel
        .setLock(true, this.element);
      this.expectContextError();
    }, function() {
      it('should reject move', function() {
        expect(this.contextError).toEqual([
          'Type is locked'
        ]);
      });
    });
  });

  context('shiftPositionP(<pos>)', function() {
    return this.elementModel
      .shiftPositionP({ x: 15, y: 20 }, this.element);
  }, function() {
    beforeEach(function() {
      this.element = {
        state: { stamp: 'stamp', info: 'info',
                 x: 440, y: 440, r: 180, dsp:[] }
      };
      this.target = 'target';

      spyOn(this.elementModel, 'checkState')
        .and.callFake(R.identity);
    });

    it('should set element position', function() {
      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 455, y: 460, r: 180 });
    });

    it('should check state', function() {
      expect(this.elementModel.checkState)
        .toHaveBeenCalledWith(this.context);
    });

    context('when element is locked', function() {
      this.element = this.elementModel
        .setLock(true, this.element);
      this.expectContextError();
    }, function() {
      it('should reject move', function() {
        expect(this.contextError).toEqual([
          'Type is locked'
        ]);
      });
    });
  });

  describe('setLock(<set>)', function() {
    it('should set lock for <element>', function() {
      this.element = { state: { dsp: [] } };

      this.element = this.elementModel.setLock(true, this.element);
      expect(this.elementModel.isLocked(this.element))
        .toBeTruthy();

      this.element = this.elementModel.setLock(false, this.element);
      expect(this.elementModel.isLocked(this.element))
        .toBeFalsy();
    });
  });
  describe('saveState()', function() {
    it('should return a copy of element\'s state', function() {
      const element = { state: { stamp: 'stamp' } };
      const ret = this.elementModel.saveState(element);
      expect(ret).toEqual({ stamp: 'stamp' });
      expect(ret).not.toBe(element.state);
    });
  });

  describe('setState(<state>)', function() {
    it('should set a copy of <state> as element\'s state', function() {
      let element = { state: null };
      const state = { stamp: 'stamp' };
      element = this.elementModel.setState(state, element);
      expect(element.state).toEqual(state);
      expect(element.state).not.toBe(state);
    });
  });

  example(function(e) {
    example(function(ee, dd) {
      context(e.move+'(<small>)', function() {
        return this.elementModel[`${e.move}P`](ee.small, this.element);
      }, function() {
        beforeEach(function() {
          this.element = {
            state: { stamp: 'stamp',
                     info: 'info',
                     x: 240, y: 240, r: 180,
                     dsp:[] }
          };
          spyOn(this.elementModel, 'checkState')
            .and.callFake(R.identity);
        });

        it('should '+e.move+' element, '+dd, function() {
          expect(R.pick(['x','y','r'], this.context.state))
            .toEqual(ee.result);
        });

        it('should check state', function() {
          expect(this.elementModel.checkState)
            .toHaveBeenCalledWith(this.context);
        });

        context('when element is locked', function() {
          this.element = this.elementModel
            .setLock(true, this.element);
          this.expectContextError();
        }, function() {
          it('should reject move', function() {
            expect(this.contextError).toEqual([
              'Type is locked'
            ]);
          });
        });
      });
    }, [
      [ 'small' , 'result'       ],
      [ false   , e.result       ],
      [ true    , e.small_result ],
    ]);
  }, [
    [ 'move'        , 'base' , 'result' , 'small_result' ],
    [ 'rotateLeft'  , 5.905,
      { x: 240      , y: 240 , r: 165 },
      { x: 240      , y: 240 , r: 175 } ],
    [ 'rotateRight' , 5.905,
      { x: 240      , y: 240 , r: 195 },
      { x: 240      , y: 240 , r: 185 } ],
    [ 'moveFront'   , 5.905,
      { x: 240      , y: 250 , r: 180 },
      { x: 240      , y: 241 , r: 180 } ],
    [ 'moveBack'    , 7.874,
      { x: 240      , y: 230 , r: 180 },
      { x: 240      , y: 239 , r: 180 } ],
    [ 'shiftLeft'   , 9.842,
      { x: 230      , y: 240 , r: 180 },
      { x: 239      , y: 240 , r: 180 } ],
    [ 'shiftRight'  , 24.605,
      { x: 250      , y: 240 , r: 180 },
      { x: 241      , y: 240 , r: 180 } ],
    [ 'shiftUp'     , 5.905,
      { x: 240      , y: 230 , r: 180 },
      { x: 240      , y: 239 , r: 180 } ],
    [ 'shiftDown'   , 5.905,
      { x: 240      , y: 250 , r: 180 },
      { x: 240      , y: 241 , r: 180 } ],
  ]);

  context('fullLabel()', function() {
    return this.elementModel
      .fullLabel(this.element);
  }, function() {
    beforeEach(function() {
      this.element = {
        state: { l:  ['label1', 'label2'] }
      };
    });

    it('should return element\'s full label', function() {
      expect(this.context)
        .toEqual('label1 label2');
    });
  });

  context('addLabel(<label>)', function() {
    return this.elementModel
      .addLabel(this.label, this.element);
  }, function() {
    beforeEach(function() {
      this.element = {
        state: { l:  ['label1', 'label2'] }
      };
    });

    example(function(e, d) {
      context(d, function() {
        this.label = e.label;
      }, function() {
        it('should add <label> to element\'s labels, '+d, function() {
          expect(this.context.state.l)
            .toEqual(e.result);
        });
      });
    }, [
      [ 'label'  , 'result'                        ],
      [ 'new'    , ['label1' , 'label2' , 'new' ]  ],
      // no duplicates
      [ 'label2' , ['label1' , 'label2']           ],
    ]);
  });

  context('removeLabel(<label>)', function() {
    return this.elementModel
      .removeLabel(this.label, this.element);
  }, function() {
    beforeEach(function() {
      this.element = {
        state: { l:  ['label1', 'label2'] }
      };
    });

    example(function(e, d) {
      context(d, function() {
        this.label = e.label;
      }, function() {
        it('should remove <label> from element\'s labels, '+d, function() {
          expect(this.context.state.l)
            .toEqual(e.result);
        });
      });
    }, [
      [ 'label'   , 'result'   ],
      [ 'label1'  , ['label2'] ],
      [ 'unknown' , ['label1'  , 'label2'] ],
    ]);
  });

  describe('clearLabel(<label>)', function() {
    beforeEach(function() {
      this.element = {
        state: { l:  ['label1', 'label2'] }
      };
    });

    it('should remove all labels from element', function() {
      this.ret = this.elementModel.clearLabel(this.element);
      expect(this.ret.state.l)
        .toEqual([]);
    });
  });
});
