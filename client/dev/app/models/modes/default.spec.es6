describe('defaultMode model', function() {
  beforeEach(inject([
    'defaultMode',
    function(defaultModeModel) {
      this.defaultModeModel = defaultModeModel;

      this.appActionService = spyOnService('appAction');
      this.appStateService = spyOnService('appState');
      this.gameModel = spyOnService('game');
      this.gameModelsModel = spyOnService('gameModels');
      this.gameModelSelectionModel = spyOnService('gameModelSelection');
      this.gameTerrainsModel = spyOnService('gameTerrains');
      this.gameTerrainSelectionModel = spyOnService('gameTerrainSelection');
      this.gameTerrainSelectionModel.isEmpty.and.returnValue(false);
      this.gameTemplateSelectionModel = spyOnService('gameTemplateSelection');
      this.gameTemplateSelectionModel.isEmpty.and.returnValue(false);

      this.state = { game: { terrains: 'terrains',
                             models: 'models',
                             model_selection: 'selection',
                             template_selection: 'template_selection',
                             terrain_selection: 'terrain_selection'
                           }
                   };
      this.event = { 'click#': { target: { state: { stamp: 'stamp' } } } };
    }
  ]));

  context('when user sets terrain selection', function() {
    return this.defaultModeModel.actions
      .selectTerrain(this.state, this.event);
  }, function() {
    it('should set gameTerrainSelection', function() {
      expect(this.gameTerrainSelectionModel.set)
        .toHaveBeenCalledWith('local', ['stamp'], 'terrain_selection');
      expect(this.context.game.terrain_selection)
        .toBe('gameTerrainSelection.set.returnValue');
    });

    it('should clear gameTemplateSelection', function() {
      expect(this.gameTemplateSelectionModel.clear)
        .toHaveBeenCalledWith('local', 'template_selection');
      expect(this.context.game.template_selection)
        .toBe('gameTemplateSelection.clear.returnValue');
    });
  });

  context('when user set template selection', function() {
    return this.defaultModeModel.actions
      .selectTemplate(this.state, this.event);
  }, function() {
    it('should set gameTemplateSelection', function() {
      expect(this.gameTemplateSelectionModel.set)
        .toHaveBeenCalledWith('local', ['stamp'], 'template_selection');
      expect(this.context.game.template_selection)
        .toBe('gameTemplateSelection.set.returnValue');
    });

    it('should clear gameTerrainSelection', function() {
      expect(this.gameTerrainSelectionModel.clear)
        .toHaveBeenCalledWith('local', 'terrain_selection');
      expect(this.context.game.terrain_selection)
        .toBe('gameTerrainSelection.clear.returnValue');
    });
  });

  context('when user right-click on template', function() {
    return this.defaultModeModel.actions
      .templateSelectionDetail(this.state, this.event);
  }, function() {
    it('should open template selection detail', function() {
      expect(this.context.view.detail)
        .toEqual({ type: 'template',
                   element: { state: { stamp: 'stamp' } } });
    });

    it('should set gameTemplateSelection', function() {
      expect(this.gameTemplateSelectionModel.set)
        .toHaveBeenCalledWith('local', ['stamp'], 'template_selection');
      expect(this.context.game.template_selection)
        .toBe('gameTemplateSelection.set.returnValue');
    });

    it('should clear gameTerrainSelection', function() {
      expect(this.gameTerrainSelectionModel.clear)
        .toHaveBeenCalledWith('local', 'terrain_selection');
      expect(this.context.game.terrain_selection)
        .toBe('gameTerrainSelection.clear.returnValue');
    });
  });

  context('when user set model selection', function() {
    return this.defaultModeModel.actions
      .setModelSelection(this.state, this.event);
  }, function() {
    it('should set gameModelSelection', function() {
      expect(this.appActionService.defer)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setModelSelection',
                              ['set', ['stamp']]);
    });

    it('should clear gameTemplateSelection', function() {
      expect(this.gameTemplateSelectionModel.clear)
        .toHaveBeenCalledWith('local', 'template_selection');
      expect(this.context.game.template_selection)
        .toBe('gameTemplateSelection.clear.returnValue');
    });

    it('should clear gameTerrainSelection', function() {
      expect(this.gameTerrainSelectionModel.clear)
        .toHaveBeenCalledWith('local', 'terrain_selection');
      expect(this.context.game.terrain_selection)
        .toBe('gameTerrainSelection.clear.returnValue');
    });
  });

  context('when user toggle model selection', function() {
    return this.defaultModeModel.actions
      .toggleModelSelection(this.state, this.event);
  }, function() {
    it('should check if the model is already in local selection', function() {
      expect(this.gameModelSelectionModel.in)
        .toHaveBeenCalledWith('local', 'stamp', 'selection');
    });

    context('when model is not in selection', function() {
      this.gameModelSelectionModel.in
        .and.returnValue(false);
    }, function() {
      it('should add model to selection', function() {
        expect(this.appActionService.defer)
          .toHaveBeenCalledWith('Game.command.execute',
                                'setModelSelection',
                                [ 'addTo', ['stamp'] ]);
      });
    });

    context('when model is already in selection', function() {
      this.gameModelSelectionModel.in
        .and.returnValue(true);
    }, function() {
      it('should remove model from selection', function() {
        expect(this.appActionService.defer)
          .toHaveBeenCalledWith('Game.command.execute',
                                'setModelSelection',
                                ['removeFrom', ['stamp']]);
      });
    });

    it('should clear gameTemplateSelection', function() {
      expect(this.gameTemplateSelectionModel.clear)
        .toHaveBeenCalledWith('local', 'template_selection');
      expect(this.context.game.template_selection)
        .toBe('gameTemplateSelection.clear.returnValue');
    });

    it('should clear gameTerrainSelection', function() {
      expect(this.gameTerrainSelectionModel.clear)
        .toHaveBeenCalledWith('local', 'terrain_selection');
      expect(this.context.game.terrain_selection)
        .toBe('gameTerrainSelection.clear.returnValue');
    });
  });

  context('when user starts dragging on map', function() {
    return this.defaultModeModel.actions
      .dragStartMap(this.state, { start: { x: 42, y: 71},
                                  now: { x: 34, y: 92 } });
  }, function() {
    it('should enable dragbox', function() {
      expect(this.context.view.drag_box)
        .toEqual({ top_left: { x: 34, y: 71 },
                   bottom_right: { x: 42, y: 92 } });
    });
  });

  context('when user drags on map', function() {
    return this.defaultModeModel.actions
      .dragMap(this.state, { start: { x: 42, y: 71},
                             now: { x: 34, y: 92 } });
  }, function() {
    it('should update dragbox', function() {
      expect(this.context.view.drag_box)
        .toEqual({ top_left: { x: 34, y: 71 },
                   bottom_right: { x: 42, y: 92 } });
    });
  });

  context('when user selects box', function() {
    return this.defaultModeModel.actions
      .dragEndMap(this.state, {
        start: { x: 180, y: 150 },
        now: { x: 240, y:120 }
      });
  }, function() {
    it('should disable dragbox', function() {
      expect(this.context.view.drag_box)
        .toEqual({});
    });

    it('should lookup models inside the dragbox', function() {
      expect(this.gameModelsModel.findStampsBetweenPoints)
        .toHaveBeenCalledWith({ x: 180, y: 120 },
                              { x: 240, y: 150 },
                              'models');
    });

    context('when there is no model in the dragbox', function() {
      this.gameModelsModel.findStampsBetweenPoints
        .and.returnValue([]);
    }, function() {
      it('should do nothing', function() {
        expect(this.appActionService.defer)
          .not.toHaveBeenCalled();
      });
    });

    context('when there are models in the dragbox', function() {
      this.gameModelsModel.findStampsBetweenPoints
        .and.returnValue(['stamp1', 'stamp2']);
    }, function() {
      it('should set selection to those models', function() {
        expect(this.appActionService.defer)
          .toHaveBeenCalledWith('Game.command.execute',
                                'setModelSelection',
                                [ 'set', [ 'stamp1', 'stamp2' ] ]);
      });
    });
  });

  context('when user right-click on model', function() {
    return this.defaultModeModel.actions
      .modelSelectionDetail(this.state, this.event);
  }, function() {
    it('should open model selection detail', function() {
        expect(this.context.view.detail)
        .toEqual({ type: 'model', element: { state: { stamp: 'stamp' } } });
    });

    it('should set gameModelSelection', function() {
      expect(this.appActionService.defer)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setModelSelection', ['set', ['stamp']]);
    });

    it('should clear gameTemplateSelection', function() {
      expect(this.gameTemplateSelectionModel.clear)
        .toHaveBeenCalledWith('local', 'template_selection');
      expect(this.context.game.template_selection)
        .toBe('gameTemplateSelection.clear.returnValue');
    });

    it('should clear gameTerrainSelection', function() {
      expect(this.gameTerrainSelectionModel.clear)
        .toHaveBeenCalledWith('local', 'terrain_selection');
      expect(this.context.game.terrain_selection)
        .toBe('gameTerrainSelection.clear.returnValue');
    });
  });

  xcontext('when user uses los', function() {
    return this.defaultModeModel
      .actions.enterLosMode(this.state);
  }, function() {
    it('should switch to los mode', function() {
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state ['Modes.switchTo', 'Los']);
    });
  });

  context('when user uses ruler', function() {
    return this.defaultModeModel
      .actions.enterRulerMode(this.state);
  }, function() {
    it('should switch to ruler mode', function() {
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, ['Modes.switchTo', 'Ruler']);
    });
  });
});
