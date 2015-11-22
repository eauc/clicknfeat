'use strict';

describe('on mode action', function() {
  describe('modesService', function() {
    beforeEach(inject([
      'modes',
      'defaultMode',
      'allModes',
      function(modesService, defaultModeService) {
        this.modesService = modesService;
        this.defaultModeService = defaultModeService;
        spyOn(this.defaultModeService.actions, 'viewZoomIn');
        this.defaultModeService.actions.viewZoomIn
          .and.returnValue('viewZoomIn.returnValue');
      }
    ]));

    describe('currentModeAction', function() {
      beforeEach(function(done) {
        this.scope = { game: { template_selection: 'selection' } };
        this.modesService.init(this.scope)
          .then(R.bind(function(modes) {
            this.modes = modes;
            
            done();
          }, this));
      });

      when('action is unknown in current mode', function() {
        this.ret =
          this.modesService.currentModeAction('unknown',
                                              this.scope,
                                              this.modes);
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Unknown action unknown');
          });
        });
      });

      when('action is known in current mode', function() {
        this.ret =
          this.modesService.currentModeAction('viewZoomIn',
                                              this.scope,
                                              this.modes);
      }, function() {
        it('should proxy current mode\'s action', function() {
          this.thenExpect(this.ret, function(value) {
            expect(this.defaultModeService.actions.viewZoomIn)
              .toHaveBeenCalledWith(this.scope);

            expect(value).toBe('viewZoomIn.returnValue');
          });
        });

        when('action fails', function() {
          mockReturnPromise(this.defaultModeService.actions.viewZoomIn);
          this.defaultModeService.actions.viewZoomIn.rejectWith = 'reason';
        }, function() {
          it('should reject promise', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toBe('reason');
            });
          });
        });
      });
    });
  });
});
