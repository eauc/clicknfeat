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
        this.gameService = spyOnService('game');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
        this.scope = { modes: 'modes',
                       game: { template_selection: 'selection' },
                       gameEvent: jasmine.createSpy('gameEvent')
                     };

        this.commonModeService.actions.modeBackToDefault(this.scope);
      });

      it('should clear local template selection', function() {
        expect(this.gameTemplateSelectionService.clear)
          .toHaveBeenCalledWith('local', this.scope, 'selection');
      });

      it('should clear local model selection', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setModelSelection', 'clear', null,
                                this.scope, this.scope.game);
      });

      it('should close selection detail', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('closeSelectionDetail');
      });

      it('should switch to default mode', function() {
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('Default', this.scope, 'modes');
      });
    });
  });
});
