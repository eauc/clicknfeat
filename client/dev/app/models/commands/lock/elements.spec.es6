describe('lockElementsCommand model', function() {
  beforeEach(inject([
    'lockElementsCommand',
    function(lockElementsCommandModel) {
      this.gameElementsModel = spyOnService('gameTerrains');

      this.lockElementsCommandModel =
        lockElementsCommandModel('type',
                                 this.gameElementsModel);
      this.game = { types: 'elements' };
    }
  ]));

  context('executeP(<lock>, <stamps>, <state>, <game>)', function() {
    return this.lockElementsCommandModel
      .executeP('lock', this.stamps, this.game);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamp1', 'stamp2'];
    });

    it('should apply <lock> on <stamps>', function() {
        expect(this.gameElementsModel.lockStamps)
          .toHaveBeenCalledWith('lock', this.stamps, 'elements');
        expect(this.context[1].types)
          .toBe('gameTerrains.lockStamps.returnValue');
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
      .replayP(this.ctxt, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        stamps: [ 'stamp1', 'stamp2' ],
        desc: 'lock'
      };
    });

    it('should apply <lock> on <stamps>', function() {
      expect(this.gameElementsModel.lockStamps)
        .toHaveBeenCalledWith('lock', this.ctxt.stamps, 'elements');
      expect(this.context.types)
        .toBe('gameTerrains.lockStamps.returnValue');
    });
  });

  context('undoP(<ctxt>, <state>, <game>)', function() {
    return this.lockElementsCommandModel
      .undoP(this.ctxt, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        stamps: [ 'stamp1', 'stamp2' ],
        desc: true
      };
    });

    it('should apply !<lock> on <stamps>', function() {
      expect(this.gameElementsModel.lockStamps)
        .toHaveBeenCalledWith(false, this.ctxt.stamps, 'elements');
      expect(this.context.types)
        .toBe('gameTerrains.lockStamps.returnValue');
    });
  });
});
