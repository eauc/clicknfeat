describe('commonMode model', function() {
  beforeEach(inject([
    'commonMode',
    function(commonModeModel) {
      this.commonModeModel = commonModeModel;

      this.appStateService = spyOnService('appState');
    }
  ]));

  example(function(e) {
    describe(e.action+'()', function() {
      it('should broadcast "'+e.event+'" event', function() {
        const context = this.commonModeModel
                .actions[e.action]('state');
        expect(this.appStateService.onAction)
          .toHaveBeenCalledWith('state', [e.event]);
        expect(context)
          .toBe('appState.onAction.returnValue');
      });
    });
  }, [
    [ 'action', 'event'  ],
    [ 'viewScrollLeft', 'Game.view.scrollLeft' ],
    [ 'viewScrollRight', 'Game.view.scrollRight' ],
    [ 'viewScrollDown', 'Game.view.scrollDown' ],
    [ 'viewScrollUp', 'Game.view.scrollUp' ],
    [ 'viewZoomIn', 'Game.view.zoomIn' ],
    [ 'viewZoomOut', 'Game.view.zoomOut' ],
    [ 'viewZoomReset', 'Game.view.zoomReset' ],
    [ 'viewToggleMenu', 'Game.view.toggleMenu' ],
    [ 'viewFlipMap', 'Game.view.flipMap' ],
  ]);

  describe('modeBackToDefault', function() {
    it('should switch to default mode', function() {
      const context = this.commonModeModel.actions
        .modeBackToDefault('state');
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith('state', ['Modes.switchTo', 'Default']);
      expect(context)
        .toBe('appState.onAction.returnValue');
    });
  });

  describe('commandUndoLast', function() {
    it('should undo last command', function() {
      const context = this.commonModeModel.actions
        .commandUndoLast('state');
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith('state', ['Game.command.undoLast']);
      expect(context)
        .toBe('appState.onAction.returnValue');
    });
  });

  describe('commandReplayNext', function() {
    it('should switch to default mode', function() {
      const context = this.commonModeModel.actions
        .commandReplayNext('state');
      expect(this.appStateService.onAction)
        .toHaveBeenCalledWith('state', ['Game.command.replayNext']);
      expect(context)
        .toBe('appState.onAction.returnValue');
    });
  });
});
