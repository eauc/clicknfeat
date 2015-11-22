'use strict';

describe('setSize template', function() {
  describe('aoeTemplateMode service', function() {
    beforeEach(inject([
      'aoeTemplateMode',
      function(aoeTemplateModeService) {
        this.aoeTemplateModeService = aoeTemplateModeService;
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
        this.ret = this.aoeTemplateModeService
          .actions[e.action](this.scope);
      }, function() {
        beforeEach(function() {
          this.gameTemplateSelectionService.get._retVal = ['stamp'];
        });

        it('should get current selection', function() {
          expect(this.gameTemplateSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onTemplates/setSize command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onTemplates', 'setSize', e.size, ['stamp'],
                                  this.scope, this.scope.game);

          expect(this.ret).toBe('game.executeCommand.returnValue');
        });
      });
    });
  });

  describe('sprayTemplateMode service', function() {
    beforeEach(inject([
      'sprayTemplateMode',
      function(sprayTemplateModeService) {
        this.sprayTemplateModeService = sprayTemplateModeService;
        this.gameService = spyOnService('game');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection' },
        };
      }
    ]));

    using([
      [ 'action', 'size' ],
      [ 'spraySize6', 6 ],
      [ 'spraySize8', 8 ],
      [ 'spraySize10', 10 ],
    ], function(e, d) {
      when('user set '+e.action+' on template selection', function() {
        this.ret = this.sprayTemplateModeService.actions[e.action](this.scope);
      }, function() {
        beforeEach(function() {
          this.gameTemplateSelectionService.get._retVal = ['stamp'];
        });

        it('should get current selection', function() {
          expect(this.gameTemplateSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
        });

        it('should execute onTemplates/setSize command', function() {
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onTemplates', 'setSize', e.size, ['stamp'],
                                  this.scope, this.scope.game);

          expect(this.ret).toBe('game.executeCommand.returnValue');
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
      [ 3     , 15       ],
      [ 4     , 20       ],
      [ 5     , 25       ],
    ], function(e, d) {
      describe('setSize(<size>), '+d, function() {
        beforeEach(function() {
          this.template = {
            state: { }
          };
        });

        it('should set template size', function() {
          this.aoeTemplateService.setSize(e.size, this.template);
          expect(this.aoeTemplateService.size(this.template))
            .toEqual(e.result);
        });
      });
    });

    describe('when size is not valid', function() {
      it('should reject size', function() {
        this.ret = this.aoeTemplateService.setSize(42, this.template);

        this.thenExpectError(this.ret, function(reason) {
          expect(reason).toBe('Invalid size for an AoE');
        });
      });
    });
  });

  describe('sprayTemplate service', function() {
    beforeEach(inject([
      'sprayTemplate',
      function(sprayTemplateService) {
        this.sprayTemplateService = sprayTemplateService;
      }
    ]));

    using([
      [ 'size', 'result' ],
      [ 6     , 6        ],
      [ 8     , 8        ],
      [ 10    , 10       ],
    ], function(e, d) {
      describe('setSize(<size>), '+d, function() {
        beforeEach(function() {
          this.template = {
            state: { }
          };
        });

        it('should set template size', function() {
          this.sprayTemplateService.setSize(e.size, this.template);
          expect(this.sprayTemplateService.size(this.template))
            .toEqual(e.result);
        });
      });
    });

    describe('when size is not valid', function() {
      it('should reject size', function() {
        this.ret = this.sprayTemplateService.setSize(42, this.template);

        this.thenExpectError(this.ret, function(reason) {
          expect(reason).toBe('Invalid size for a Spray');
        });
      });
    });
  });
});
