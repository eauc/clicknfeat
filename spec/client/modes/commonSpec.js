'use strict';

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
      [ 'viewScrollLeft', 'viewScrollLeft' ],
      [ 'viewScrollRight', 'viewScrollRight' ],
      [ 'viewScrollDown', 'viewScrollDown' ],
      [ 'viewScrollUp', 'viewScrollUp' ],
      [ 'viewZoomIn', 'viewZoomIn' ],
      [ 'viewZoomOut', 'viewZoomOut' ],
      [ 'viewZoomReset', 'viewZoomReset' ],
      [ 'flipMap', 'flipMap' ],
      [ 'toggleMenu', 'toggleMenu' ],
    ], function(e, d) {
      describe(e.action+'()', function() {
        beforeEach(function() {
          this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        });

        it('should broadcast "'+e.event+'" event', function() {
          this.commonModeService.actions[e.action](this.scope);
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith(e.event);
        });
      });
    });

    describe('modeBackToDefault', function() {
      beforeEach(function() {
        this.modesService = spyOnService('modes');
        this.scope = { modes: 'modes',
                       doSwitchToMode: jasmine.createSpy('doSwitchToMode')
                     };
        
        this.commonModeService.actions.modeBackToDefault(this.scope);
      });

      it('should switch to default mode', function() {
        expect(this.scope.doSwitchToMode)
          .toHaveBeenCalledWith('Default');
      });
    });
  });
});
