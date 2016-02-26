describe('lockElementsCommand model', function() {
  beforeEach(inject([
    'lockElementsCommand',
    function(lockElementsCommandModel) {
      this.gameElementsModel = spyOnService('gameTerrains');

      this.lockElementsCommandModel =
        lockElementsCommandModel('type',
                                 this.gameElementsModel);

      this.state = jasmine.createSpyObj('state', [
        'queueChangeEventP'
      ]);
      this.game = { types: 'elements' };
    }
  ]));

  context('executeP(<lock>, <stamps>, <state>, <game>)', function() {
    return this.lockElementsCommandModel
      .executeP('lock', this.stamps, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamp1', 'stamp2'];
    });

    context('lockStamps fails', function() {
      this.gameElementsModel.lockStampsP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    it('should apply <lock> on <stamps>', function() {
        expect(this.gameElementsModel.lockStampsP)
          .toHaveBeenCalledWith('lock', this.stamps, 'elements');
        expect(this.context[1].types)
          .toBe('gameTerrains.lockStampsP.returnValue');
    });

    it('should emit changeElement changeEvents', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.change.stamp1');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.change.stamp2');
    });

    it('should return context', function() {
      expect(this.context[0])
        .toEqual({
          stamps: this.stamps,
          desc: 'lock'
        });
    });
  });

  context('replayP(<ctxt>, <state>, <game>)', function() {
    return this.lockElementsCommandModel
      .replayP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        stamps: [ 'stamp1', 'stamp2' ],
        desc: 'lock'
      };
    });

    context('lockStamps fails', function() {
      this.gameElementsModel.lockStampsP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    it('should apply <lock> on <stamps>', function() {
      expect(this.gameElementsModel.lockStampsP)
        .toHaveBeenCalledWith('lock', this.ctxt.stamps, 'elements');
      expect(this.context.types)
        .toBe('gameTerrains.lockStampsP.returnValue');
    });

    it('should emit changeElement changeEvents', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.change.stamp1');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.change.stamp2');
    });
  });

  context('undoP(<ctxt>, <state>, <game>)', function() {
    return this.lockElementsCommandModel
      .undoP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        stamps: [ 'stamp1', 'stamp2' ],
        desc: true
      };
    });

    context('lockStamps fails', function() {
      this.gameElementsModel.lockStampsP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });

    it('should apply !<lock> on <stamps>', function() {
      expect(this.gameElementsModel.lockStampsP)
        .toHaveBeenCalledWith(false, this.ctxt.stamps, 'elements');
      expect(this.context.types)
        .toBe('gameTerrains.lockStampsP.returnValue');
    });

    it('should emit changeElement changeEvents', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.change.stamp1');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.change.stamp2');
    });
  });
});
