describe('gameModels model', function() {
  beforeEach(inject([
    'gameModels',
    function(gameModelsModel) {
      this.gameModelsModel = gameModelsModel;

      this.modelModel = spyOnService('model');
    }
  ]));

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
