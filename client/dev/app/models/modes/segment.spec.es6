describe('segmentMode model', function() {
  beforeEach(inject([ 'segmentMode', function(segmentMode) {
    this.gameLosModel = spyOnService('gameLos');
    this.gameModelsModel = spyOnService('gameModels');
    this.gameModelSelectionModel = spyOnService('gameModelSelection');

    this.segmentModeModel = segmentMode('type', this.gameLosModel, {});

    this.appActionService = spyOnService('appAction');
    this.appGameService = spyOnService('appGame');
    spyOn(this.appGameService.models.selection, 'sample')
      .and.returnValue('selection');
    spyOn(this.appGameService.models.models, 'sample')
      .and.returnValue('models');
    this.appStateService = spyOnService('appState');
    this.game = { type: 'type',
                  models: 'models'
                };
    this.state = { game: this.game };
  }]));

  context('when user starts using segment', function() {
    return this.segmentModeModel
      .onEnter(this.state);
  }, function() {
    context('when there is exactly one model selected', function() {
      this.gameModelSelectionModel.get
        .and.returnValue(['stamp']);
    }, function() {
      it('should set selected model as origin', function() {
        expect(this.gameModelSelectionModel.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameModelsModel.findStamp)
          .toHaveBeenCalledWith('stamp', 'models');

        expect(this.appActionService.defer)
          .toHaveBeenCalledWith('Game.command.execute',
                                'setType', [
                                  'setOriginResetTarget',
                                  ['gameModels.findStamp.returnValue', 'models']
                                ]);
      });
    });
  });

  example(function(e, d) {
    context('when user drags segment, '+d, function() {
      this.drag = { start: 'start', now: 'now' };
      return this.segmentModeModel
        .actions[e.action](this.state, this.drag);
    }, function() {
      it('should init local segment', function() {
        expect(this.gameLosModel.setLocal)
          .toHaveBeenCalledWith('start', 'now', 'type');
        expect(this.context.game.type)
          .toBe('gameLos.setLocal.returnValue');
      });
    });
  }, [
    ['action'       ],
    ['dragStartMap' ],
    ['dragMap'      ],
  ]);

  context('when user endDrags segment', function() {
    this.drag = { start: 'start', now: 'now' };
    return this.segmentModeModel.actions
      .dragEndMap(this.state, this.drag);
  }, function() {
    it('should execute setRemote command', function() {
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith(this.state, [
          'Game.command.execute',
          'setType', [
            'setRemote',
            ['start', 'now', 'models']
          ]
        ]);
    });
  });
});
