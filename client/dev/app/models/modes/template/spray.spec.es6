describe('sprayTemplateMode model', function() {
  beforeEach(inject([
    'sprayTemplateMode',
    function(sprayTemplateModeModel) {
      this.sprayTemplateModeModel = sprayTemplateModeModel;

      this.appStateService = spyOnService('appState');
      this.gameModel = spyOnService('game');
      this.sprayTemplateModel = spyOnService('sprayTemplate');
      this.gameTemplatesModel = spyOnService('gameTemplates');
      this.gameTemplateSelectionModel = spyOnService('gameTemplateSelection');
      this.gameModelsModel = spyOnService('gameModels');

      this.state = {
        factions: 'factions',
        game: { template_selection: 'selection',
                templates: 'templates',
                models: 'models'
              }
      };
    }
  ]));

  context('when user set origin model', function() {
    return this.sprayTemplateModeModel.actions
      .setOriginModel(this.state, this.event);
  }, function() {
    beforeEach(function() {
      this.gameTemplateSelectionModel.get
        .and.returnValue(['stamp']);
      this.target = { state: { stamp: 'origin' } };
      this.event = { 'click#': { target: this.target } };
    });

    it('should set origin for current template selection', function() {
      expect(this.gameTemplateSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.appStateService.chainReduce)
        .toHaveBeenCalledWith('Game.command.execute',
                              'onTemplates',
                              [ 'setOriginP',
                                ['factions', this.target],
                                ['stamp']
                              ]);
    });
  });

  context('when user set target model', function() {
    return this.sprayTemplateModeModel.actions
      .setTargetModel(this.state, this.event);
  }, function() {
    beforeEach(function() {
      this.gameTemplateSelectionModel.get
        .and.returnValue(['stamp']);
      this.sprayTemplateModel.origin
        .and.returnValue(null);
      this.target = { state: { stamp: 'target' } };
      this.event = { 'click#': { target: this.target } };
    });

    it('should check whether current spray selection has an origin', function() {
      expect(this.gameTemplateSelectionModel.get)
        .toHaveBeenCalledWith('local', 'selection');
      expect(this.gameTemplatesModel.findStamp)
        .toHaveBeenCalledWith('stamp', 'templates');
      expect(this.sprayTemplateModel.origin)
        .toHaveBeenCalledWith('gameTemplates.findStamp.returnValue');
    });

    context('when spray does not have an origin', function() {
      this.sprayTemplateModel.origin
        .and.returnValue(null);
    }, function() {
      it('should do nothing', function() {
        expect(this.appStateService.chainReduce)
          .not.toHaveBeenCalled();
      });
    });

    context('when spray has an origin', function() {
      this.sprayTemplateModel.origin
        .and.returnValue('origin');
    }, function() {
      it('should set spray target to clicked model', function() {
        expect(this.gameModelsModel.findStamp)
          .toHaveBeenCalledWith('origin', 'models');
        expect(this.appStateService.chainReduce)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTemplates',
                                [ 'setTargetP',
                                  ['factions',
                                   'gameModels.findStamp.returnValue',
                                   this.target],
                                  ['stamp']
                                ]);
      });
    });
  });

  example(function(e, d) {
    context('when user rotate left, '+d, function() {
      return this.sprayTemplateModeModel
        .actions[e.action](this.state);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionModel.get
          .and.returnValue(['stamp']);
        this.sprayTemplateModel.origin
          .and.returnValue('origin');
        this.target = { state: { stamp: 'target' } };
        this.event = { 'click#': { target: this.target } };
      });

      it('should rotate spray left', function() {
        expect(this.gameTemplateSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameTemplatesModel.findStamp)
          .toHaveBeenCalledWith('stamp', 'templates');

        expect(this.sprayTemplateModel.origin)
          .toHaveBeenCalledWith('gameTemplates.findStamp.returnValue');
        expect(this.gameModelsModel.findStamp)
          .toHaveBeenCalledWith('origin', 'models');
        expect(this.appStateService.chainReduce)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTemplates',
                                [ 'rotateLeftP',
                                  ['factions',
                                   'gameModels.findStamp.returnValue',
                                   e.small],
                                  ['stamp']
                                ]);
      });
    });
  }, [
    ['action'          , 'small' ],
    ['rotateLeft'      , false   ],
    ['rotateLeftSmall' , true    ],
  ]);

  example(function(e) {
    context('user set '+e.action+' on template selection', function() {
      return this.sprayTemplateModeModel
        .actions[e.action](this.state);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionModel.get
          .and.returnValue(['stamp']);
      });

      it('should get current selection', function() {
        expect(this.gameTemplateSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute onTemplates/setSize command', function() {
        expect(this.appStateService.chainReduce)
          .toHaveBeenCalledWith('Game.command.execute',
                                'onTemplates',
                                [ 'setSizeP', [e.size], ['stamp'] ]);
      });
    });
  }, [
    [ 'action'      , 'size' ],
    [ 'spraySize6'  , 6      ],
    [ 'spraySize8'  , 8      ],
    [ 'spraySize10' , 10     ],
  ]);
});
