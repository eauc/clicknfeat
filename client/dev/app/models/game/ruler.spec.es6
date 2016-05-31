describe('gameRuler model', function() {
  beforeEach(inject([ 'gameRuler', function(gameRulerModel) {
    this.gameRulerModel = gameRulerModel;

    this.modelModel = spyOnService('model');
    this.gameModelsModel = spyOnService('gameModels');

    this.game = 'game';
    this.models = 'models';
    this.gameModelsModel.findStamp.and.callFake((s) => {
      return ( s === 'origin' ? this.origin_model :
               ( s === 'target' ? this.target_model : null )
             );
    });
  }]));

  context('toggleDisplay()', function() {
    return this.gameRulerModel.toggleDisplay({
      remote: { display: false }
    });
  }, function() {
    it('should toggle remote ruler display', function() {
      expect(this.context)
        .toEqual({ remote: { display: true } });
    });
  });

  context('setMaxLength(<start>, <end>, <state>)', function() {
    return this.gameRulerModel
      .setMaxLength(this.length, this.models, this.ruler);
  }, function() {
    beforeEach(function() {
      this.ruler = this.gameRulerModel.create();
      this.ruler.remote.start = { x: 240, y: 240 };
      this.ruler.remote.end = { x: 360, y: 240 };
      this.ruler.remote.origin = 'origin';
      this.ruler.remote.target = 'target';
      this.length = 5;
    });

    it('should set ruler max length', function() {
      expect(this.context.local.max)
        .toBe(this.length);
      expect(this.gameRulerModel.maxLength(this.context))
        .toBe(this.length);
    });

    it('should look up ruler origin & target', function() {
      expect(this.gameModelsModel.findStamp)
        .toHaveBeenCalledWith('origin', 'models');
      expect(this.gameModelsModel.findStamp)
        .toHaveBeenCalledWith('target', 'models');
    });

    context('when neither target nor origin is set', function() {
      this.origin_model = null;
      this.target_model = null;
    }, function() {
      example(function(e, d) {
        context(d, function() {
          this.length = e.max_length;
        }, function() {
          it('should set ruler according to start/end points', function() {
            expect(this.context.remote.start)
              .toEqual(this.ruler.remote.start);
            expect(this.context.remote.end)
              .toEqual(e.end);
            expect(this.context.remote.length)
              .toEqual(e.length);
            expect(this.context.remote.reached)
              .toEqual(e.reached);
          });
        });
      }, [
        [ 'max_length' , 'length' , 'reached' , 'end'    ],
        [ 5            , 5        , false     , { x: 290 , y: 240 } ],
        [ 140          , 12       , true      , { x: 360 , y: 240 } ],
        [ null         , 12       , true      , { x: 360 , y: 240 } ],
      ]);
    });

    example(function(e) {
      context(`when only ${e.only} is set`, function() {
        this[`${e.only}_model`] = { state: { x: 120, y: 120 } };
      }, function() {
        it(`should set ruler on ${e.only}`, function() {
          expect(this.context.remote.start)
            .toEqual(this[`${e.only}_model`].state);
          expect(this.context.remote.end)
            .toEqual(this[`${e.only}_model`].state);
          expect(this.context.remote.length)
            .toEqual(0);
          expect(this.context.remote.reached)
            .toEqual(true);
        });
      });
    }, [
      [ 'only'   ],
      [ 'origin' ],
      [ 'target' ],
    ]);

    context('when both origin and target are set', function() {
      this.origin_model = 'origin_model';
      this.target_model = 'target_model';
    }, function() {
      beforeEach(function() {
        this.modelModel.shortestLineTo.and.returnValue({
          start: { x: 120, y: 120 },
          end:   { x: 120, y: 240 }
        });
      });

      example(function(e, d) {
        context(d, function() {
          this.length = e.max_length;
        }, function() {
          it('should set ruler according to origin/target models', function() {
            expect(this.modelModel.shortestLineTo)
              .toHaveBeenCalledWith('target_model', 'origin_model');

            expect(this.context.remote.start)
              .toEqual({ x: 120, y: 120 });
            expect(this.context.remote.end)
              .toEqual(e.end);
            expect(this.context.remote.length)
              .toEqual(e.length);
            expect(this.context.remote.reached)
              .toEqual(e.reached);
          });
        });
      }, [
        [ 'max_length' , 'length' , 'reached' , 'end'                              ],
        [ 5            , 5        , false     , { x: 120                , y: 170 } ],
        [ 140          , 12       , true      , { x: 120.00000000000001 , y: 240 } ],
        [ null         , 12       , true      , { x: 120.00000000000001 , y: 240 } ],
      ]);
    });
  });

  context('setLocal(<start>, <end>, <state>)', function() {
    return this.gameRulerModel
      .setLocal(this.start, this.end, this.ruler);
  }, function() {
    beforeEach(function() {
      this.start = { x: 100, y: 0 };
      this.end = { x: 100, y: 100 };
      this.ruler = { local: {}  };
    });

    it('should set local ruler state', function() {
      expect(this.context).toEqual({
        local: { start: { x:100, y: 0},
                 end: { x: 100.00000000000001,
                        y: 100 },
                 length: null,
                 display: true
               }
      });
    });

    context('with max length', function() {
      this.ruler.local.max = 5;
    }, function() {
      it('should enforce max length', function() {
        expect(this.context).toEqual({
          local: { max: 5,
                   start: { x:100, y: 0},
                   end: { x: 100,
                          y: 50 },
                   length: null,
                   display: true
                 }
        });
      });
    });
  });

  context('setRemote(<start>, <end>, <state>)', function() {
    return this.gameRulerModel
      .setRemote(this.start, this.end, this.models, this.ruler);
  }, function() {
    beforeEach(function() {
      this.pointModel = spyOnService('point');
      this.pointModel.distanceTo.and.callThrough();
      this.pointModel.directionTo.and.callThrough();
      this.pointModel.translateInDirection.and.callThrough();

      this.start = { x: 100, y: 0 };
      this.end = { x: 100, y: 100 };
      this.ruler = { local: {},
                     remote: {}
                   };
    });

    it('should reset local ruler state', function() {
      expect(this.context.local)
        .toEqual({ display: false });
    });

    it('should set remote ruler state', function() {
      expect(this.context.remote)
        .toEqual({ origin: null,
                   target: null,
                   start: { x: 100, y: 0 },
                   end: { x: 100.00000000000001,
                          y: 100 },
                   length: 10,
                   reached: true,
                   display: true
                 });
    });

    context('with max length', function() {
      this.ruler.remote.max = 5;
    }, function() {
      it('should enforce max length', function() {
        expect(this.context.remote)
          .toEqual({ max: 5,
                     origin: null,
                     target: null,
                     start: { x: 100, y: 0},
                     end: { x: 100,
                            y: 50 },
                     length: 5,
                     reached: false,
                     display: true
                   });
      });
    });
  });

  context('resetRemote(<state>, <state>)', function() {
    return this.gameRulerModel
      .resetRemote(this.remote, this.ruler);
  }, function() {
    beforeEach(function() {
      this.remote = { state: 'state' };
      this.ruler = { remote: 'old' };
    });

    it('should reset remote state', function() {
      expect(this.context)
        .toEqual({ remote: this.remote });
      expect(this.context.remote)
        .not.toBe(this.remote);
    });
  });

  context('saveRemoteState', function() {
    return this.gameRulerModel
      .saveRemoteState(this.ruler);
  }, function() {
    beforeEach(function() {
      this.ruler = {
        remote: { state: 'state' }
      };
    });

    it('should return a copy of remote state', function() {
      expect(this.context)
        .toEqual(this.ruler.remote);
      expect(this.context)
        .not.toBe(this.ruler.remote);
    });
  });

  context('clearOrigin(<state>)', function() {
    return this.gameRulerModel
      .clearOrigin(this.models, this.ruler);
  }, function() {
    beforeEach(function() {
      this.ruler = {
        remote: { start: { x: 0, y: 0 },
                  end: { x: 1, y: 1 },
                  max: 4,
                  origin: 'origin',
                  target: null
                }
      };
    });

    it('should clear ruler origin', function() {
      expect(this.context.remote.start)
        .toEqual(this.ruler.remote.start);
      expect(this.context.remote.end)
        .toEqual({ x: 1.0000000000000002, y: 1 });
      expect(this.context.remote.length)
        .toEqual(0.14);
      expect(this.context.remote.max)
        .toEqual(4);
      expect(this.context.remote.origin)
        .toBe(null);
      expect(this.context.remote.target)
        .toBe(null);
      expect(this.context.remote.display)
        .toBe(false);
    });
  });

  context('clearTarget(<state>)', function() {
    return this.gameRulerModel
      .clearTarget(this.models, this.ruler);
  }, function() {
    beforeEach(function() {
      this.ruler = {
        remote: { start: { x: 0, y: 0 },
                  end: { x: 1, y: 1 },
                  max: 4,
                  origin: null,
                  target: 'target'
                }
      };
    });

    it('should clear ruler target', function() {
      expect(this.context.remote.start)
        .toEqual(this.ruler.remote.start);
      expect(this.context.remote.end)
        .toEqual({ x: 1.0000000000000002, y: 1 });
      expect(this.context.remote.length)
        .toEqual(0.14);
      expect(this.context.remote.max)
        .toEqual(4);
      expect(this.context.remote.origin)
        .toBe(null);
      expect(this.context.remote.target)
        .toBe(null);
      expect(this.context.remote.display)
        .toBe(false);
    });
  });

  context('setOrigin(<origin>, <state>)', function() {
    return this.gameRulerModel
      .setOrigin(this.origin, this.models, this.ruler);
  }, function() {
    beforeEach(function() {
      this.origin = { state: { stamp: 'origin' } };
      this.ruler = {
        remote: { max: null,
                  target: null
                }
      };
      this.modelModel.rulerMaxLength
        .and.returnValue(null);
    });

    context('when only origin is set', function() {
      this.origin_model = { state: { x: 240, y: 240 } };
      this.ruler.remote.target = null;
    }, function() {
      it('should set ruler on origin', function() {
        expect(this.context.remote.start)
          .toEqual(this.origin_model.state);
        expect(this.context.remote.end)
          .toEqual(this.origin_model.state);
        expect(this.context.remote.length)
          .toEqual(0);
        expect(this.context.remote.reached)
          .toEqual(true);
        expect(this.context.remote.display)
          .toBe(false);
      });
    });

    context('when target is the same as origin', function() {
      this.origin_model = { state: { x: 240, y: 240 } };
      this.ruler.remote.target = 'origin';
    }, function() {
      it('should set ruler on origin and reset target', function() {
        expect(this.context.remote.start)
          .toEqual(this.origin_model.state);
        expect(this.context.remote.end)
          .toEqual(this.origin_model.state);
        expect(this.context.remote.length)
          .toEqual(0);
        expect(this.context.remote.reached)
          .toEqual(true);
        expect(this.context.remote.display)
          .toBe(false);
        expect(this.context.remote.target)
          .toBe(null);
      });
    });

    context('when both origin and target are set', function() {
      this.ruler.remote.origin = 'origin';
      this.ruler.remote.target = 'target';
      this.origin_model = 'origin_model';
      this.target_model = 'target_model';
    }, function() {
      beforeEach(function() {
        this.modelModel.shortestLineTo.and.returnValue({
          start: { x: 120, y: 120 },
          end:   { x: 120, y: 240 }
        });
      });

      example(function(e, d) {
        context(d, function() {
          this.ruler.remote.max = e.max_length;
        }, function() {
          it('should set ruler according to origin/target models', function() {
            expect(this.modelModel.shortestLineTo)
              .toHaveBeenCalledWith('target_model', 'origin_model');

            expect(this.context.remote.start)
              .toEqual({ x: 120, y: 120 });
            expect(this.context.remote.end)
              .toEqual(e.end);
            expect(this.context.remote.length)
              .toEqual(e.length);
            expect(this.context.remote.reached)
              .toEqual(e.reached);
            expect(this.context.remote.display)
              .toEqual(true);
          });
        });
      }, [
        [ 'max_length' , 'length' , 'reached' , 'end'                              ],
        [ 5            , 5        , false     , { x: 120                , y: 170 } ],
        [ 140          , 12       , true      , { x: 120.00000000000001 , y: 240 } ],
        [ null         , 12       , true      , { x: 120.00000000000001 , y: 240 } ],
      ]);

      example(function(e) {
        context('when origin model\'s rulerMaxLength is '+e.max_length, function() {
          this.modelModel.rulerMaxLength
            .and.returnValue(e.max_length);
        }, function() {
          it('should set ruler according to origin\'s rulerMaxLength', function() {
            expect(this.modelModel.shortestLineTo)
              .toHaveBeenCalledWith('target_model', 'origin_model');

            expect(this.context.remote.max)
              .toBe(e.max_length);
            expect(this.context.remote.start)
              .toEqual({ x: 120, y: 120 });
            expect(this.context.remote.end)
              .toEqual(e.end);
            expect(this.context.remote.length)
              .toEqual(e.length);
            expect(this.context.remote.reached)
              .toEqual(e.reached);
            expect(this.context.remote.display)
              .toEqual(true);
          });
        });
      }, [
        [ 'max_length' , 'length' , 'reached' , 'end'                              ],
        [ 5            , 5        , false     , { x: 120                , y: 170 } ],
        [ 140          , 12       , true      , { x: 120.00000000000001 , y: 240 } ],
        [ null         , 12       , true      , { x: 120.00000000000001 , y: 240 } ],
      ]);
    });
  });

  context('setOriginResetTarget(<origin>, <state>)', function() {
    return this.gameRulerModel
      .setOriginResetTarget(this.origin, this.models, this.ruler);
  }, function() {
    beforeEach(function() {
      this.origin = { state: { stamp: 'origin' } };
      this.origin_model = { state: { x: 240, y: 240 } };
      this.ruler = {
        remote: { max: null,
                  target: null
                }
      };
      this.modelModel.rulerMaxLength
        .and.returnValue(null);
    });

    it('should set ruler on origin and reset target', function() {
      expect(this.context.remote.start)
        .toEqual(this.origin_model.state);
      expect(this.context.remote.end)
          .toEqual(this.origin_model.state);
      expect(this.context.remote.length)
        .toEqual(0);
      expect(this.context.remote.reached)
        .toEqual(true);
      expect(this.context.remote.display)
        .toBe(false);
      expect(this.context.remote.target)
        .toBe(null);
    });

    context('when origin model has a rulerMaxLength', function() {
      this.modelModel.rulerMaxLength
        .and.returnValue(42);
    }, function() {
      it('should init ruler max length', function() {
        expect(this.context.remote.max)
          .toBe(42);
      });
    });
  });

  context('setTarget(<target>, <state>)', function() {
    return this.gameRulerModel
      .setTarget(this.target, this.models, this.ruler);
  }, function() {
    beforeEach(function() {
      this.target = { state: { stamp: 'target' } };
      this.ruler = {
        remote: { max: null,
                  target: null
                }
      };
    });

    context('when only target is set', function() {
      this.target_model = { state: { x: 240, y: 240 } };
      this.ruler.remote.origin = null;
    }, function() {
      it('should set ruler on target', function() {
        expect(this.context.remote.start)
          .toEqual(this.target_model.state);
        expect(this.context.remote.end)
          .toEqual(this.target_model.state);
        expect(this.context.remote.length)
          .toEqual(0);
        expect(this.context.remote.reached)
          .toEqual(true);
        expect(this.context.remote.display)
          .toBe(false);
      });
    });

    context('when target is the same as origin', function() {
      this.target_model = { state: { x: 240, y: 240 } };
      this.ruler.remote.origin = 'target';
    }, function() {
      it('should set ruler on target and reset origin', function() {
        expect(this.context.remote.start)
          .toEqual(this.target_model.state);
        expect(this.context.remote.end)
          .toEqual(this.target_model.state);
        expect(this.context.remote.length)
          .toEqual(0);
        expect(this.context.remote.reached)
          .toEqual(true);
        expect(this.context.remote.display)
          .toBe(false);
        expect(this.context.remote.origin)
          .toBe(null);
      });
    });

    context('when both origin and target are set', function() {
      this.ruler.remote.origin = 'origin';
      this.ruler.remote.target = 'target';
      this.origin_model = 'origin_model';
      this.target_model = 'target_model';
    }, function() {
      beforeEach(function() {
        this.modelModel.shortestLineTo.and.returnValue({
          start: { x: 120, y: 120 },
          end:   { x: 120, y: 240 }
        });
      });

      example(function(e, d) {
        context(d, function() {
          this.ruler.remote.max = e.max_length;
        }, function() {
          it('should set ruler according to origin/target models', function() {
            expect(this.modelModel.shortestLineTo)
              .toHaveBeenCalledWith('target_model', 'origin_model');

            expect(this.context.remote.start)
              .toEqual({ x: 120, y: 120 });
            expect(this.context.remote.end)
              .toEqual(e.end);
            expect(this.context.remote.length)
              .toEqual(e.length);
            expect(this.context.remote.reached)
              .toEqual(e.reached);
            expect(this.context.remote.display)
              .toEqual(true);
          });
        });
      }, [
        [ 'max_length' , 'length' , 'reached' , 'end'                              ],
        [ 5            , 5        , false     , { x: 120                , y: 170 } ],
        [ 140          , 12       , true      , { x: 120.00000000000001 , y: 240 } ],
        [ null         , 12       , true      , { x: 120.00000000000001 , y: 240 } ],
      ]);
    });
  });

  context('targetAoEPositionP(<models>)', function() {
    return this.gameRulerModel
      .targetAoEPosition('models', this.ruler);
  }, function() {
    beforeEach(function() {
      this.ruler = {
        remote: { start: { x:0, y: 0 },
                  end: { x: 240, y: 240 },
                  length: 4.5
                }
      };
      this.gameModelsModel.findStamp.and.returnValue({
        state: { x: 320, y: 320 }
      });
    });

    context('when ruler target is not set', function() {
      this.ruler.remote.target = null;
    }, function() {
      it('should return end of ruler position', function() {
        expect(this.context).toEqual({
          x: 240, y: 240, r: 135, m: 2.25
        });
      });
    });

    context('when ruler target is set but not reached', function() {
      this.ruler.remote.target = 'target';
      this.ruler.remote.reached = false;
    }, function() {
      it('should return end of ruler position', function() {
        expect(this.context).toEqual({
          x: 240, y: 240, r: 135, m: 2.25
        });
      });
    });

    context('when ruler target is set and reached', function() {
      this.ruler.remote.target = 'target';
      this.ruler.remote.reached = true;
    }, function() {
      it('should return end of ruler position', function() {
        expect(this.context).toEqual({
          x: 320, y: 320, r: 135, m: 2.25
        });
      });
    });
  });
});
