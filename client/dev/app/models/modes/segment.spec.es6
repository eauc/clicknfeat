describe('segmentMode model', function() {
  beforeEach(inject([ 'segmentMode', function(segmentMode) {
    this.gameLosModel = spyOnService('gameLos');
    this.gameModelsModel = spyOnService('gameModels');
    this.gameModelSelectionModel = spyOnService('gameModelSelection');

    this.segmentModeModel = segmentMode('type', this.gameLosModel, {});

    this.game = { type: 'type',
                  models: 'models',
                  model_selection: 'selection'
                };
    this.state = { game: this.game,
                   queueChangeEventP: jasmine.createSpy('queueChangeEventP'),
                   eventP: jasmine.createSpy('eventP')
                 };
    this.state.eventP.and.callFake((e, l, u) => {
      if('Game.update' === e) {
        this.state.game = R.over(l, u, this.state.game);
      }
      return 'state.event.returnValue';
    });
  }]));

  xcontext('when user starts using segment', function() {
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
        expect(this.gameModelsModel.findStampP)
          .toHaveBeenCalledWith('stamp', 'models');

        expect(this.state.eventP)
          .toHaveBeenCalledWith('Game.command.execute',
                                'setType', [
                                  'setOriginResetTarget',
                                  ['gameModels.findStampP.returnValue']
                                ]);
      });
    });
  });

  context('when user stops using segment', function() {
    return this.segmentModeModel
      .onLeave(this.state);
  }, function() {
    it('should update Segment state', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.type.remote.change');
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
          .toHaveBeenCalledWith('start', 'now',
                                this.state, this.game, 'type');
        expect(this.state.game.type)
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
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Game.command.execute',
                              'setType', [
                                'setRemote',
                                ['start', 'now']
                              ]);
    });
  });
});
