xdescribe('modelsMode model', function() {
  beforeEach(inject([
    'modelsMode',
    function(modelsModeModel) {
      this.modelsModeModel = modelsModeModel;

      this.gameModel = spyOnService('game');
      this.gameModelsModel = spyOnService('gameModels');
      this.gameModelSelectionModel = spyOnService('gameModelSelection');
      this.gameModelSelectionModel.get
        .and.returnValue(['stamp1','stamp2']);
      this.modelModel = spyOnService('model');

      this.state = { game: { models: 'models',
                             model_selection: 'selection' },
                     factions: 'factions',
                     eventP: jasmine.createSpy('eventP'),
                     queueChangeEventP: jasmine.createSpy('queueChangeEventP')
                   };
    }
  ]));

  context('when user toggles ctrl area display on models', function() {
    return this.modelsModeModel.actions
      .toggleCtrlAreaDisplay(this.state);
  }, function() {
    example(function(ee, dd) {
      context('when first selected model\'s ctrlAreaDisplay is '+ee.first, function() {
        this.modelModel.isCtrlAreaDisplayedP
          .and.returnValue(ee.first);
      }, function() {
        it('should toggle ctrlArea display on local selection, '+dd, function() {
          expect(this.gameModelSelectionModel.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsModel.findStampP)
            .toHaveBeenCalledWith('stamp1', 'models');

          expect(this.modelModel.isCtrlAreaDisplayedP)
            .toHaveBeenCalledWith('factions', 'gameModels.findStampP.returnValue');
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setCtrlAreaDisplay',
                                    [ee.set],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      ['first' , 'set' ],
      [ true   , false ],
      [ false  , true  ],
    ]);
  });

  example(function(e) {
    context('when user toggles '+e.area+'" area display on models', function() {
      return this.modelsModeModel
        .actions['toggle'+e.area+'InchesAreaDisplay'](this.state);
    }, function() {
      example(function(ee, dd) {
        context('when first selected model\'s areaDisplay is '+ee.first, function() {
          this.modelModel.areaDisplay
            .and.returnValue(ee.first);
        }, function() {
          it('should toggle '+e.area+' area display on local selection, '+dd, function() {
            expect(this.gameModelSelectionModel.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsModel.findStampP)
              .toHaveBeenCalledWith('stamp1', 'models');

            expect(this.modelModel.areaDisplay)
              .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
            expect(this.state.eventP)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [
                                      'setAreaDisplay',
                                      [ee.set],
                                      ['stamp1','stamp2']
                                    ]);
          });
        });
      }, [
        ['first' , 'set'  ],
        [ e.area , null   ],
        [ null   , e.area ],
      ]);
    });
  }, [
    [ 'area' ],
    [ 1      ],[ 2  ],[ 3  ],[ 4  ],[ 5  ],[ 6  ],[ 7  ],[ 8  ],[ 9  ],[ 10 ],
    [ 11     ],[ 12 ],[ 13 ],[ 14 ],[ 15 ],[ 16 ],[ 17 ],[ 18 ],[ 19 ],[ 20 ],
  ]);

  example(function(e) {
    context('when user toggles '+e.aura+' aura display on models', function() {
      return this.modelsModeModel
        .actions['toggle'+e.aura+'AuraDisplay'](this.state);
    }, function() {
      example(function(ee, dd) {
        context('when first selected model\'s auraDisplay is '+ee.first, function() {
          this.modelModel.auraDisplay
            .and.returnValue(ee.first);
        }, function() {
          it(`should toggle ${e.aura} aura display on local selection, `+dd, function() {
            expect(this.gameModelSelectionModel.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsModel.findStampP)
              .toHaveBeenCalledWith('stamp1', 'models');

            expect(this.modelModel.auraDisplay)
              .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
            expect(this.state.eventP)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [
                                      'setAuraDisplay',
                                      [ee.set],
                                      ['stamp1','stamp2']
                                    ]);
          });
        });
      }, [
        ['first' , 'set'  ],
        [ e.flag , null   ],
        [ null   , e.flag ],
      ]);
    });
  }, [
    [ 'aura'   , 'flag' ],
    [ 'Red'    , '#F00' ],
    [ 'Green'  , '#0F0' ],
    [ 'Blue'   , '#00F' ],
    [ 'Yellow' , '#FF0' ],
    [ 'Purple' , '#F0F' ],
    [ 'Cyan'   , '#0FF' ],
  ]);

  context('when user set charge max length', function() {
    return this.modelsModeModel.actions
      .setChargeMaxLength(this.state);
  }, function() {
    beforeEach(function() {
      this.modelModel.chargeMaxLength
        .and.returnValue(42);
      this.promptService.promptP.resolveWith(71);
    });

    it('should fetch first model\'s charge max length', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameModelsModel.findStampP)
        .toHaveBeenCalledWith('stamp1', 'models');
      expect(this.modelModel.chargeMaxLength)
        .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
    });

    it('should prompt user for max length', function() {
      expect(this.promptService.promptP)
        .toHaveBeenCalledWith('prompt',
                              'Set charge max length :',
                              42);
    });

    context('when user cancels prompt', function() {
      this.promptService.promptP
        .rejectWith('canceled');
    }, function() {
      it('should reset model\'s charge max length', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  'setChargeMaxLengthP',
                                  ['factions', null],
                                  ['stamp1','stamp2']
                                ]);
      });
    });

    example(function(e, d) {
      context('when user validates prompt, '+d, function() {
        this.promptService.promptP
          .resolveWith(e.value);
      }, function() {
        it('should set model\'s charge max length', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setChargeMaxLengthP',
                                    ['factions', e.max],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      [ 'value' , 'max' ],
      [ 42      , 42    ],
      [ 0       , null  ],
    ]);
  });

  context('when user copies selection', function() {
    return this.modelsModeModel.actions
      .copySelection(this.state);
  }, function() {
    it('should copy current selection', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameModelsModel.copyStampsP)
        .toHaveBeenCalledWith(['stamp1','stamp2'], 'models');
    });

    it('should enter createModel mode', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.model.copy',
                              'gameModels.copyStampsP.returnValue');
    });
  });

  context('when user deletes selection', function() {
    return this.modelsModeModel.actions
      .deleteSelection(this.state);
  }, function() {
    it('should execute deleteModelCommand', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'deleteModel',
                              [['stamp1','stamp2']]);
    });
  });

  example(function(e) {
    context('when user toggles '+e.type+' display on models', function() {
      return this.modelsModeModel
        .actions['toggle'+e.type+'Display'](this.state);
    }, function() {
      example(function(ee, dd) {
        context('first selected model\'s counterDisplayed is '+ee.first, function() {
          this.modelModel.isCounterDisplayed
            .and.returnValue(ee.first);
        }, function() {
          it('should toggle wreck display on local selection, '+dd, function() {
            expect(this.gameModelSelectionModel.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsModel.findStampP)
              .toHaveBeenCalledWith('stamp1', 'models');

            expect(this.modelModel.isCounterDisplayed)
              .toHaveBeenCalledWith(e.flag, 'gameModels.findStampP.returnValue');
            expect(this.state.eventP)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [
                                      'setCounterDisplay',
                                      [e.flag, ee.set],
                                      ['stamp1','stamp2']
                                    ]);
          });
        });
      }, [
        ['first' , 'set' ],
        [ true   , false ],
        [ false  , true  ],
      ]);
    });

    context('when user increments '+e.type+' on models', function() {
      return this.modelsModeModel
        .actions['increment'+e.type](this.state);
    }, function() {
      it('should increment counter on local selection', function() {
        expect(this.gameModelSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  'incrementCounter',
                                  [e.flag],
                                  ['stamp1','stamp2']
                                ]);
      });
    });

    context('when user decrements '+e.type+' on models', function() {
      return this.modelsModeModel
        .actions['decrement'+e.type](this.state);
    }, function() {
      it('should decrement '+e.type+' on local selection', function() {
        expect(this.gameModelSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  'decrementCounter',
                                  [e.flag],
                                  ['stamp1','stamp2']
                                ]);
      });
    });
  }, [
    [ 'type'    , 'flag' ],
    [ 'Counter' , 'c'    ],
    [ 'Souls'   , 's'    ],
  ]);

  describe('drag', function() {
    beforeEach(function() {
      this.modelModel.saveState.and.callThrough();
      this.modelModel.eventName.and.callThrough();

      this.state = {
        game: { model_selection: 'selection',
                models: [ { state: { stamp: 'stamp1', x: 240, y: 240, r: 180 } },
                          { state: { stamp: 'stamp2', x: 200, y: 300, r:  90 } } ]
              },
        modes: 'modes',
        factions: 'factions',
        queueChangeEventP: jasmine.createSpy('queueChangeEventP'),
        eventP: jasmine.createSpy('eventP')
      };

      this.gameModelSelectionModel.in
        .and.returnValue(true);
      this.gameModelsModel.findAnyStampsP.resolveWith((ss, ms) => {
        return R.map(function(s) {
          return R.find(R.pathEq(['state','stamp'], s), ms);
        }, ss);
      });

      this.modelModel.setPositionP.resolveWith((_f_, _t_, _p_, m) => {
        return m;
      });
      spyReturnPromise(this.modelModel.setPosition_);
      this.modelModel.setPosition_.resolveWith((_f_, _t_, _p_, m) => {
        return m;
      });
    });

    context('when user starts dragging model', function() {
      return this.modelsModeModel.actions
        .dragStartModel(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };
      });

      context('when target model is not in current selection', function() {
        this.gameModelSelectionModel.in
          .and.returnValue(false);
      }, function() {
        it('should set current selection', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'setModelSelection',
                                  ['set', ['stamp']]);
        });
      });

      it('should get local model selection', function() {
        expect(this.gameModelSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsModel.findAnyStampsP)
          .toHaveBeenCalledWith(['stamp1', 'stamp2'], this.state.game.models);
      });

      context('when current selection is not found', function() {
        this.gameModelsModel.findAnyStampsP
          .rejectWith('reason');
        this.expectContextError();
      }, function() {
        it('should reject drag', function() {
          expect(this.contextError).toEqual([
            'reason'
          ]);
          expect(this.modelModel.setPositionP)
            .not.toHaveBeenCalled();
          expect(this.state.queueChangeEventP)
            .not.toHaveBeenCalled();
        });
      });

      context('when selection is a single model', function() {
        this.gameModelSelectionModel.get
          .and.returnValue(['stamp1']);
      }, function() {
        it('should get charge target', function() {
          expect(this.modelModel.chargeTargetP)
            .toHaveBeenCalledWith(this.state.game.models[0]);
        });

        context('when no charge target is set', function() {
          this.modelModel.chargeTargetP
            .rejectWith('reason');
        }, function() {
          it('should update selection positions without target', function() {
            expect(this.gameModelsModel.findStampP)
              .not.toHaveBeenCalled();
            expect(this.modelModel.setPosition_)
              .toHaveBeenCalledWith('factions',
                                    null,
                                    { x: 250, y: 241 },
                                    this.state.game.models[0]);
          });
        });

        it('should update selection positions with target', function() {
          expect(this.gameModelsModel.findStampP)
            .toHaveBeenCalledWith('model.chargeTargetP.returnValue',
                                  this.state.game.models);
          expect(this.modelModel.setPosition_)
            .toHaveBeenCalledWith('factions',
                                  'gameModels.findStampP.returnValue',
                                  { x: 250, y: 241 },
                                  this.state.game.models[0]);
        });
      });

      it('should update selection positions', function() {
        expect(this.modelModel.setPosition_)
          .toHaveBeenCalledWith('factions',
                                null,
                                { x: 250, y: 241 },
                                this.state.game.models[0]);
        expect(this.modelModel.setPosition_)
          .toHaveBeenCalledWith('factions',
                                null,
                                { x: 210, y: 301 },
                                this.state.game.models[1]);
      });

      context('when update selection positions fails', function() {
        this.modelModel.setPosition_
          .rejectWith('reason');
        this.expectContextError();
      }, function() {
        it('should reject drag', function() {
          expect(this.contextError).toEqual([
            'reason'
          ]);
          expect(this.state.queueChangeEventP)
            .not.toHaveBeenCalled();
        });
      });

      it('should emit changeModel event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp2');
      });
    });

    context('when user drags model', function() {
      return this.modelsModeModel.actions
        .dragModel(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };
        return this.modelsModeModel.actions
          .dragStartModel(this.state, this.event)
          .then(() => {
            this.modelModel.setPosition_.calls.reset();
            this.state.queueChangeEventP.calls.reset();

            this.event = {
              target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
              start: { x: 200, y: 200 },
              now: { x: 230, y: 190 }
            };
          });
      });

      it('should update target position', function() {
        expect(this.modelModel.setPosition_)
          .toHaveBeenCalledWith('factions',
                                null,
                                { x: 270, y: 230 },
                                this.state.game.models[0]);
        expect(this.modelModel.setPosition_)
          .toHaveBeenCalledWith('factions',
                                null,
                                { x: 230, y: 290 },
                                this.state.game.models[1]);
      });

      context('when update selection positions fails', function() {
        this.modelModel.setPosition_
          .rejectWith('reason');
        this.expectContextError();
      }, function() {
        it('should reject drag', function() {
          expect(this.contextError).toEqual([
            'reason'
          ]);
          expect(this.state.queueChangeEventP)
            .not.toHaveBeenCalled();
        });
      });

      it('should emit changeModel event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp1');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.model.change.stamp2');
      });
    });

    context('when user ends draging model', function() {
      return this.modelsModeModel.actions
        .dragEndModel(this.state, this.event);
    }, function() {
      beforeEach(function() {
        this.event = {
          target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
          start: { x: 200, y: 200 },
          now: { x: 210, y: 201 }
        };
        return this.modelsModeModel.actions
          .dragStartModel(this.state, this.event)
          .then(() => {
            this.state.queueChangeEventP.calls.reset();
            this.modelModel.setPosition_.calls.reset();

            this.event = {
              target: { state: { stamp: 'stamp', x: 240, y: 240, r:180 } },
              start: { x: 200, y: 200 },
              now: { x: 230, y: 190 }
            };
          });
      });

      it('should restore dragStart model position', function() {
        expect(this.modelModel.setPosition_)
          .toHaveBeenCalledWith('factions',
                                null,
                                { stamp: 'stamp1', x: 240, y: 240, r: 180 },
                                this.state.game.models[0]);
        expect(this.modelModel.setPosition_)
          .toHaveBeenCalledWith('factions',
                                null,
                                { stamp: 'stamp2', x: 200, y: 300, r:  90 },
                                this.state.game.models[1]);
      });

      context('when update selection positions fails', function() {
        this.modelModel.setPosition_
          .rejectWith('reason');
        this.expectContextError();
      }, function() {
        it('should reject drag', function() {
          expect(this.contextError).toEqual([
            'reason'
          ]);
          expect(this.state.eventP)
            .not.toHaveBeenCalled();
        });
      });

      it('should execute onModels/shiftPosition command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  'shiftPositionP',
                                  ['factions', null, { x: 30, y: -10 }],
                                  ['stamp1','stamp2']
                                ]);
      });
    });
  });

  context('when user toggles leader display on models', function() {
    return this.modelsModeModel.actions
      .toggleLeaderDisplay(this.state);
  }, function() {
    example(function(e, d) {
      context('when first selected model\'s leaderDisplayed is '+e.first, function() {
        this.modelModel.isLeaderDisplayed
          .and.returnValue(e.first);
      }, function() {
        it('should toggle leader display on local selection, '+d, function() {
          expect(this.gameModelSelectionModel.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsModel.findStampP)
            .toHaveBeenCalledWith('stamp1', 'models');

          expect(this.modelModel.isLeaderDisplayed)
            .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setLeaderDisplay',
                                    [e.set],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      ['first' , 'set' ],
      [ true   , false ],
      [ false  , true  ],
    ]);
  });

  context('when user toggles incorporeal display on models', function() {
    return this.modelsModeModel.actions
      .toggleIncorporealDisplay(this.state);
  }, function() {
    example(function(e, d) {
      context('when first selected model\'s incorporealDisplayed is '+e.first, function() {
        this.modelModel.isIncorporealDisplayed
          .and.returnValue(e.first);
      }, function() {
        it('should toggle incorporeal display on local selection, '+d, function() {
          expect(this.gameModelSelectionModel.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsModel.findStampP)
            .toHaveBeenCalledWith('stamp1', 'models');

          expect(this.modelModel.isIncorporealDisplayed)
            .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setIncorporealDisplay',
                                    [e.set],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      ['first' , 'set' ],
      [ true   , false ],
      [ false  , true  ],
    ]);
  });

  example(function(e) {
    context('when user toggles '+e.effect+' display on models', function() {
      return this.modelsModeModel
        .actions['toggle'+e.effect+'EffectDisplay'](this.state);
    }, function() {
      example(function(ee, dd) {
        context('when first selected model\'s '+e.effect+'EffectDisplayed is '+ee.first, function() {
          this.modelModel.isEffectDisplayed
            .and.returnValue(ee.first);
        }, function() {
          it('should toggle '+e.effect+' display on local selection, '+dd, function() {
            expect(this.gameModelSelectionModel.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsModel.findStampP)
              .toHaveBeenCalledWith('stamp1', 'models');

            expect(this.modelModel.isEffectDisplayed)
              .toHaveBeenCalledWith(e.flag, 'gameModels.findStampP.returnValue');
            expect(this.state.eventP)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [
                                      'setEffectDisplay',
                                      [e.flag, ee.set],
                                      ['stamp1','stamp2']
                                    ]);
          });
        });
      }, [
        ['first' , 'set' ],
        [ true   , false ],
        [ false  , true  ],
      ]);
    });
  }, [
    [ 'effect'     , 'flag' ],
    [ 'Blind'      , 'b'    ],
    [ 'Corrosion'  , 'c'    ],
    [ 'Disrupt'    , 'd'    ],
    [ 'Fire'       , 'f'    ],
    [ 'Fleeing'    , 'e'    ],
    [ 'KD'         , 'k'    ],
    [ 'Stationary' , 't'    ],
  ]);

  context('when user toggles image display on models', function() {
    return this.modelsModeModel.actions
      .toggleImageDisplay(this.state);
  }, function() {
    example(function(e, d) {
      context('when first selected model\'s imageDisplayed is '+e.first, function() {
        this.modelModel.isImageDisplayed
          .and.returnValue(e.first);
      }, function() {
        it('should toggle image display on local selection, '+d, function() {
          expect(this.gameModelSelectionModel.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsModel.findStampP)
            .toHaveBeenCalledWith('stamp1', 'models');
          expect(this.modelModel.isImageDisplayed)
            .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [ 'setImageDisplay',
                                                [e.set],
                                                ['stamp1','stamp2']
                                              ]);
        });
      });
    }, [
      ['first' , 'set' ],
      [ true   , false ],
      [ false  , true  ],
    ]);
  });

  context('when user sets next image on models', function() {
    return this.modelsModeModel.actions
      .setNextImage(this.state);
  }, function() {
    it('should set next image on local selection', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'onModels', [
                                'setNextImageP',
                                ['factions'],
                                ['stamp1','stamp2']
                              ]);
    });
  });

  context('when user toggles wreck display on models', function() {
    return this.modelsModeModel.actions
      .toggleWreckDisplay(this.state);
  }, function() {
    example(function(e, d) {
      context('when first selected model\'s wreckDisplayed is '+e.first, function() {
        this.modelModel.isWreckDisplayed
          .and.returnValue(e.first);
      }, function() {
        it('should toggle wreck display on local selection, '+d, function() {
          expect(this.gameModelSelectionModel.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsModel.findStampP)
            .toHaveBeenCalledWith('stamp1', 'models');
          expect(this.modelModel.isWreckDisplayed)
            .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setWreckDisplay',
                                    [e.set],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      ['first' , 'set' ],
      [ true   , false ],
      [ false  , true  ],
    ]);
  });

  context('when user clear models labels', function() {
    return this.modelsModeModel.actions
      .clearLabel(this.state);
  }, function() {
    it('should clear models labels', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');

      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'onModels', [
                                'clearLabel',
                                [],
                                ['stamp1','stamp2']
                              ]);
    });
  });

  context('when user toggles lock on models', function() {
    return this.modelsModeModel.actions
      .toggleLock(this.state);
  }, function() {
    example(function(e, d) {
      context('when first selected model\'s isLocked === '+e.first, function() {
        this.modelModel.isLocked
          .and.returnValue(e.first);
      }, function() {
        it('should toggle lock on local selection, '+d, function() {
          expect(this.gameModelSelectionModel.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsModel.findStampP)
            .toHaveBeenCalledWith('stamp1', 'models');

          expect(this.modelModel.isLocked)
            .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'lockModels', [
                                    e.set,
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      ['first' , 'set' ],
      [ true   , false ],
      [ false  , true  ],
    ]);
  });

  example(function(e, d) {
    context('when user toggles melee display on models, '+d, function() {
      return this.modelsModeModel
        .actions['toggle'+e.melee+'Display'](this.state);
    }, function() {
      example(function(ee, dd) {
        context('when first selected model\'s meleeDisplay is '+ee.first, function() {
          this.modelModel.isMeleeDisplayed
            .and.returnValue(ee.first);
        }, function() {
          it('should toggle '+e.melee+' melee display on local selection, '+dd, function() {
            expect(this.gameModelSelectionModel.get)
              .toHaveBeenCalledWith('local', 'selection');
            expect(this.gameModelsModel.findStampP)
              .toHaveBeenCalledWith('stamp1', 'models');
            expect(this.modelModel.isMeleeDisplayed)
              .toHaveBeenCalledWith(e.flag, 'gameModels.findStampP.returnValue');
            expect(this.state.eventP)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'onModels', [
                                      'setMeleeDisplay',
                                      [e.flag, ee.set],
                                      ['stamp1','stamp2']
                                    ]);
          });
        });
      }, [
        ['first' , 'set' ],
        [ true   , false ],
        [ false  , true  ],
      ]);
    });
  }, [
    [ 'melee'  , 'flag' ],
    [ 'Melee'  , 'mm'   ],
    [ 'Reach'  , 'mr'   ],
    [ 'Strike' , 'ms'   ],
  ]);

  example(function(e) {
    context('when user '+e.action+' model selection', function() {
      return this.modelsModeModel
        .actions[e.action](this.state);
    }, function() {
      it('should get current selection', function() {
        expect(this.gameModelSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onModels/'+e.action+' command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  e.action+'P',
                                  ['factions', false],
                                  ['stamp1','stamp2']
                                ]);
      });
    });

    context('when user '+e.action+'Small model selection', function() {
      return this.modelsModeModel
        .actions[e.action+'Small'](this.state);
    }, function() {
      it('should get current selection', function() {
        expect(this.gameModelSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onModels/'+e.action+'Small command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  e.action+'P',
                                  ['factions', true],
                                  ['stamp1','stamp2']
                                ]);
      });
    });
  }, [
    [ 'action'      ],
    [ 'moveFront'   ],
    [ 'moveBack'    ],
    [ 'rotateLeft'  ],
    [ 'rotateRight' ],
  ]);

  example(function(e) {
    context('when user '+e.action+' model selection', function() {
      return this.modelsModeModel
        .actions[e.action](this.state);
    }, function() {
      it('should get current selection', function() {
        expect(this.gameModelSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onModels/'+e.action+' command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  e.action+'P',
                                  ['factions', false],
                                  ['stamp1','stamp2']
                                ]);
      });

      context('map is flipped', function() {
        this.state.ui_state = { flip_map: true };
      }, function() {
        it('should execute onModels/'+e.flipped_action+' command', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    e.flipped_action+'P',
                                    ['factions', false],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    });

    context('when user '+e.action+'Small model selection', function() {
      return this.modelsModeModel
        .actions[e.action+'Small'](this.state);
    }, function() {
      it('should get current selection', function() {
        expect(this.gameModelSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onModels/'+e.action+'Small command', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  e.action+'P',
                                  ['factions', true],
                                  ['stamp1','stamp2']
                                ]);
      });

      context('map is flipped', function() {
        this.state.ui_state = { flip_map: true };
      }, function() {
        it('should execute onModels/'+e.flipped_action+'Small command', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    e.flipped_action+'P',
                                    [ 'factions', true],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    });
  }, [
    [ 'action'     , 'flipped_action' ],
    [ 'shiftUp'    , 'shiftDown'      ],
    [ 'shiftDown'  , 'shiftUp'        ],
    [ 'shiftLeft'  , 'shiftRight'     ],
    [ 'shiftRight' , 'shiftLeft'      ],
  ]);

  example(function(e) {
    context('when user '+e.action+' on model selection', function() {
      return this.modelsModeModel
        .actions[e.action](this.state);
    }, function() {
      beforeEach(function() {
        this.state.ui_state = { flip_map: false };
      });

      it('should get current selection', function() {
        expect(this.gameModelSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      context('when map is '+(e.flipped?'':'not ')+'flipped', function() {
        this.state.ui_state = { flip_map: e.flipped };
      }, function() {
        it('should execute onModels/setOrientation command', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setOrientationP',
                                    ['factions', e.dir],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    });
  }, [
    [ 'action'             , 'flipped' , 'dir' ],
    [ 'setOrientationUp'   , false     , 0     ],
    [ 'setOrientationUp'   , true      , 180   ],
    [ 'setOrientationDown' , false     , 180   ],
    [ 'setOrientationDown' , true      , 0     ],
  ]);

  context('when user set target model, ', function() {
    return this.modelsModeModel.actions
      .setTargetModel(this.state, this.event);
  }, function() {
    beforeEach(function() {
      this.target = { state: { stamp: 'target' } };
      this.event = { 'click#': { target: this.target } };
    });

    it('should orient model selection to target model', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');

      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'onModels', [
                                'orientToP',
                                [ 'factions', this.target],
                                ['stamp1','stamp2']
                              ]);
    });
  });

  context('when user set place max length', function() {
    return this.modelsModeModel.actions
      .setPlaceMaxLength(this.state);
  }, function() {
    beforeEach(function() {
      this.modelModel.placeMaxLength
        .and.returnValue(42);
    });

    it('should fetch first model\'s place max length', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameModelsModel.findStampP)
        .toHaveBeenCalledWith('stamp1', 'models');
      expect(this.modelModel.placeMaxLength)
        .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
    });

    it('should prompt user for max length', function() {
      expect(this.promptService.promptP)
        .toHaveBeenCalledWith('prompt',
                              'Set place max length :',
                              42);
    });

    context('when user cancel prompt', function() {
      this.promptService.promptP
        .rejectWith('canceled');
    }, function() {
      it('should reset model\'s place max length', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  'setPlaceMaxLengthP',
                                  ['factions', null],
                                  ['stamp1','stamp2']
                                ]);
      });
    });

    example(function(e, d) {
      context('when user validates prompt, '+d, function() {
        this.promptService.promptP
          .resolveWith(e.value);
      }, function() {
        it('should set model\'s place max length', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setPlaceMaxLengthP',
                                    ['factions', e.max],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      [ 'value' , 'max' ],
      [ 42      , 42    ],
      [ 0       , null  ],
    ]);
  });

  context('when user toggles placeWithin on models', function() {
    return this.modelsModeModel.actions
      .togglePlaceWithin(this.state);
  }, function() {
    example(function(e, d) {
      context('when first selected model\'s placeWithin is '+e.first, function() {
        this.modelModel.placeWithin
          .and.returnValue(e.first);
      }, function() {
        it('should toggle placeWithin on local selection, '+d, function() {
          expect(this.gameModelSelectionModel.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsModel.findStampP)
            .toHaveBeenCalledWith('stamp1', 'models');
          expect(this.modelModel.placeWithin)
            .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setPlaceWithinP',
                                    ['factions', e.set],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      ['first' , 'set' ],
      [ true   , false ],
      [ false  , true  ],
    ]);
  });

  context('when user sets ruler max length', function() {
    return this.modelsModeModel.actions
      .setRulerMaxLength(this.state);
  }, function() {
    beforeEach(function() {
      this.modelModel.rulerMaxLength
        .and.returnValue(42);
      this.promptService.promptP
        .resolveWith(71);
    });

    it('should fetch first model\'s ruler max length', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameModelsModel.findStampP)
        .toHaveBeenCalledWith('stamp1', 'models');
      expect(this.modelModel.rulerMaxLength)
        .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
    });

    it('should prompt user for max length', function() {
        expect(this.promptService.promptP)
          .toHaveBeenCalledWith('prompt',
                                'Set ruler max length :',
                                42);
    });

    example(function(e, d) {
      context('when user validates prompt, '+d, function() {
        this.promptService.promptP
          .resolveWith(e.value);
      }, function() {
        it('should set model\'s ruler max length', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setRulerMaxLength',
                                    [e.max],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      [ 'value' , 'max' ],
      [ 42      , 42    ],
      [ 0       , null  ],
    ]);

    context('when user cancels prompt', function() {
      this.promptService.promptP
        .rejectWith('canceled');
    }, function() {
      it('should set model\'s ruler max length', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  'setRulerMaxLength',
                                  [null],
                                  ['stamp1','stamp2']
                                ]);
      });
    });
  });

  example(function(e) {
    context('when user '+e.action, function() {
      return this.modelsModeModel
        .actions[e.action](this.state, 'event');
    }, function() {
      it('should close edit OSDs', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.selectionDetail.close');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.editDamage.close');
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.editLabel.close');
      });
      it('should clear local model selection', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'setModelSelection',
                                ['clear', null]);
      });
    });
  }, [
    [ 'action'        ],
    [ 'clickMap'      ],
    [ 'rightClickMap' ],
  ]);

  context('when user toggles unit display on models', function() {
    return this.modelsModeModel.actions
      .toggleUnitDisplay(this.state);
  }, function() {
    example(function(e, d) {
      context('when first selected model\'s unitDisplayed is '+e.first, function() {
        this.modelModel.isUnitDisplayed
          .and.returnValue(e.first);
      }, function() {
        it('should toggle unit display on local selection, '+d, function() {
          expect(this.gameModelSelectionModel.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameModelsModel.findStampP)
            .toHaveBeenCalledWith('stamp1', 'models');
          expect(this.modelModel.isUnitDisplayed)
            .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setUnitDisplay',
                                    [e.set],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      ['first' , 'set' ],
      [ true   , false ],
      [ false  , true  ],
    ]);
  });

  context('when user set unit number', function() {
    return this.modelsModeModel.actions
      .setUnit(this.state);
  }, function() {
    beforeEach(function() {
      this.modelModel.unit.and.returnValue(42);
      this.promptService.promptP.resolveWith(71);
    });

    it('should fetch first model\'s unit number', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameModelsModel.findStampP)
        .toHaveBeenCalledWith('stamp1', 'models');
      expect(this.modelModel.unit)
        .toHaveBeenCalledWith('gameModels.findStampP.returnValue');
    });

    it('should prompt user for unit number', function() {
      expect(this.promptService.promptP)
        .toHaveBeenCalledWith('prompt',
                              'Set unit number :',
                              42);
    });

    example(function(e, d) {
      context('when user validates prompt, '+d, function() {
        this.promptService.promptP.resolveWith(e.value);
      }, function() {
        it('should set model\'s unit number', function() {
          expect(this.state.eventP)
            .toHaveBeenCalledWith('Game.command.execute',
                                  'onModels', [
                                    'setUnit',
                                    [e.unit],
                                    ['stamp1','stamp2']
                                  ]);
        });
      });
    }, [
      [ 'value' , 'unit' ],
      [ 42      , 42     ],
      [ 0       , 0      ],
    ]);

    context('when user cancel prompt', function() {
      this.promptService.promptP.rejectWith('canceled');
    }, function() {
      it('should reset model\'s unit', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  'setUnit',
                                  [null],
                                  ['stamp1','stamp2']
                                ]);
      });
    });
  });
});
