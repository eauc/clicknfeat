'use strict';

describe('setSize template', function() {
  describe('templateLockedMode service', function() {
    beforeEach(inject([
      'templateLockedMode',
      function(templateLockedModeService) {
        this.templateLockedModeService = templateLockedModeService;
        this.gameService = spyOnService('game');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection' },
        };
      }
    ]));

    using([
      [ 'action', 'size' ],
      [ 'aoeSize3', 3 ],
      [ 'aoeSize4', 4 ],
      [ 'aoeSize5', 5 ],
    ], function(e, d) {
      when('user set '+e.action+' on template selection', function() {
        this.templateLockedModeService.actions[e.action](this.scope);
      }, function() {
        beforeEach(function() {
          this.gameTemplateSelectionService.getLocal._retVal = 'stamp';
        });

        it('should get current selection', function() {
          expect(this.gameTemplateSelectionService.getLocal)
            .toHaveBeenCalledWith('selection');
        });

        it('should execute onTemplates/setSize command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onTemplates', 'setSize', e.size, ['stamp'],
                                  this.scope, this.scope.game);
        });
      });
    });
  });

  describe('aoeTemplate service', function() {
    beforeEach(inject([
      'aoeTemplate',
      function(aoeTemplateService) {
        this.aoeTemplateService = aoeTemplateService;
      }
    ]));

    using([
      [ 'size', 'result' ],
      [ 3     , { s: 15 } ],
      [ 4     , { s: 20 } ],
      [ 5     , { s: 25 } ],
    ], function(e, d) {
      describe('setSize(<size>), '+d, function() {
        beforeEach(function() {
          this.template = {
            state: { }
          };
        });

        it('should set template size', function() {
          this.aoeTemplateService.setSize(e.size, this.template);
          expect(this.template.state)
            .toEqual(e.result);
        });
      });
    });
  });
});
