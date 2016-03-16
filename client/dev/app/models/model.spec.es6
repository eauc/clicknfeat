describe('model model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
      spyOn(this.modelModel, 'checkStateP')
        .and.callFake(function(_f_,_t_,m) { return m; });
      this.gameFactionsModel = spyOnService('gameFactions');
      spyOn(R, 'guid').and.returnValue('newGuid');
    }
  ]));

  context('createP(<state>)', function() {
    return this.modelModel.createP('factions', this.state);
  }, function() {
    beforeEach(function() {
      this.state = { info: ['info'] };
      this.gameFactionsModel.getModelInfoP.resolveWith({
        damage: { type: 'warrior', n: 1 }
      });
    });

    it('should check whether model info exists', function() {
      expect(this.gameFactionsModel.getModelInfoP)
        .toHaveBeenCalledWith(['info'], 'factions');
    });

    context('when <state.info> is unknown', function() {
      this.gameFactionsModel.getModelInfoP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject creation', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    context('when <state.info> is known', function() {
      this.state = { info: ['info'],
                     x:240,
                     l: ['label'],
                     stamp: 'stamp'
                   };
    }, function() {
      it('should check <state>', function() {
        expect(this.modelModel.checkStateP)
          .toHaveBeenCalledWith('factions', null, {
            state: { x: 240, y: 0, r: 0,
                     dmg: { n: 0, t: 0 },
                     dsp: ['i'],
                     eff: [],
                     img: 0,
                     l: [ 'label' ],
                     c: 0, s: 0,
                     u : null,
                     aur: null,
                     are: null,
                     rml: null,
                     cml: null,
                     pml: [null,false],
                     cha: null,
                     pla: null,
                     stamp: 'stamp',
                     info: [ 'info' ]
                   }
          });
      });

      it('should extend <state> with default values', function() {
        expect(this.context)
          .toEqual({
            state: { x: 240, y: 0, r: 0,
                     dmg: { n: 0, t: 0 },
                     dsp: ['i'],
                     eff: [],
                     img: 0,
                     l: [ 'label' ],
                     c: 0, s: 0,
                     u : null,
                     aur: null,
                     are: null,
                     rml: null,
                     cml: null,
                     pml: [null,false],
                     cha: null,
                     pla: null,
                     stamp: 'stamp',
                     info: [ 'info' ]
                   }
          });
      });
    });

    example(function(e) {
      context('when <state.info> damage type is '+e.info.type, function() {
        this.gameFactionsModel.getModelInfoP.resolveWith({
          damage: e.info
        });
      }, function() {
        it('should init <state> damage', function() {
          expect(this.context.state.dmg)
            .toEqual(e.state);
        });
      });
    }, [
      [ 'info', 'state' ],
      [ { type: 'warrior', n: 1 }, { n: 0, t: 0 } ],
      [ { type: 'jack',
          1: [ null, null,  null,  'b',  'l', null ],
          2: [ null,  'b',  'b',   'l',  'l',  'm' ],
          3: [ null,  'b',  'g',   'a',  'm',  'm' ],
          4: [ null,  'b',  'g',   'a',  'c',  'c' ],
          5: [ null,  'b',  'b',   'r',  'r',  'c' ],
          6: [ null, null,  null,  'b',  'r', null ],
          field: 10
        }, { 1: [ 0, 0, 0, 0, 0, 0 ],
             2: [ 0, 0, 0, 0, 0, 0 ],
             3: [ 0, 0, 0, 0, 0, 0 ],
             4: [ 0, 0, 0, 0, 0, 0 ],
             5: [ 0, 0, 0, 0, 0, 0 ],
             6: [ 0, 0, 0, 0, 0, 0 ],
             f: 0, t: 0
           } ],
    ]);

    example(function(e) {
      context('when <state.info> type is '+e.type, function() {
        this.gameFactionsModel.getModelInfoP.resolveWith({
          type: e.type,
          damage: { type: 'warrior', n: 1 }
        });
      }, function() {
        it('should init counter display', function() {
          expect(this.modelModel.isCounterDisplayed('c', this.context))
              .toBe(e.dsp);
        });
      });
    }, [
      [ 'type'    , 'dsp' ],
      [ 'warrior' , false ],
      [ 'wardude' , true  ],
      [ 'beast'   , true  ],
      [ 'jack'    , true  ],
    ]);

    context('when <state.info> is immovable', function() {
      this.gameFactionsModel.getModelInfoP.resolveWith({
        type: 'objective',
        immovable: true,
        damage: { type: 'warrior', n: 1 }
      });
    }, function() {
      it('should init lock model', function() {
        expect(this.modelModel.isLocked(this.context))
          .toBe(true);
      });
    });
  });

  describe('setLock(<set>)', function() {
    it('should set lock for <model>', function() {
      this.model = { state: { dsp: [] } };

      this.model = this.modelModel.setLock(true, this.model);
      expect(this.modelModel.isLocked(this.model))
        .toBeTruthy();

      this.model = this.modelModel.setLock(false, this.model);
      expect(this.modelModel.isLocked(this.model))
        .toBeFalsy();
    });
  });

  describe('saveState()', function() {
    it('should return a copy of model\'s state', function() {
      const model = { state: { stamp: 'stamp' } };
      const ret = this.modelModel.saveState(model);
      expect(ret).toEqual({ stamp: 'stamp' });
      expect(ret).not.toBe(model.state);
    });
  });

  describe('setState(<state>)', function() {
    it('should set a copy of <state> as model\'s state', function() {
      let model = { state: null };
      const state = { stamp: 'stamp' };
      model = this.modelModel.setState(state, model);
      expect(model.state).toEqual(state);
      expect(model.state).not.toBe(state);
    });
  });

  describe('descriptionFromInfo', function() {
    example(function(e, d) {
      it('should give model\'s description, '+d, function() {
        const desc = this.modelModel
              .descriptionFromInfo(e.info, { state: e.state });
        expect(desc).toBe(e.desc);
      });
    }, [
      [ 'info' , 'state' , 'desc' ],
      [ { name: 'Name' }, { user: 'User' }, 'User/Name' ],
      [ { unit_name: 'Unit', name: 'Name' }, { user: 'User' }, 'User/Unit/Name' ],
      [ { unit_name: 'Unit', name: 'Name' }, { }, 'Unit/Name' ],
      [ { unit_name: 'Unit' }, { user: 'User' }, 'User/Unit' ],
    ]);
  });

  describe('stamp', function() {
    it('should return model\'s stamp', function() {
      expect(this.modelModel.stamp({
        state: { stamp: 'stamp' }
      })).toBe('stamp');
    });
  });

  describe('user', function() {
    it('should return model\'s user', function() {
      expect(this.modelModel.user({
        state: { user: 'toto' }
      })).toBe('toto');
    });
  });

  describe('userIs(<user>)', function() {
    example(function(e,d) {
      it('should check whether model\s user is <user>, '+d, function() {
        expect(this.modelModel.userIs(e.user, {
          state: { user: 'toto' }
        })).toBe(e.is);
      });
    }, [
      ['user' , 'is'  ],
      ['toto' , true  ],
      ['tata' , false ],
    ]);
  });

  context('modeFor', function() {
    return this.modelModel.modeFor(this.model);
  }, function() {
    beforeEach(function() {
      this.model = { state: {} };
    });

    it('should return "Model" mode', function() {
      expect(this.context).toBe('Model');
    });

    context('when model is charging', function() {
      return this.modelModel.startChargeP(this.model)
        .then((model) => { this.model = model; });
    }, function() {
      it('should return "ModelCharge" mode', function() {
        expect(this.context).toBe('ModelCharge');
      });
    });

    context('model is placing', function() {
      return this.modelModel.startPlaceP(this.model)
        .then((model) => { this.model = model; });
    }, function() {
      it('should return "ModelPlace" mode', function() {
        expect(this.context).toBe('ModelPlace');
      });
    });
  });

  context('checkStateP(<factions>, <target>)', function() {
    return this.modelModel
      .checkStateP('factions', this.target, this.model);
  }, function() {
    beforeEach(function() {
      this.modelModel.checkStateP.and.callThrough();
      this.gameFactionsModel.getModelInfoP.resolveWith({
        base_radius: 7.874
      });
      this.model = { state: { info: 'info' } };
      this.target = null;
    });

    it('should fetch model info', function() {
      expect(this.gameFactionsModel.getModelInfoP)
        .toHaveBeenCalledWith('info', 'factions');
    });

    example(function(e, d) {
      context(d, function() {
        this.model.state = R.merge(e.pos, this.model.state);
      }, function() {
        it('should keep model on board, '+d, function() {
          expect(R.pick(['x','y'], this.context.state))
            .toEqual(e.res);
        });
      });
    }, [
      [ 'pos', 'res' ],
      [ { x: 480, y: 240 }, { x: 472.126, y: 240 } ],
      [ { x: 0, y: 240 }, { x: 7.874, y: 240 } ],
      [ { x: 240, y: 480 }, { x: 240, y: 472.126 } ],
      [ { x: 240, y: 0 }, { x: 240, y: 7.874 } ],
    ]);

    example(function(e, d) {
      context(d, function() {
        this.model.state = R.merge(e.pos, {
          info: 'info',
          cml: 10,
          cha: { s: { x: 240, y: 240 } }
        });
      }, function() {
        it('should ensure max charge distance, '+d, function() {
          expect(R.pick(['x','y'], this.context.state))
            .toEqual(e.res);
        });
      });
    }, [
      [ 'pos', 'res' ],
      [ { x: 480, y: 240 }, { x: 340, y: 240 } ],
      [ { x: 0, y: 240 }, { x: 140, y: 240 } ],
      [ { x: 240, y: 480 }, { x: 240, y: 340 } ],
      [ { x: 240, y: 0 }, { x: 240, y: 140 } ],
      [ { x: 0, y: 0 }, { x: 169.28932188134524, y: 169.28932188134524 } ],
      [ { x: 480, y: 480 }, { x: 310.71067811865476, y: 310.71067811865476 } ],
    ]);

    example(function(e, d) {
      context(d, function() {
        this.model.state = R.merge(e.pos, {
          info: 'info',
          cha: { s: { x: 240, y: 240 } }
        });
      }, function() {
        it('should ensure charge orientation, '+d, function() {
          expect(R.pick(['r'], this.context.state))
            .toEqual(e.res);
        });
      });
    }, [
      [ 'pos', 'res' ],
      [ { x: 480, y: 240 }, { r: 90 } ],
      [ { x: 0, y: 240 }, { r: -90 } ],
      [ { x: 240, y: 480 }, { r: 180 } ],
      [ { x: 240, y: 0 }, { r: 0 } ],
      [ { x: 0, y: 0 }, { r: -45 } ],
      [ { x: 480, y: 480 }, { r: 135 } ],
    ]);

    example(function(e, d) {
      context(d, function() {
        this.model.state = R.merge(e.pos, {
          info: 'info',
          cha: { s: { x: 240, y: 240 } }
        });
      }, function() {
        beforeEach(function() {
          this.target = { state: { x: 120, y: 120 } };
        });

        it('should orient model to target, '+d, function() {
          expect(R.pick(['r'], this.context.state))
            .toEqual(e.res);
        });
      });
    }, [
      [ 'pos', 'res' ],
      [ { x: 480, y: 240 }, { r: -71.18155179962957 } ],
      [ { x: 0, y: 240 }, { r: 43.05720147751564 } ],
      [ { x: 240, y: 480 }, { r: -18.81844820037043 } ],
      [ { x: 240, y: 0 }, { r: -133.05720147751566 } ],
    ]);

    example(function(e, d) {
      context(d, function() {
        this.model.state = R.merge(e.pos, {
          info: 'info',
          pml: [ 10, e.within ],
          pla: { s: { x: 240, y: 240 } }
        });
      }, function() {
        it('should ensure max place distance, '+d, function() {
          expect(R.pick(['x','y'], this.context.state))
            .toEqual(e.res);
        });
      });
    }, [
      [ 'within', 'pos'              , 'res'                      ],
      [ false   , { x: 480, y: 240 } , { x: 340    , y: 240     } ],
      [ true    , { x: 480, y: 240 } , { x: 355.748, y: 240     } ],
      [ false   , { x: 0, y: 240 }   , { x: 140    , y: 240     } ],
      [ true    , { x: 0, y: 240 }   , { x: 124.252, y: 240     } ],
      [ false   , { x: 240, y: 480 } , { x: 240    , y: 340     } ],
      [ true    , { x: 240, y: 480 } , { x: 240    , y: 355.748 } ],
      [ false   , { x: 240, y: 0 }   , { x: 240    , y: 140     } ],
      [ true    , { x: 240, y: 0 }   , { x: 240    , y: 124.252 } ],
      [ false   , { x: 0, y: 0 }     , { x: 169.28932188134524 , y: 169.28932188134524 } ],
      [ true    , { x: 0, y: 0 }     , { x: 158.1538042912195  , y: 158.1538042912195  } ],
      [ false   , { x: 480, y: 480 } , { x: 310.71067811865476 , y: 310.71067811865476 } ],
      [ true    , { x: 480, y: 480 } , { x: 321.8461957087805  , y: 321.8461957087805  } ],
    ]);
  });
});
