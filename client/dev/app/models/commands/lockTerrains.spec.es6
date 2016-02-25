describe('lockTerrainsCommand model', function() {
  beforeEach(inject([
    'lockTerrainsCommand',
    function(lockTerrainsCommandModel) {
      this.lockTerrainsCommandModel = lockTerrainsCommandModel;

      this.gameTerrainsModel = spyOnService('gameTerrains');

      this.state = jasmine.createSpyObj('state', [
        'queueChangeEventP'
      ]);
      this.game = { terrains: 'terrains' };
    }
  ]));

  context('executeP(<lock>, <stamps>, <state>, <game>)', function() {
    return this.lockTerrainsCommandModel
      .executeP('lock', this.stamps, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamp1', 'stamp2'];
    });

    context('lockStamps fails', function() {
      this.gameTerrainsModel.lockStampsP
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
        expect(this.gameTerrainsModel.lockStampsP)
          .toHaveBeenCalledWith('lock', this.stamps, 'terrains');
        expect(this.context[1].terrains)
          .toBe('gameTerrains.lockStampsP.returnValue');
    });

    it('should emit changeTerrain changeEvents', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.terrain.change.stamp1');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.terrain.change.stamp2');
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
    return this.lockTerrainsCommandModel
      .replayP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        stamps: [ 'stamp1', 'stamp2' ],
        desc: 'lock'
      };
    });

    context('lockStamps fails', function() {
      this.gameTerrainsModel.lockStampsP
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
      expect(this.gameTerrainsModel.lockStampsP)
        .toHaveBeenCalledWith('lock', this.ctxt.stamps, 'terrains');
      expect(this.context.terrains)
        .toBe('gameTerrains.lockStampsP.returnValue');
    });

    it('should emit changeTerrain changeEvents', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.terrain.change.stamp1');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.terrain.change.stamp2');
    });
  });

  context('undoP(<ctxt>, <state>, <game>)', function() {
    return this.lockTerrainsCommandModel
      .undoP(this.ctxt, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        stamps: [ 'stamp1', 'stamp2' ],
        desc: true
      };
    });

    context('lockStamps fails', function() {
      this.gameTerrainsModel.lockStampsP
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
      expect(this.gameTerrainsModel.lockStampsP)
        .toHaveBeenCalledWith(false, this.ctxt.stamps, 'terrains');
      expect(this.context.terrains)
        .toBe('gameTerrains.lockStampsP.returnValue');
    });

    it('should emit changeTerrain changeEvents', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.terrain.change.stamp1');
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.terrain.change.stamp2');
    });
  });
});
