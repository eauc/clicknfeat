describe('terrain model', function() {
  beforeEach(inject([
    'terrain',
    function(terrainModel) {
      this.terrainModel = terrainModel;
    }
  ]));

  context('checkState(<factions>, <target>)', function() {
    return this.terrainModel
      .checkState(this.terrain);
  }, function() {
    beforeEach(function() {
      this.terrain = { state: { info: 'info' } };
    });

    example(function(e, d) {
      context(d, function() {
        this.terrain.state = R.merge(e.pos, this.terrain.state);
      }, function() {
        it('should keep terrain on board, '+d, function() {
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
    return this.terrainModel.create(this.state);
  }, function() {
    beforeEach(function() {
      this.state = { info: ['info'],
                     x:240,
                     lk: true,
                     stamp: 'stamp'
                   };

      spyOn(this.terrainModel, 'checkState')
        .and.returnValue('terrain.checkState.returnValue');
      spyOn(R, 'guid').and.returnValue('newGuid');
    });

    it('should check <state>', function() {
      expect(this.terrainModel.checkState)
        .toHaveBeenCalledWith({
          state: { x: 240, y: 0, r: 0,
                   lk: true,
                   stamp: 'stamp',
                   info: [ 'info' ]
                 }
        });
      expect(this.context).toBe('terrain.checkState.returnValue');
    });
  });

  context('setPositionP(<pos>)', function() {
    return this.terrainModel
      .setPositionP({ x: 15, y: 42 }, this.terrain);
  }, function() {
    beforeEach(function() {
      this.terrain = {
        state: { stamp: 'stamp', info: 'info',
                 x: 240, y: 240, r: 180, dsp:[] }
      };
      spyOn(this.terrainModel, 'checkState')
        .and.callFake(R.identity);
    });

    it('should set terrain position', function() {
      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 15, y: 42, r: 180 });
    });

    it('should check state', function() {
      expect(this.terrainModel.checkState)
        .toHaveBeenCalledWith(this.context);
    });

    context('when terrain is locked', function() {
      this.terrain = this.terrainModel
        .setLock(true, this.terrain);
      this.expectContextError();
    }, function() {
      it('should reject move', function() {
        expect(this.contextError).toEqual([
          'Terrain is locked'
        ]);
      });
    });
  });

  context('shiftPositionP(<pos>)', function() {
    return this.terrainModel
      .shiftPositionP({ x: 15, y: 20 }, this.terrain);
  }, function() {
    beforeEach(function() {
      this.terrain = {
        state: { stamp: 'stamp', info: 'info',
                 x: 440, y: 440, r: 180, dsp:[] }
      };
      this.target = 'target';

      spyOn(this.terrainModel, 'checkState')
        .and.callFake(R.identity);
    });

    it('should set terrain position', function() {
      expect(R.pick(['x','y','r'], this.context.state))
        .toEqual({ x: 455, y: 460, r: 180 });
    });

    it('should check state', function() {
      expect(this.terrainModel.checkState)
        .toHaveBeenCalledWith(this.context);
    });

    context('when terrain is locked', function() {
      this.terrain = this.terrainModel
        .setLock(true, this.terrain);
      this.expectContextError();
    }, function() {
      it('should reject move', function() {
        expect(this.contextError).toEqual([
          'Terrain is locked'
        ]);
      });
    });
  });

  describe('setLock(<set>)', function() {
    it('should set lock for <terrain>', function() {
      this.terrain = { state: { dsp: [] } };

      this.terrain = this.terrainModel.setLock(true, this.terrain);
      expect(this.terrainModel.isLocked(this.terrain))
        .toBeTruthy();

      this.terrain = this.terrainModel.setLock(false, this.terrain);
      expect(this.terrainModel.isLocked(this.terrain))
        .toBeFalsy();
    });
  });
  describe('saveState()', function() {
    it('should return a copy of terrain\'s state', function() {
      const terrain = { state: { stamp: 'stamp' } };
      const ret = this.terrainModel.saveState(terrain);
      expect(ret).toEqual({ stamp: 'stamp' });
      expect(ret).not.toBe(terrain.state);
    });
  });

  describe('setState(<state>)', function() {
    it('should set a copy of <state> as terrain\'s state', function() {
      let terrain = { state: null };
      const state = { stamp: 'stamp' };
      terrain = this.terrainModel.setState(state, terrain);
      expect(terrain.state).toEqual(state);
      expect(terrain.state).not.toBe(state);
    });
  });

  example(function(e) {
    example(function(ee, dd) {
      context(e.move+'(<small>)', function() {
        return this.terrainModel[`${e.move}P`](ee.small, this.terrain);
      }, function() {
        beforeEach(function() {
          this.terrain = {
            state: { stamp: 'stamp',
                     info: 'info',
                     x: 240, y: 240, r: 180,
                     dsp:[] }
          };
          spyOn(this.terrainModel, 'checkState')
            .and.callFake(R.identity);
        });

        it('should '+e.move+' terrain, '+dd, function() {
          expect(R.pick(['x','y','r'], this.context.state))
            .toEqual(ee.result);
        });

        it('should check state', function() {
          expect(this.terrainModel.checkState)
            .toHaveBeenCalledWith(this.context);
        });

        context('when terrain is locked', function() {
          this.terrain = this.terrainModel
            .setLock(true, this.terrain);
          this.expectContextError();
        }, function() {
          it('should reject move', function() {
            expect(this.contextError).toEqual([
              'Terrain is locked'
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
});
