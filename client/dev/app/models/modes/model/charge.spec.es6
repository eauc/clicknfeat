xdescribe('modelChargeMode model', function() {
  beforeEach(inject([
    'modelChargeMode',
    function(modelChargeModeModel) {
      this.modelChargeModeModel = modelChargeModeModel;

      this.modesModel = spyOnService('modes');
      this.modelModel = spyOnService('model');
      this.gameModelsModel = spyOnService('gameModels');
      this.gameModelSelectionModel = spyOnService('gameModelSelection');
      this.modelsModeModel = spyOnService('modelsMode');
      this.gameModelSelectionModel.get
        .and.returnValue(['stamp']);

      this.state = { game: { model_selection: 'selection',
                             models: 'models'
                           },
                     factions: 'factions',
                     modes: 'modes',
                     eventP: jasmine.createSpy('eventP')
                   };
    }
  ]));

  context('when user ends charge on model', function() {
    return this.modelChargeModeModel.actions
      .endCharge(this.state);
  }, function() {
    it('should end charge for model', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'onModels', [
                                'endCharge',
                                [],
                                ['stamp']
                              ]);
    });

    it('should switch to Model mode', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Modes.switchTo','Model');
    });
  });

  context('when user sets target model', function() {
    return this.modelChargeModeModel.actions
      .setTargetModel(this.state, this.event);
  }, function() {
    beforeEach(function() {
      this.gameModelsModel.findStampP
        .resolveWith({
          state: { stamp: 'stamp' }
        });
      this.event = { 'click#': { target: { state: { stamp: 'target' } } } };
    });

    context('when target is the same as selection', function() {
      this.event['click#'].target.state.stamp = 'stamp';
    }, function() {
      it('should do nothing', function() {
        expect(this.state.eventP)
          .not.toHaveBeenCalled();
      });
    });

    context('when target is another model', function() {
    }, function() {
      it('should set charge target for model', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  'setChargeTargetP',
                                  [this.state.factions, this.event['click#'].target],
                                  ['stamp']
                                ]);
      });
    });
  });

  example(function(e, d) {
    context('when user '+e.action+' on model, '+d, function() {
      return this.modelChargeModeModel
        .actions[e.action](this.state);
    }, function() {
      beforeEach(function() {
        this.state.ui_state = { flip_map: e.flipped };
      });

      it('should fetch charging model', function() {
        expect(this.gameModelsModel.findStampP)
          .toHaveBeenCalledWith('stamp', 'models');
      });

      it('should get current charge target', function() {
        expect(this.modelModel.chargeTargetP)
          .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
      });

      context('when current target is not set', function() {
        this.modelModel.chargeTargetP
          .rejectWith('reason');
      }, function() {
        it('should execute move without target', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    e.move+'ChargeP',
                                    ['factions', null, e.small],
                                    ['stamp']
                                  ]);
        });
      });

      it('should fetch charge target model', function() {
          expect(this.gameModelsModel.findStampP)
          .toHaveBeenCalledWith('model.chargeTargetP.returnValue', 'models');
      });

      it('should charge-move model with defined target', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  e.move+'ChargeP',
                                  ['factions',
                                   'gameModels.findStampP.returnValue',
                                   e.small],
                                  ['stamp']
                                ]);
      });
    });
  }, [
    ['action'          , 'flipped' , 'move'       , 'small'],
    ['moveFront'       , false     , 'moveFront'  , false  ],
    ['moveFront'       , true      , 'moveFront'  , false  ],
    ['moveFrontSmall'  , false     , 'moveFront'  , true   ],
    ['moveFrontSmall'  , true      , 'moveFront'  , true   ],
    ['moveBack'        , false     , 'moveBack'   , false  ],
    ['moveBack'        , true      , 'moveBack'   , false  ],
    ['moveBackSmall'   , false     , 'moveBack'   , true   ],
    ['moveBackSmall'   , true      , 'moveBack'   , true   ],
    ['rotateLeft'      , false     , 'rotateLeft' , false  ],
    ['rotateLeft'      , true      , 'rotateLeft' , false  ],
    ['rotateLeftSmall' , false     , 'rotateLeft' , true   ],
    ['rotateLeftSmall' , true      , 'rotateLeft' , true   ],
    ['rotateRight'     , false     , 'rotateRight', false  ],
    ['rotateRight'     , true      , 'rotateRight', false  ],
    ['rotateRightSmall', false     , 'rotateRight', true   ],
    ['rotateRightSmall', true      , 'rotateRight', true   ],
    ['shiftDown'       , false     , 'shiftDown'  , false  ],
    ['shiftDown'       , true      , 'shiftUp'    , false  ],
    ['shiftDownSmall'  , false     , 'shiftDown'  , true   ],
    ['shiftDownSmall'  , true      , 'shiftUp'    , true   ],
    ['shiftLeft'       , false     , 'shiftLeft'  , false  ],
    ['shiftLeft'       , true      , 'shiftRight' , false  ],
    ['shiftLeftSmall'  , false     , 'shiftLeft'  , true   ],
    ['shiftLeftSmall'  , true      , 'shiftRight' , true   ],
    ['shiftRight'      , false     , 'shiftRight' , false  ],
    ['shiftRight'      , true      , 'shiftLeft'  , false  ],
    ['shiftRightSmall' , false     , 'shiftRight' , true   ],
    ['shiftRightSmall' , true      , 'shiftLeft'  , true   ],
  ]);
});
