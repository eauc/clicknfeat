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
      beforeEach(function() {
        this.scope = { game: { template_selection: 'selection' } };
        this.modes = this.modesService.init(this.scope);
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
