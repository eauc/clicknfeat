'use strict';

describe('modes', function() {
  describe('modesService', function() {
    beforeEach(inject([
      'modes',
      'defaultMode',
      'allModes',
      function(modesService, defaultModeService) {
        this.modesService = modesService;
        this.defaultModeService = defaultModeService;
        this.defaultModeService.onEnter = jasmine.createSpy('onEnterDefault');
        this.defaultModeService.bindings = {
          'test2': 'ctrl+test2',
          'test1': 'ctrl+test1',
          'test3': 'ctrl+test3',
        };
        this.gameModelSelectionService = spyOnService('gameModelSelection');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
      }
    ]));

    describe('currentModeBindingsPairs', function() {
      beforeEach(function(done) {
        this.scope = { game: { template_selection: 'selection' } };
        this.modesService.init(this.scope)
          .then(R.bind(function(modes) {
            this.modes = modes;
            done();
          }, this));
      });

      it('should proxy current mode\'s action', function() {
        expect(this.modesService.currentModeBindingsPairs(this.modes))
          .toEqual([
            [ 'test1', 'ctrl+test1' ],
            [ 'test2', 'ctrl+test2' ],
            [ 'test3', 'ctrl+test3' ]
          ]);
      });
    });
  });
});
