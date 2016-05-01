describe('gameSegment model', function() {
  beforeEach(inject([ 'gameSegment', function(gameSegmentModel) {
    this.gameSegmentModel = gameSegmentModel('type');
  }]));

  context('toggleDisplay()', function() {
    return this.gameSegmentModel
      .toggleDisplay({
        remote: { display: false }
      });
  }, function() {
    it('should toggle remote segment display', function() {
      expect(this.gameSegmentModel.isDisplayed(this.context))
        .toEqual(true);
    });
  });

  context('setLocal(<start>, <end>, <state>)', function() {
    return this.gameSegmentModel
      .setLocal(this.start, this.end, this.segment);
  }, function() {
    beforeEach(function() {
      this.start = { x: 100, y: 0 };
      this.end = { x: 100, y: 100 };
      this.segment = { local: {}  };
    });

    it('should set local segment state', function() {
      expect(this.context)
        .toEqual({ local: { start: { x:100, y: 0},
                            end: { x: 100, y: 100 },
                            display: true
                          }
                 });
    });
  });

  context('setRemote(<start>, <end>, <state>)', function() {
    return this.gameSegmentModel
      .setRemote(this.start, this.end, this.segment);
  }, function() {
    beforeEach(function() {
      this.start = { x: 100, y: 0 };
      this.end = { x: 100, y: 100 };
      this.segment = { local: {},
                   remote: {}
                 };
    });

    it('should reset local segment state', function() {
      expect(this.context.local)
        .toEqual({ display: false });
    });

    it('should set remote segment state', function() {
      expect(R.pick(['start', 'end', 'display'], this.context.remote))
        .toEqual({ start: { x: 100, y: 0 },
                   end: { x: 100, y: 100 },
                   display: true
                 });
    });
  });

  context('resetRemote(<remote>, <state>)', function() {
    return this.gameSegmentModel
      .resetRemote(this.remote, this.segment);
  }, function() {
    beforeEach(function() {
      this.remote = { state: 'state' };
    });

    it('should reset remote state', function() {
      expect(R.pick(['state'], this.context.remote))
        .toEqual(this.remote);
      expect(this.context)
        .not.toBe(this.state);
    });
  });

  context('saveRemoteState', function() {
    return this.gameSegmentModel
      .saveRemoteState(this.segment);
  }, function() {
    beforeEach(function() {
      this.segment = {
        remote: { state: 'state' }
      };
    });

    it('should return a copy of remote state', function() {
      expect(this.context)
        .toEqual(this.segment.remote);
      expect(this.context)
        .not.toBe(this.segment.remote);
    });
  });
});
