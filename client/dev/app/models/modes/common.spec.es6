describe('commonModeModel', function() {
  beforeEach(inject([
    'commonMode',
    function(commonModeModel) {
      this.commonModeModel = commonModeModel;
    }
  ]));

  example(function(e) {
    describe(e.action+'()', function() {
      beforeEach(function() {
        this.state = jasmine.createSpyObj('state', [
          'queueChangeEventP']);
      });

      it('should broadcast "'+e.event+'" event', function() {
        this.commonModeModel.actions[e.action](this.state);
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith(e.event);
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
    [ 'flipMap', 'Game.view.flipMap' ],
    [ 'toggleMenu', 'Game.toggleMenu' ],
  ]);

  describe('modeBackToDefault', function() {
    beforeEach(function() {
      this.modesModel = spyOnService('modes');
      this.state = { modes: 'modes',
                     eventP: jasmine.createSpy('eventP')
                   };
      this.commonModeModel.actions
        .modeBackToDefault(this.state);
    });

    it('should switch to default mode', function() {
      expect(this.state.eventP)
        .toHaveBeenCalledWith('Modes.switchTo','Default');
    });
  });
});
