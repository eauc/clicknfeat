describe('gameLos model', function() {
  beforeEach(inject([ 'gameLos', function(gameLosModel) {
    this.gameLosModel = gameLosModel;

    this.modelModel = spyOnService('model');
    this.gameModelsModel = spyOnService('gameModels');

    this.game = { models: 'models' };
    this.state = {
      factions: 'factions',
      game: this.game
    };

    this.gameModelsModel.findStamp.and.callFake((s) => {
      return ( s === 'origin' ? this.origin_model :
               ( s === 'target' ? this.target_model : null )
             );
    });
  }]));

  context('toggleDisplay()', function() {
    return this.gameLosModel
      .toggleDisplay({
        remote: { display: false }
      });
  }, function() {
    it('should toggle remote los display', function() {
      expect(this.gameLosModel.isDisplayed(this.context))
        .toEqual(true);
    });
  });

  context('setLocal(<start>, <end>, <state>)', function() {
    return this.gameLosModel
      .setLocal(this.start, this.end, this.los);
  }, function() {
    beforeEach(function() {
      this.start = { x: 100, y: 0 };
      this.end = { x: 100, y: 100 };
      this.los = { local: {}  };
    });

    it('should set local los state', function() {
      expect(this.context)
        .toEqual({ local: { start: { x:100, y: 0},
                            end: { x: 100, y: 100 },
                            display: true
                          }
                 });
    });
  });

  context('setRemote(<start>, <end>, <state>)', function() {
    return this.gameLosModel
      .setRemote(this.start, this.end, this.state, this.los);
  }, function() {
    beforeEach(function() {
      this.pointModel = spyOnService('point');
      this.pointModel.distanceTo.and.callThrough();
      this.pointModel.directionTo.and.callThrough();
      this.pointModel.translateInDirection.and.callThrough();

      this.start = { x: 100, y: 0 };
      this.end = { x: 100, y: 100 };
      this.los = { local: {},
                   remote: {}
                 };
    });

    it('should reset local los state', function() {
      expect(this.context.local)
        .toEqual({ display: false });
    });

    it('should set remote los state', function() {
      expect(R.pick(['start', 'end', 'display'], this.context.remote))
        .toEqual({ start: { x: 100, y: 0 },
                   end: { x: 100, y: 100 },
                   display: true
                 });
    });
  });

  context('resetRemote(<remote>, <state>)', function() {
    return this.gameLosModel
      .resetRemote(this.remote, this.los);
  }, function() {
    beforeEach(function() {
      this.remote = { state: 'state' };
      this.los = { local: {},
                   remote: {}
                 };
    });

    it('should reset remote state', function() {
      expect(R.pick(['state'], this.context.remote))
        .toEqual(this.remote);
      expect(this.context)
        .not.toBe(this.state);
    });
  });

  context('saveRemoteState', function() {
    return this.gameLosModel
      .saveRemoteState(this.los);
  }, function() {
    beforeEach(function() {
      this.los = {
        remote: { state: 'state' }
      };
    });

    it('should return a copy of remote state', function() {
      expect(this.context)
        .toEqual(this.los.remote);
      expect(this.context)
        .not.toBe(this.los.remote);
    });
  });

  context('clearOrigin(<state>)', function() {
    return this.gameLosModel
      .clearOrigin(this.los);
  }, function() {
    beforeEach(function() {
      this.los = this.gameLosModel.create();
      this.los.remote.origin = 'origin';
    });

    it('should clear origin', function() {
      expect(this.gameLosModel.origin(this.context))
        .toBe(null);
    });
  });

  context('clearTarget(<state>)', function() {
    return this.gameLosModel
      .clearTarget(this.los);
  }, function() {
    beforeEach(function() {
      this.los = this.gameLosModel.create();
      this.los.remote.target = 'target';
    });

    it('should clear origin', function() {
      expect(this.gameLosModel.target(this.context))
        .toBe(null);
    });
  });

  context('setOriginResetTarget(<origin>, <state>)', function() {
    return this.gameLosModel
      .setOriginResetTarget(this.origin, this.state, this.los);
  }, function() {
    beforeEach(function() {
      this.los = this.gameLosModel.create();
      this.origin = { state: { stamp: 'origin' } };
    });

    it('should set origin & reset target', function() {
      expect(this.gameLosModel.origin(this.context))
        .toBe('origin');
      expect(this.gameLosModel.target(this.context))
        .toBe(null);
    });
  });
});
