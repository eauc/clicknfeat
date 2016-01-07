describe('commonMode', function() {
  describe('commonModeService', function() {
    beforeEach(inject([
      'commonMode',
      function(commonModeService) {
        this.commonModeService = commonModeService;
      }
    ]));

    using([
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
    ], function(e) {
      describe(e.action+'()', function() {
        beforeEach(function() {
          this.state = jasmine.createSpyObj('state', ['changeEvent']);
        });

        it('should broadcast "'+e.event+'" event', function() {
          this.commonModeService.actions[e.action](this.state);
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith(e.event);
        });
      });
    });

    describe('modeBackToDefault', function() {
      beforeEach(function() {
        this.modesService = spyOnService('modes');
        this.state = { modes: 'modes',
                       event: jasmine.createSpy('event')
                     };
        
        this.commonModeService.actions.modeBackToDefault(this.state);
      });

      it('should switch to default mode', function() {
        expect(this.state.event)
          .toHaveBeenCalledWith('Modes.switchTo','Default');
      });
    });
  });
});
