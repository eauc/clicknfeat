describe('gameModels model', function() {
  beforeEach(inject([
    'gameModels',
    function(gameModelsModel) {
      this.gameModelsModel = gameModelsModel;

      this.modelModel = spyOnService('model');
      this.modelModel.setLock
        .and.callThrough();
      this.modelModel.isLocked
        .and.callThrough();
      this.modelModel.saveState
        .and.callThrough();

      this.models = {
        active: [
          { state: { stamp: 'stamp1', lk: false } },
          { state: { stamp: 'stamp2', lk: false } },
        ],
        locked: [
          { state: { stamp: 'stamp3', lk: true } },
        ]
      };
    }
  ]));

  describe('all', function() {
    it('should return a list of all models', function() {
      expect(this.gameModelsModel.all({
        active: [ 'active' ],
        locked: [ 'locked' ]
      })).toEqual([ 'active', 'locked' ]);
    });
  });

  context('copyStamps(<stamps>)', function() {
    return this.gameModelsModel
      .copyStamps(this.stamps, this.models);
  }, function() {
    beforeEach(function() {
      this.models = {
        active: [
          { state: { stamp: 'stamp1', x: 240, y: 240, r:  90, l: ['toto'] } },
          { state: { stamp: 'stamp2', x: 240, y: 120, r:  90, l: ['tata'] } },
          { state: { stamp: 'stamp3', x: 240, y: 240, r: 180, l: ['titi'] } },
        ],
        locked: [
          { state: { stamp: 'stamp4', x: 120, y: 240, r: 90, l: ['tutu'] } },
          { state: { stamp: 'stamp5', x: 240, y: 360, r:  0, l: ['tete'] } },
          { state: { stamp: 'stamp6', x: 360, y: 240, r: 90, l: ['toto'] } },
        ]
      };
    });

    example(function(e, d) {
      context(d, function() {
        this.stamps = e.stamps;
      }, function() {
        it('should return copy object for <stamps>', function() {
          expect(this.context).toEqual(e.result);
        });
      });
    }, [
      [ 'stamps' , 'result' ],
      [ [ 'stamp1' ], {
        base: { x: 240, y: 240, r: 90 },
        models: [ { stamp: 'stamp1', x: 0, y: 0, r: 0, l: [ 'toto' ] } ]
      } ],
      [ [ 'stamp1', 'stamp4' ], {
        base: { x: 240, y: 240, r: 90 },
        models: [ { stamp: 'stamp1', x: 0, y: 0, r: 0, l: [ 'toto' ] },
                  { stamp: 'stamp4', x: -120, y: 0, r: 0, l: [ 'tutu' ] } ]
      } ],
      [ [ 'stamp2', 'stamp4', 'stamp6' ], {
        base: { x: 240, y: 120, r: 90 },
        models: [ { stamp: 'stamp2', x: 0, y: 0, r: 0, l: [ 'tata' ] },
                  { stamp: 'stamp4', x: -120, y: 120, r: 0, l: [ 'tutu' ] },
                  { stamp: 'stamp6', x: 120, y: 120, r: 0, l: [ 'toto' ] } ]
      } ],
    ]);
  });

  describe('add(<models>)', function() {
    beforeEach(function() {
      this.models = {
        active: [ { state: { stamp: 'other1', x: 1 } } ],
        locked: [ { state: { stamp: 'other2', x: 1, lk: true } } ]
      };
    });

    example(function(e, d) {
      it('should add <model> to active models list, '+d, function() {
        expect(this.gameModelsModel.add(e.new, this.models))
          .toEqual(e.result);
      });
    }, [
      [ 'new', 'result' ],
      [ [ { state: { stamp: 'new1' } },
          { state: { stamp: 'new2' } } ], { active: [ { state: { stamp: 'new1' } },
                                                      { state: { stamp: 'new2' } },
                                                      { state: { stamp: 'other1', x: 1 } } ],
                                            locked: [ { state: { stamp: 'other2', x: 1, lk: true } } ]
                                          }
      ],
      // remove other identics stamps
      [ [ { state: { stamp: 'other1' } },
          { state: { stamp: 'other2' } },
          { state: { stamp: 'new2' } } ], { active: [ { state: { stamp: 'other1' } },
                                                      { state: { stamp: 'other2' } },
                                                      { state: { stamp: 'new2' } } ],
                                            locked: []
                                          }
      ],
    ]);
  });

  describe('removeStamps(<model>)', function() {
    beforeEach(function() {
      this.models = {
        active: [ { state: { stamp: 'active1' } },
                  { state: { stamp: 'active2' } },
                ],
        locked: [ { state: { stamp: 'locked1' } },
                  { state: { stamp: 'locked2' } },
                ]
      };
    });

    example(function(e, d) {
      it('should remove <stamp> from models list, '+d, function() {
        expect(this.gameModelsModel.removeStamps(e.stamps, this.models))
          .toEqual(e.result);
      });
    }, [
      [ 'stamps', 'result' ],
      [ [ 'active1', 'active2' ],  { active: [ ],
                                     locked: [ { state: { stamp: 'locked1' } },
                                               { state: { stamp: 'locked2' } }
                                             ]
                                   }
      ],
      [ [ 'locked1', 'active1' ],  { active: [ { state: { stamp: 'active2' } } ],
                                     locked: [ { state: { stamp: 'locked2' } } ]
                                   }
      ],
      [ [ 'unknwown', 'active1' ],  { active: [ { state: { stamp: 'active2' } } ],
                                      locked: [ { state: { stamp: 'locked1' } },
                                                { state: { stamp: 'locked2' } }
                                              ]
                                    }
      ]
    ]);
  });

  context('lockStamps(<lock>, <stamps>)', function() {
    return this.gameModelsModel
      .lockStamps(this.lock, this.stamps, this.models);
  }, function() {
    beforeEach(function() {
      this.models = {
        active: [ { state: { stamp: 's1', lk: false } },
                  { state: { stamp: 's2', lk: false } } ],
        locked: [ { state: { stamp: 's3', lk: true } },
                  { state: { stamp: 's4', lk: true } } ]
      };
    });

    example(function(e, d) {
      context(d, function() {
        this.lock = e.lock;
        this.stamps = e.stamps;
      }, function() {
        it('should set lock for <stamps>, '+d, function() {
          expect(this.context).toEqual(e.result);
        });
      });
    }, [
      [ 'lock', 'stamps', 'result' ],
      [ true  , ['s1']  , { active: [ { state: { stamp: 's2', lk: false } } ],
                            locked: [ { state: { stamp: 's1', lk: true } },
                                      { state: { stamp: 's3', lk: true } },
                                      { state: { stamp: 's4', lk: true } } ]
                          } ],
      [ false , ['s1']  , { active: [ { state: { stamp: 's1', lk: false } },
                                      { state: { stamp: 's2', lk: false } } ],
                            locked: [ { state: { stamp: 's3', lk: true } },
                                      { state: { stamp: 's4', lk: true } } ]
                          } ],
      [ true  , ['s3']  , { active: [ { state: { stamp: 's1', lk: false } },
                                      { state: { stamp: 's2', lk: false } } ],
                            locked: [ { state: { stamp: 's3', lk: true } },
                                      { state: { stamp: 's4', lk: true } } ]
                          } ],
      [ false , ['s4']  , { active: [ { state: { stamp: 's4', lk: false } },
                                      { state: { stamp: 's1', lk: false } },
                                      { state: { stamp: 's2', lk: false } } ],
                            locked: [ { state: { stamp: 's3', lk: true } } ]
                          } ],
      [ true  , ['s2','s3'] , { active: [ { state: { stamp: 's1', lk: false } } ],
                                locked: [ { state: { stamp: 's2', lk: true } },
                                          { state: { stamp: 's3', lk: true } },
                                          { state: { stamp: 's4', lk: true } } ]
                              } ],
      [ false , ['s1','s4'] , { active: [ { state: { stamp: 's1', lk: false } },
                                          { state: { stamp: 's4', lk: false } },
                                          { state: { stamp: 's2', lk: false } } ],
                                locked: [ { state: { stamp: 's3', lk: true } } ]
                              } ],
    ]);
  });

  context('findStampP(<stamp>)', function() {
    return this.gameModelsModel
      .findStamp(this.stamp, this.models);
  }, function() {
    example(function(e, d) {
      context(d, function() {
        this.stamp = e.stamp;
      }, function() {
        it('should find <stamp> in models', function() {
          expect(this.context).toEqual({ state: { stamp: e.stamp, lk: e.lk } });
        });
      });
    }, [
      [ 'stamp'  , 'lk'  ],
      [ 'stamp2' , false ],
      [ 'stamp3' , true  ],
    ]);

    context('when <stamp> is not  found', function() {
      this.stamp = 'unknown';
    }, function() {
      it('should return undefined', function() {
        expect(this.context).toBe(undefined);
      });
    });
  });

  context('findAnyStamps(<stamps>)', function() {
    return this.gameModelsModel
      .findAnyStamps(this.stamps, this.models);
  }, function() {
    context('when some <stamps> exist', function() {
      this.stamps = ['stamp2', 'whatever', 'stamp3'];
    }, function() {
      it('should find stamps', function() {
        expect(this.context).toEqual([
          { state: { stamp: 'stamp2', lk: false } },
          undefined,
          { state: { stamp: 'stamp3', lk: true } },
        ]);
      });
    });

    context('when none of the <stamps> exist', function() {
      this.stamps = ['whatever', 'unknown'];
    }, function() {
      it('should return undefined array', function() {
        expect(this.context).toEqual([
          undefined, undefined
        ]);
      });
    });
  });

  context('onStampP(<method>, <...args...>, <stamps>)', function() {
    return this.gameModelsModel
      .onStampsP(this.method, ['arg1', 'arg2'], this.stamps, this.models);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamp2', 'stamp3'];

      this.modelModel.setState.and.callFake((_a1_, _a2_, m) => {
        return 'model.setState.returnValue('+m.state.stamp+')';
      });
    });

    context('when modelModel does not respond to <method>', function() {
      this.method = 'whatever';
      this.expectContextError();
    }, function() {
      it('should reject method', function() {
        expect(this.contextError).toEqual([
          'Unknown method "whatever" on models'
        ]);
      });
    });

    context('when modelModel responds to <method>', function() {
      this.method = 'setState';
    }, function() {
      context('when none of the <stamps> are found', function() {
        this.stamps = ['whatever', 'unknown'];
      }, function() {
        it('should return unchanged models', function() {
          expect(this.context).toEqual(this.models);
        });
      });

      context('when some <stamps> are found', function() {
        this.stamps = ['stamp2', 'whatever', 'stamp3'];
      }, function() {
        beforeEach(function() {
          this.modelModel.setState.and.callFake((_f_,_s_,m) => {
            return R.assocPath(['state','set'],'set', m);
          });
        });

        it('should call <method> on <stamp> model', function() {
          expect(this.modelModel[this.method])
            .toHaveBeenCalledWith('arg1', 'arg2',
                                  { state: { stamp: 'stamp2', lk: false } });
          expect(this.modelModel[this.method])
            .toHaveBeenCalledWith('arg1', 'arg2',
                                  { state: { stamp: 'stamp3', lk: true } });
          expect(this.context)
            .toEqual({
              active: [ { state: { stamp: 'stamp2', set: 'set', lk: false } },
                        { state: { stamp: 'stamp1', lk: false } }
                      ],
              locked: [ { state: { stamp: 'stamp3', set: 'set', lk: true } }
                      ]
            });
        });

        context('when some calls to <method> fail', function() {
          this.modelModel.setState.and.callFake((_f_,_s_,m) => {
            return ( m.state.stamp === 'stamp2' ?
                     R.assocPath(['state','set'],'set', m) :
                     self.Promise.reject('reason')
                   );
          });
        }, function() {
          it('should return partial result', function() {
            expect(this.context).toEqual({
              active: [ { state: { stamp: 'stamp2', set: 'set', lk: false } },
                        { state: { stamp: 'stamp1', lk: false } }
                      ],
              locked: [ { state: { stamp: 'stamp3', lk: true } }
                      ]
            });
          });
        });
      });
    });
  });

  context('fromStampP(<method>, <...args...>, <stamps>)', function() {
    return this.gameModelsModel
      .fromStampsP(this.method, ['arg1', 'arg2'], this.stamps, this.models);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamp2', 'stamp3'];

      this.modelModel.setState.and.callFake((_a1_, _a2_, m) => {
        return 'model.setState.returnValue('+m.state.stamp+')';
      });
    });

    context('when modelModel does not respond to <method>', function() {
      this.method = 'whatever';
      this.expectContextError();
    }, function() {
      it('should reject method', function() {
        expect(this.contextError).toEqual([
          'Unknown method "whatever" on models'
        ]);
      });
    });

    context('when modelModel responds to <method>', function() {
      this.method = 'setState';
    }, function() {
      context('when none of the <stamps> are found', function() {
        this.stamps = ['whatever', 'unknown'];
      }, function() {
        it('should return undefined', function() {
          expect(this.context).toEqual([]);
        });
      });

      context('when some <stamps> are found', function() {
        this.stamps = ['stamp2', 'whatever', 'stamp3'];
      }, function() {
        it('should call <method> on <stamp> model', function() {
          expect(this.modelModel[this.method])
            .toHaveBeenCalledWith('arg1', 'arg2',
                                  { state: { stamp: 'stamp2', lk: false } });
          expect(this.modelModel[this.method])
            .toHaveBeenCalledWith('arg1', 'arg2',
                                  { state: { stamp: 'stamp3', lk: true } });
          expect(this.context)
            .toEqual([
              'model.setState.returnValue(stamp2)',
              'model.setState.returnValue(stamp3)'
            ]);
        });

        context('when some calls to <method> fail', function() {
          this.modelModel.setState.and.callFake((_f_,_s_,m) => {
            return ( m.state.stamp === 'stamp2' ?
                     'model.setState.returnValue('+m.state.stamp+')' :
                     self.Promise.reject('reason')
                   );
          });
        }, function() {
          it('should return partial result', function() {
            expect(this.context).toEqual([
              'model.setState.returnValue(stamp2)',
              null
            ]);
          });
        });
      });
    });
  });

  context('modeForStamp(<stamp>)', function() {
    return this.gameModelsModel
      .modeForStamp('stamp2', this.models);
  }, function() {
    beforeEach(function() {
      this.models = { active: [
        { state: { stamp: 'stamp1' } },
        { state: { stamp: 'stamp2' } },
      ], locked: [] };
    });

    it('should return mode for model <stamp>', function() {
      expect(this.modelModel.modeFor)
        .toHaveBeenCalledWith({ state: { stamp: 'stamp2' } });

      expect(this.context).toBe('model.modeFor.returnValue');
    });
  });

  context('findStampsBetweenPoints(<top_left>,<bottom_right>)', function() {
    return this.gameModelsModel
      .findStampsBetweenPoints('topleft', 'bottomright',
                               this.models);
  }, function() {
    beforeEach(function() {
      this.modelModel.isBetweenPoints.and.callFake((_s_,_e_,m) => {
        return ( m.state.stamp === 'stamp2' ||
                 m.state.stamp === 'stamp3'
               );
      });

      this.models = {
        active: [ { state : { stamp: 'stamp1' } }, { state : { stamp: 'stamp2' } } ],
        locked: [ { state : { stamp: 'stamp3' } }, { state : { stamp: 'stamp4' } } ]
      };
    });

    it('should find all models between the 2 points', function() {
      expect(this.modelModel.isBetweenPoints)
        .toHaveBeenCalledWith('topleft', 'bottomright',
                              { state: { stamp: 'stamp1' } });
      expect(this.context).toEqual([ 'stamp2', 'stamp3' ]);
    });

    context('when no stamps are found', function() {
      this.modelModel.isBetweenPoints.and.returnValue(false);
    }, function() {
      it('should find all models between the 2 points', function() {
        expect(this.context).toEqual([]);
      });
    });
  });
});
