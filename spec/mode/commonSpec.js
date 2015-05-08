'use strict';

describe('commonMode', function() {

  beforeEach(function() {
    module('clickApp.controllers');
    module('clickApp.services');
  });

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
          this.scope = jasmine.createSpyObj('scope', ['$broadcast']);
        });

        it('should broadcast "'+e.event+'" event', function() {
          this.commonModeService.actions[e.action](this.scope);
          expect(this.scope.$broadcast)
            .toHaveBeenCalledWith(e.event);
        });
      });
    });
  });
});
