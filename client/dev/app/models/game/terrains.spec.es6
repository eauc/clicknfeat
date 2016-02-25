describe('gameTerrains model', function() {
  beforeEach(inject([
    'gameTerrains',
    function(gameTerrainsModel) {
      this.gameTerrainsModel = gameTerrainsModel;

      this.terrains = {
        active: [
          { state: { stamp: 'stamp1' } },
          { state: { stamp: 'stamp2' } },
        ],
        locked: [
          { state: { stamp: 'stamp3' } },
        ]
      };
    }
  ]));

  describe('add(<terrains>)', function() {
    beforeEach(function() {
      this.terrains = {
        active: [ { state: { stamp: 'other1', x: 1 } } ],
        locked: [ { state: { stamp: 'other2', x: 1, lk: true } } ]
      };
    });

    example(function(e, d) {
      it('should add <terrain> to active terrains list, '+d, function() {
        expect(this.gameTerrainsModel.add(e.new, this.terrains))
          .toEqual(e.result);
      });
    }, [
      [ 'new', 'result' ],
      [ [ { state: { stamp: 'new1' } },
          { state: { stamp: 'new2' } } ],
        { active: [ { state: { stamp: 'new1' } },
                    { state: { stamp: 'new2' } },
                    { state: { stamp: 'other1', x: 1 } }
                  ],
          locked: [ { state: { stamp: 'other2', x: 1, lk: true } }
                  ]
        }
      ],
      // remove other identics stamps
      [ [ { state: { stamp: 'other1' } },
          { state: { stamp: 'other2' } },
          { state: { stamp: 'new2' } } ],
        { active: [ { state: { stamp: 'other1' } },
                    { state: { stamp: 'other2' } },
                    { state: { stamp: 'new2' } } ],
          locked: []
        }
      ],
      // refresh active/locked
      [ [ { state: { stamp: 'new1' } },
          { state: { stamp: 'new2', lk: true } } ],
        { active: [ { state: { stamp: 'new1' } },
                    { state: { stamp: 'other1', x: 1 } }
                  ],
          locked: [ { state: { stamp: 'new2', lk: true } },
                    { state: { stamp: 'other2', x: 1, lk: true } } ]
        }
      ],
    ]);
  });

  describe('removeStamps(<terrain>)', function() {
    beforeEach(function() {
      this.terrains = {
        active: [ { state: { stamp: 'active1' } },
                  { state: { stamp: 'active2' } },
                ],
        locked: [ { state: { stamp: 'locked1', lk: true } },
                  { state: { stamp: 'locked2', lk: true } },
                ]
      };
    });

    example(function(e, d) {
      it('should remove <stamp> from terrains list, '+d, function() {
        expect(this.gameTerrainsModel.removeStamps(e.stamps, this.terrains))
          .toEqual(e.result);
      });
    }, [
      [ 'stamps', 'result' ],
      [ [ 'active1', 'active2' ],
        { active: [ ],
          locked: [ { state: { stamp: 'locked1', lk: true } },
                    { state: { stamp: 'locked2', lk: true } }
                  ]
        }
      ],
      [ [ 'locked1', 'active1' ],
        { active: [ { state: { stamp: 'active2' } } ],
          locked: [ { state: { stamp: 'locked2', lk: true } } ]
        }
      ],
      [ [ 'unknwown', 'active1' ],
        { active: [ { state: { stamp: 'active2' } } ],
          locked: [ { state: { stamp: 'locked1', lk: true } },
                    { state: { stamp: 'locked2', lk: true } }
                  ]
        }
      ]
    ]);
  });

  context('copyStampsP(<stamps>)', function() {
    return this.gameTerrainsModel
      .copyStampsP(this.stamps, this.terrains);
  }, function() {
    beforeEach(function() {
      this.terrains = {
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
        terrains: [ { stamp: 'stamp1', x: 0, y: 0, r: 0, l: [ 'toto' ] } ]
      } ],
      [ [ 'stamp1', 'stamp4' ], {
        base: { x: 240, y: 240, r: 90 },
        terrains: [ { stamp: 'stamp1', x: 0, y: 0, r: 0, l: [ 'toto' ] },
                    { stamp: 'stamp4', x: -120, y: 0, r: 0, l: [ 'tutu' ] } ]
      } ],
      [ [ 'stamp2', 'stamp4', 'stamp6' ], {
        base: { x: 240, y: 120, r: 90 },
        terrains: [ { stamp: 'stamp2', x: 0, y: 0, r: 0, l: [ 'tata' ] },
                    { stamp: 'stamp4', x: -120, y: 120, r: 0, l: [ 'tutu' ] },
                    { stamp: 'stamp6', x: 120, y: 120, r: 0, l: [ 'toto' ] } ]
      } ],
    ]);
  });

  context('findStampP(<stamp>)', function() {
    return this.gameTerrainsModel
      .findStampP(this.stamp, this.terrains);
  }, function() {
    example(function(e) {
      context('when stamp exists', function() {
        this.stamp = e.stamp;
      }, function() {
        it('should find <stamp> in terrains', function() {
          expect(this.context).toEqual({ state: { stamp: e.stamp } });
        });
      });
    }, [
      [ 'stamp' ],
      [ 'stamp2' ],
      [ 'stamp3' ],
    ]);

    context('when <stamp> is not  found', function() {
      this.stamp = 'unknown';
      this.expectContextError();
    }, function() {
      it('should reject result', function() {
        expect(this.contextError).toEqual([
          'Terrain unknown not found'
        ]);
      });
    });
  });

  context('findAnyStamps(<stamps>)', function() {
    return this.gameTerrainsModel
      .findAnyStampsP(this.stamps, this.terrains);
  }, function() {
    context('when some <stamps> exist', function() {
      this.stamps = ['stamp2', 'whatever', 'stamp3'];
    }, function() {
      it('should find stamps', function() {
        expect(this.context).toEqual([
          { state: { stamp: 'stamp2' } },
          null,
          { state: { stamp: 'stamp3' } },
        ]);
      });
    });

    context('none of the <stamps> exist', function() {
      this.stamps = ['whatever', 'unknown'];
      this.expectContextError();
    }, function() {
      it('should reject result', function() {
        expect(this.contextError).toEqual([
          'No terrain found'
        ]);
      });
    });
  });

  context('onStampsP(<method>, <...args...>, <stamps>)', function() {
    return this.gameTerrainsModel
      .onStampsP(this.method, ['arg1', 'arg2'], this.stamps, this.terrains);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamp2', 'stamp3'];
      this.terrainModel = spyOnService('terrain');
    });

    context('when terrainModel does not respond to <method>', function() {
      this.method = 'whatever';
      this.expectContextError();
    }, function() {
      it('should reject method', function() {
        expect(this.contextError).toEqual([
          'Unknown method "whatever" on terrains'
        ]);
      });
    });

    context('when terrainModel responds to <method>', function() {
      this.method = 'setState';
    }, function() {
      context('when none of the <stamps> are found', function() {
        this.stamps = ['whatever', 'unknown'];
        this.expectContextError();
      }, function() {
        it('should reject method', function() {
          expect(this.contextError).toEqual([
            'No terrain found'
          ]);
        });
      });

      context('when some <stamps> are found', function() {
        this.stamps = ['stamp2', 'whatever', 'stamp3'];
      }, function() {
        beforeEach(function() {
          this.terrainModel.isLocked.and.callFake((m) => {
            return m.state.stamp === 'stamp2';
          });
          this.terrainModel.setState.and.callFake((f,s,m) => {
            return R.assocPath(['state','set'],'set', m);
          });
        });

        it('should call <method> on <stamp> terrain', function() {
          expect(this.terrainModel[this.method])
            .toHaveBeenCalledWith('arg1', 'arg2',
                                  { state: { stamp: 'stamp2' } });
          expect(this.terrainModel[this.method])
            .toHaveBeenCalledWith('arg1', 'arg2',
                                  { state: { stamp: 'stamp3' } });
          expect(this.context)
            .toEqual({
              active: [ { state: { stamp: 'stamp3', set: 'set' } },
                        { state: { stamp: 'stamp1' } }
                      ],
              locked: [ { state: { stamp: 'stamp2', set: 'set' } }
                      ]
            });
        });

        context('when some calls to <method> fail', function() {
          this.terrainModel.setState.and.callFake((a1,a2,m) => {
            return ( m.state.stamp === 'stamp2' ?
                     R.assocPath(['state','set'],'set', m) :
                     self.Promise.reject('reason')
                   );
          });
        }, function() {
          it('should return partial result', function() {
            expect(this.context).toEqual({
              active: [ { state: { stamp: 'stamp3' } },
                        { state: { stamp: 'stamp1' } }
                      ],
              locked: [ { state: { stamp: 'stamp2', set: 'set' } }
                      ]
            });
          });
        });
      });
    });
  });

  context('fromStampP(<method>, <...args...>, <stamps>)', function() {
    return this.gameTerrainsModel
      .fromStampsP(this.method, ['arg1', 'arg2'], this.stamps, this.terrains);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamp2', 'stamp3'];

      this.terrainModel = spyOnService('terrain');
      this.terrainModel.setState.and.callFake((a1, a2, m) => {
        return 'terrain.setState.returnValue('+m.state.stamp+')';
      });
    });

    context('when terrainModel does not respond to <method>', function() {
      this.method = 'whatever';
      this.expectContextError();
    }, function() {
      it('should reject method', function() {
        expect(this.contextError).toEqual([
          'Unknown method "whatever" on terrains'
        ]);
      });
    });

    context('when terrainModel responds to <method>', function() {
      this.method = 'setState';
    }, function() {
      context('when none of the <stamps> are found', function() {
        this.stamps = ['whatever', 'unknown'];
        this.expectContextError();
      }, function() {
        it('should reject method', function() {
          expect(this.contextError).toEqual([
            'No terrain found'
          ]);
        });
      });

      context('when some <stamps> are found', function() {
        this.stamps = ['stamp2', 'whatever', 'stamp3'];
      }, function() {
        it('should call <method> on <stamp> terrain', function() {
          expect(this.terrainModel[this.method])
            .toHaveBeenCalledWith('arg1', 'arg2',
                                  { state: { stamp: 'stamp2' } });
          expect(this.terrainModel[this.method])
            .toHaveBeenCalledWith('arg1', 'arg2',
                                  { state: { stamp: 'stamp3' } });
          expect(this.context)
            .toEqual([
              'terrain.setState.returnValue(stamp2)',
              'terrain.setState.returnValue(stamp3)'
            ]);
        });

        context('when some calls to <method> fail', function() {
          this.terrainModel.setState.and.callFake((f,s,m) => {
            return ( m.state.stamp === 'stamp2' ?
                     'terrain.setState.returnValue('+m.state.stamp+')' :
                     self.Promise.reject('reason')
                   );
          });
        }, function() {
          it('should return partial result', function() {
            expect(this.context).toEqual([
              'terrain.setState.returnValue(stamp2)',
              null
            ]);
          });
        });
      });
    });
  });

  context('lockStampsP(<lock>, <stamps>)', function() {
    return this.gameTerrainsModel
      .lockStampsP(this.lock, this.stamps, this.terrains);
  }, function() {
    beforeEach(function() {
      this.terrains = {
        active: [ { state: { stamp: 's1' } },
                  { state: { stamp: 's2' } } ],
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
      [ true  , ['s1']  , { active: [ { state: { stamp: 's2' } } ],
                            locked: [ { state: { stamp: 's1', lk: true } },
                                      { state: { stamp: 's3', lk: true } },
                                      { state: { stamp: 's4', lk: true } } ]
                          } ],
      [ false , ['s1']  , { active: [ { state: { stamp: 's1', lk: false } },
                                      { state: { stamp: 's2' } } ],
                            locked: [ { state: { stamp: 's3', lk: true } },
                                      { state: { stamp: 's4', lk: true } } ]
                          } ],
      [ true  , ['s3']  , { active: [ { state: { stamp: 's1' } },
                                      { state: { stamp: 's2' } } ],
                            locked: [ { state: { stamp: 's3', lk: true } },
                                      { state: { stamp: 's4', lk: true } } ]
                          } ],
      [ false , ['s4']  , { active: [ { state: { stamp: 's4', lk: false } },
                                      { state: { stamp: 's1' } },
                                      { state: { stamp: 's2' } }
                                    ],
                            locked: [ { state: { stamp: 's3', lk: true } } ]
                          } ],
      [ true  , ['s2','s3'] , { active: [ { state: { stamp: 's1' } } ],
                                locked: [ { state: { stamp: 's2', lk: true } },
                                          { state: { stamp: 's3', lk: true } },
                                          { state: { stamp: 's4', lk: true } } ]
                              } ],
      [ false , ['s1','s4'] , { active: [ { state: { stamp: 's1', lk: false } },
                                          { state: { stamp: 's4', lk: false } },
                                          { state: { stamp: 's2' } } ],
                                locked: [ { state: { stamp: 's3', lk: true } } ]
                              } ],
    ]);
  });
});
