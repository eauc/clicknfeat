describe('modelBaseMode model', function() {
  beforeEach(inject([
    'modelBaseMode',
    function(modelBaseModeModel) {
      this.modelBaseModeModel = modelBaseModeModel;

      this.gameModel = spyOnService('game');
      this.gameModelsModel = spyOnService('gameModels');
      this.gameModelSelectionModel = spyOnService('gameModelSelection');

      this.state = { game: { model_selection: 'selection',
                             models: 'models' },
                     ui_state: { flip_map: 'flip' },
                     factions: 'factions',
                     eventP: jasmine.createSpy('eventP'),
                     queueChangeEventP: jasmine.createSpy('queueChangeEventP')
                   };
      this.gameModelSelectionModel.get
        .and.returnValue(['stamp']);
    }
  ]));

  context('when user set model B2B', function() {
    return this.modelBaseModeModel.actions
      .setB2B(this.state, this.event);
  }, function() {
    beforeEach(function() {
      this.target = { state: { stamp: 'target' } };
      this.event = {
        'click#': { target: this.target }
      };

      this.gameModelsModel.findStampP.resolveWith({
        state: { stamp: 'stamp' }
      });
    });

    context('<target> is the selected model', function() {
      this.target.state.stamp = 'stamp';
    }, function() {
      it('should do nothing', function() {
        expect(this.state.eventP)
          .not.toHaveBeenCalled();
      });
    });

    context('<target> is not the selected model', function() {
      this.target.state.stamp = 'target';
    }, function() {
      it('should place selected model B2B with target', function() {
        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onModels', [
                                  'setB2BP',
                                  ['factions', this.target],
                                  ['stamp']
                                ]);
      });
    });
  });

  context('when user create AoE on model', function() {
    return this.modelBaseModeModel.actions
      .createAoEOnModel(this.state);
  }, function() {
    beforeEach(function() {
      this.gameModelsModel.findStampP.resolveWith({
        state: { x: 42, y: 71 }
      });
    });

    it('should create AoE centered on model', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameModelsModel.findStampP)
        .toHaveBeenCalledWith('stamp', 'models');

      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'createTemplate', [
                                { base: { x: 0, y: 0 },
                                  templates: [ { x: 42, y: 71, type: 'aoe' } ]
                                },
                                'flip'
                              ]);
    });
  });

  context('when user create spray on model', function() {
    return this.modelBaseModeModel.actions
      .createSprayOnModel(this.state);
  }, function() {
    beforeEach(function() {
      this.model = {
        state: { stamp: 'stamp', x: 42, y: 71 }
      };
      this.gameModelsModel.findStampP
        .resolveWith(this.model);

      this.sprayTemplateModeModel = spyOnService('sprayTemplateMode');
      spyOn(this.sprayTemplateModeModel.actions, 'setOriginModel');
      this.sprayTemplateModeModel.actions.setOriginModel
        .and.returnValue('sprayTemplateMode.setOriginModel.returnValue');
    });

    it('should create Spray centered on model', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameModelsModel.findStampP)
        .toHaveBeenCalledWith('stamp', 'models');

      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'createTemplate', [
                                { base: { x: 0, y: 0 },
                                  templates: [ { x: 42, y: 71, type: 'spray' } ]
                                },
                                'flip'
                              ]);
    });

    it('should set model as spray\'s origin', function() {
      expect(this.sprayTemplateModeModel.actions.setOriginModel)
        .toHaveBeenCalledWith(this.state,
                              { 'click#': { target: this.model } });

      expect(this.context)
        .toBe('sprayTemplateMode.setOriginModel.returnValue');
    });
  });

  context('when user open edit damage on model', function() {
    return this.modelBaseModeModel.actions
      .openEditDamage(this.state);
  }, function() {
    it('should emit toggleEditDamage event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.editDamage.toggle',
                              'gameModels.findStampP.returnValue');
    });
  });

  context('when user open edit label on model', function() {
    return this.modelBaseModeModel.actions
      .openEditLabel(this.state);
  }, function() {
    it('should emit openEditLabel event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.editLabel.open',
                              'gameModels.findStampP.returnValue');
    });
  });

  context('when user selects all friendly models', function() {
    return this.modelBaseModeModel.actions
      .selectAllFriendly(this.state);
  }, function() {
    beforeEach(function() {
      this.state.game.models = {
        active: [
          { state: { stamp: 'a1', user: 'user' } },
          { state: { stamp: 'a2', user: 'other' } },
          { state: { stamp: 'a3', user: 'user' } },
          { state: { stamp: 'a4', user: 'other' } },
        ],
        locked: [
          { state: { stamp: 'l1', user: 'user' } },
          { state: { stamp: 'l2', user: 'other' } },
          { state: { stamp: 'l3', user: 'user' } },
          { state: { stamp: 'l4', user: 'other' } },
        ]
      };
      this.gameModelSelectionModel.get
        .and.returnValue(['stamp1']);
      this.gameModelsModel.all
        .and.callThrough();
      this.gameModelsModel.findStampP.resolveWith({
        state: { user: 'user' }
      });
    });

    it('should fetch selected model', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameModelsModel.findStampP)
        .toHaveBeenCalledWith('stamp1', this.state.game.models);
    });

    it('should select all models with the same user', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setModelSelection', [
                                'set',
                                [ 'a1', 'a3', 'l1', 'l3' ]
                              ]);
    });
  });

  context('user select all unit', function() {
    return this.modelBaseModeModel.actions
      .selectAllUnit(this.state);
  }, function() {
    beforeEach(function() {
      this.state.game.models = {
        active: [
          { state: { stamp: 'a1', user: 'user', u: 42 } },
          { state: { stamp: 'a2', user: 'other', u: 42 } },
          { state: { stamp: 'a3', user: 'user', u: 0 } },
          { state: { stamp: 'a4', user: 'other', u: 0 } },
        ],
        locked: [
          { state: { stamp: 'l1', user: 'user', u: 42 } },
          { state: { stamp: 'l2', user: 'other', u: 42 } },
          { state: { stamp: 'l3', user: 'user', u: 0 } },
          { state: { stamp: 'l4', user: 'other', u: 0 } },
        ]
      };
      this.gameModelSelectionModel.get
        .and.returnValue(['stamp1']);
      this.gameModelsModel.all.and.callThrough();
      this.gameModelsModel.findStampP.resolveWith({
        state: { user: 'user', u: 42 }
      });
    });

    it('should fetch selected model', function() {
      expect(this.gameModelSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameModelsModel.findStampP)
        .toHaveBeenCalledWith('stamp1', this.state.game.models);
    });

    it('should select all models with the same user & unit number', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setModelSelection', [
                                'set',
                                ['a1', 'l1']
                              ]);
    });
  });
});
