'use strict';

describe('model image', function() {
  describe('gameTemplateSelection service', function() {
    beforeEach(inject([
      'gameTemplateSelection',
      function(gameTemplateSelectionService) {
        this.gameTemplateSelectionService = gameTemplateSelectionService;
        this.modesService = spyOnService('modes');
        this.gameTemplatesService = spyOnService('gameTemplates');

        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        this.scope.game = { templates: 'templates' };
        this.scope.modes = 'modes';
      }
    ]));

    when('set(local, <stamps>, <scope>)', function() {
      this.ret = this.gameTemplateSelectionService.set('local', ['stamp'],
                                                       this.scope, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: { stamps: [ 'before1' ] },
                           remote: { stamps: [ 'before1' ] }
                         };
      });

      it('should not send disableSingleAoESelection gameEvent', function() {
        expect(this.scope.gameEvent)
          .not.toHaveBeenCalledWith('disableSingleAoESelection');
      });

      when('<stamps> is single', function() {
        this.after = [ 'after1' ];
      }, function() {
        it('should not send disableSingleTemplateSelection gameEvent', function() {
          expect(this.scope.gameEvent)
            .not.toHaveBeenCalledWith('disableSingleTemplateSelection');
        });
      });
    });

    when('removeFrom(local, <stamps>, <scope>)', function() {
      this.ret = this.gameTemplateSelectionService.removeFrom('local', ['stamp'],
                                                              this.scope, this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: { stamps: [ 'stamp' ] },
                           remote: { stamps: [ ] }
                         };
      });

      it('should send disableSingleAoESelection gameEvent', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('disableSingleAoESelection');
      });
    });

    when('clear(<where>, <stamps>, <scope>)', function() {
      this.ret = this.gameTemplateSelectionService.clear('local',
                                                         this.scope,
                                                         this.selection);
    }, function() {
      beforeEach(function() {
        this.selection = { local: { stamps: ['stamp1', 'stamp2'] },
                           remote: { stamps: ['stamp1', 'stamp2'] }
                         };
      });

      it('should send disableSingleAoESelection gameEvent', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('disableSingleAoESelection');
      });
    });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
        this.gameFactionsService = spyOnService('gameFactions');
      }
    ]));

    describe('distanceToAoE(<factions>, <aoe>)', function() {
      beforeEach(function() {
        this.fake_info = {
          info: { base_radius: 9.842 }
        };
        this.gameFactionsService.getModelInfo.and.callFake(R.bind(function(i) {
          return this.fake_info[i];
        }, this));
      });

      using([
        ['model_pos', 'distance'],
        [{ x:240, y:240 }, 12.584406871192854 ],
        [{ x:245, y:245 }, 5.513339059327379 ],
        [{ x:250, y:250 }, -1.5577287525380967 ],
      ], function(e, d) {
        it('should return distance between model and <aoe>, '+d, function() {
          expect(this.modelService.distanceToAoE('factions', {
            state: { s: 20, x: 270, y: 270 }
          }, {
            state: R.merge({ info: 'info'}, e.model_pos)
          })).toBe(e.distance);
        });
      });
    });
  });
});
