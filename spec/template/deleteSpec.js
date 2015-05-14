'use strict';

describe('delete template', function() {
  describe('templateMode service', function() {
    beforeEach(inject([
      'templateMode',
      function(templateModeService) {
        this.templateModeService = templateModeService;
        this.gameService = spyOnService('game');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection' }
        };
      }
    ]));

    when('user deletes current template selection', function() {
      this.templateModeService.actions.delete(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.getLocal._retVal = 'stamp';
      });

      it('should get current selection', function() {
        expect(this.gameTemplateSelectionService.getLocal)
          .toHaveBeenCalledWith('selection');
      });

      it('should execute deleteTemplates command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('deleteTemplates', ['stamp'],
                                this.scope, this.scope.game);
      });
    });
  });

  describe('deleteTemplatesCommand service', function() {
    beforeEach(inject([
      'deleteTemplatesCommand',
      function(deleteTemplatesCommandService) {
        this.deleteTemplatesCommandService = deleteTemplatesCommandService;
        this.templateService = spyOnService('template');
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
      }
    ]));

    when('execute(<stamps>, <scope>, <game>)', function() {
      this.ctxt = this.deleteTemplatesCommandService
        .execute(this.stamps, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2'];
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };

        this.gameTemplatesService.findStamp.and.callFake(function(s) {
          return { state: { stamp: s } };
        });
        this.templateService.saveState.and.callFake(function(t) {
          return t.state.stamp+'State';
        });
      });

      it('should find <stamps> in <game> templates', function() {
        expect(this.gameTemplatesService.findStamp)
          .toHaveBeenCalledWith('stamp1', 'templates');
        expect(this.gameTemplatesService.findStamp)
          .toHaveBeenCalledWith('stamp2', jasmine.any(String));
      });

      it('should save <stamps> state in context', function() {
        expect(this.templateService.saveState)
          .toHaveBeenCalledWith({ state: { stamp: 'stamp1' } });
        expect(this.templateService.saveState)
          .toHaveBeenCalledWith({ state: { stamp: 'stamp2' } });
        expect(this.ctxt.templates)
          .toEqual(['stamp1State', 'stamp2State']);
      });

      it('should remove <stamps> from game templates', function() {
        expect(this.gameTemplatesService.removeStamp)
          .toHaveBeenCalledWith('stamp1', 'templates');
        expect(this.gameTemplatesService.removeStamp)
          .toHaveBeenCalledWith('stamp2', jasmine.any(String));
        expect(this.game.templates)
          .toBe('gameTemplates.removeStamp.returnValue');
      });

      it('should remove <stamps> from local selection', function() {
        expect(this.gameTemplateSelectionService.removeFromLocal)
          .toHaveBeenCalledWith('stamp1', this.scope, 'selection');
        expect(this.gameTemplateSelectionService.removeFromLocal)
          .toHaveBeenCalledWith('stamp2', this.scope, 'selection');
      });

      it('should emit createTemplate gameEvent', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createTemplate');
      });
    });

    when('replay(<ctxt>, <scope>, <game>)', function() {
      this.deleteTemplatesCommandService.replay(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          templates: [ { stamp: 'stamp1' }, { stamp: 'stamp2' } ],
        };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };
      });

      it('should remove <stamps> from game templates', function() {
        expect(this.gameTemplatesService.removeStamp)
          .toHaveBeenCalledWith('stamp1', 'templates');
        expect(this.gameTemplatesService.removeStamp)
          .toHaveBeenCalledWith('stamp2', jasmine.any(String));
        expect(this.game.templates)
          .toBe('gameTemplates.removeStamp.returnValue');
      });

      it('should remove <stamps> from local selection', function() {
        expect(this.gameTemplateSelectionService.removeFromLocal)
          .toHaveBeenCalledWith('stamp1', this.scope, 'selection');
        expect(this.gameTemplateSelectionService.removeFromLocal)
          .toHaveBeenCalledWith('stamp2', this.scope, 'selection');
      });

      it('should emit createTemplate gameEvent', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createTemplate');
      });
    });

    when('undo(<ctxt>, <scope>, <game>)', function() {
      this.deleteTemplatesCommandService.undo(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          templates: [ { stamp: 'stamp1' }, { stamp: 'stamp2' } ],
        };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };

        this.templateService.create.and.callFake(function(st) {
          return { state: st };
        });
      });

      it('should create templates from <ctxt.templates>', function() {
        expect(this.templateService.create)
          .toHaveBeenCalledWith({ stamp: 'stamp1' });
        expect(this.templateService.create)
          .toHaveBeenCalledWith({ stamp: 'stamp2' });
      });

      it('should add new templates to <game> templates', function() {
        expect(this.gameTemplatesService.add)
          .toHaveBeenCalledWith({ state: { stamp: 'stamp1' } }, 'templates');
        expect(this.gameTemplatesService.add)
          .toHaveBeenCalledWith({ state: { stamp: 'stamp2' } }, jasmine.any(String));
        expect(this.game.templates)
          .toBe('gameTemplates.add.returnValue');
      });

      it('should emit createTemplate event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createTemplate');
      });
    });
  });
});
