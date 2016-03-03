describe('defaultMode model', function() {
  beforeEach(inject([
    'defaultMode',
    function(defaultModeModel) {
      this.defaultModeModel = defaultModeModel;

      this.gameModel = spyOnService('game');
      this.gameTerrainsModel = spyOnService('gameTerrains');
      this.gameTerrainSelectionModel = spyOnService('gameTerrainSelection');
      this.gameTemplateSelectionModel = spyOnService('gameTemplateSelection');

      this.state = { game: { terrains: 'terrains',
                             model_selection: 'selection',
                             template_selection: 'template_selection',
                             terrain_selection: 'terrain_selection'
                           },
                     queueChangeEventP: jasmine.createSpy('queueChangeEventP'),
                     eventP: jasmine.createSpy('eventP')
                   };
      this.state.eventP.and.callFake((e,l,u) => {
        if('Game.update' === e) {
          this.state.game = R.over(l,u, this.state.game);
        }
        return 'state.event.returnValue';
      });
      this.event = { 'click#': { target: { state: { stamp: 'stamp' } } } };
    }
  ]));

  context('when user sets terrain selection', function() {
    return this.defaultModeModel.actions
      .selectTerrain(this.state, this.event);
  }, function() {
    it('should set gameTerrainSelection', function() {
      expect(this.gameTerrainSelectionModel.set)
        .toHaveBeenCalledWith('local', ['stamp'],
                              this.state, 'terrain_selection');
      expect(this.state.game.terrain_selection)
        .toBe('gameTerrainSelection.set.returnValue');
    });

    it('should clear gameTemplateSelection', function() {
      expect(this.gameTemplateSelectionModel.clear)
        .toHaveBeenCalledWith('local', this.state, 'template_selection');
      expect(this.state.game.template_selection)
        .toBe('gameTemplateSelection.clear.returnValue');
    });
  });

  context('when user set template selection', function() {
    return this.defaultModeModel.actions
      .selectTemplate(this.state, this.event);
  }, function() {
    it('should set gameTemplateSelection', function() {
      expect(this.gameTemplateSelectionModel.set)
        .toHaveBeenCalledWith('local', ['stamp'], this.state, 'template_selection');
      expect(this.state.game.template_selection)
        .toBe('gameTemplateSelection.set.returnValue');
    });

    it('should clear gameTerrainSelection', function() {
      expect(this.gameTerrainSelectionModel.clear)
        .toHaveBeenCalledWith('local', this.state, 'terrain_selection');
      expect(this.state.game.terrain_selection)
        .toBe('gameTerrainSelection.clear.returnValue');
    });
  });

  context('when user right-click on template', function() {
    return this.defaultModeModel.actions
      .templateSelectionDetail(this.state, this.event);
  }, function() {
    it('should open template selection detail', function() {
        expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.selectionDetail.open', 'template',
                              { state: { stamp: 'stamp' } });
    });

    it('should set gameTemplateSelection', function() {
      expect(this.gameTemplateSelectionModel.set)
        .toHaveBeenCalledWith('local', ['stamp'], this.state, 'template_selection');
      expect(this.state.game.template_selection)
        .toBe('gameTemplateSelection.set.returnValue');
    });

    it('should clear gameTerrainSelection', function() {
      expect(this.gameTerrainSelectionModel.clear)
        .toHaveBeenCalledWith('local', this.state, 'terrain_selection');
      expect(this.state.game.terrain_selection)
        .toBe('gameTerrainSelection.clear.returnValue');
    });
  });
});