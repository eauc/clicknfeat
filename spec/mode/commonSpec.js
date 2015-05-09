'use strict';

describe('commonMode', function() {
  describe('modesService', function() {
    beforeEach(inject([
      'commonMode',
      function(commonModeService) {
        this.commonModeService = commonModeService;
      }
    ]));

    using([
      [ 'action', 'event'  ],
      [ 'zoomIn', 'zoomIn' ],
      [ 'zoomOut', 'zoomOut' ],
      [ 'zoomReset', 'zoomReset' ],
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
  });
});
