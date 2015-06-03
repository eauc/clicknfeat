'use strict';

describe('misc template', function() {
  describe('onTemplatesCommand service', function() {
    beforeEach(inject([
      'onTemplatesCommand',
      function(onTemplatesCommandService) {
        this.onTemplatesCommandService = onTemplatesCommandService;
        this.templateService = spyOnService('template');
        this.templateService.eventName.and.callThrough();
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.gameTemplatesService.findStamp.and.callFake(function(s) {
          return { state: { stamp: s } };
        });
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
      }
    ]));

    when('execute(<method>, <..args..>, <stamps>, <scope>, <game>)', function() {
      this.ctxt = this.onTemplatesCommandService
        .execute('method', 'arg1', 'arg2', this.stamps, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2'];
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };

        this.templateService.saveState.and.callFake(function(t) {
          return t.state.stamp+'State';
        });
        this.templateService.call.and.callFake(function(m, a1, a2, t) {
          return t.state.stamp+'After_'+m;
        });
      });

      it('should find <stamps> in game templates', function() {
        expect(this.gameTemplatesService.findStamp)
          .toHaveBeenCalledWith('stamp1', 'templates');
        expect(this.gameTemplatesService.findStamp)
          .toHaveBeenCalledWith('stamp2', 'templates');
      });

      it('should save <stamps> states before change', function() {
        expect(this.ctxt.before)
          .toEqual(['stamp1State', 'stamp2State']);
      });

      it('should apply <method> on <stamps>', function() {
        expect(this.templateService.call)
          .toHaveBeenCalledWith('method', 'arg1', 'arg2', { state: { stamp: 'stamp1' } });
        expect(this.templateService.call)
          .toHaveBeenCalledWith('method', 'arg1', 'arg2', { state: { stamp: 'stamp2' } });
      });

      it('should save <stamps> states after change', function() {
        expect(this.ctxt.after)
          .toEqual(['stamp1After_method', 'stamp2After_method']);
      });

      it('should emit changeTemplate gameEvents', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTemplate-stamp1');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTemplate-stamp2');
      });

      it('should return context', function() {
        expect(this.ctxt.desc)
          .toBe('method');
      });
    });

    when('replay(<ctxt>, <scope>, <game>)', function() {
      this.onTemplatesCommandService.replay(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
          after: [ { stamp: 'after1' }, { stamp: 'after2' } ],
        };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };
      });

      it('should find <stamps> in game templates', function() {
        expect(this.gameTemplatesService.findStamp)
          .toHaveBeenCalledWith('after1', 'templates');
        expect(this.gameTemplatesService.findStamp)
          .toHaveBeenCalledWith('after2', 'templates');
      });

      it('should set <after> states', function() {
        expect(this.templateService.setState)
          .toHaveBeenCalledWith({ stamp: 'after1' }, { state: { stamp: 'after1' } });
        expect(this.templateService.setState)
          .toHaveBeenCalledWith({ stamp: 'after2' }, { state: { stamp: 'after2' } });
      });

      it('should set remote templateSelection to modified templates', function() {
        expect(this.gameTemplateSelectionService.set)
          .toHaveBeenCalledWith('remote', 'after2', this.scope, 'selection');
      });

      it('should emit changeTemplate gameEvents', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTemplate-after1');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTemplate-after2');
      });
    });

    when('undo(<ctxt>, <scope>, <game>)', function() {
      this.onTemplatesCommandService.undo(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
          after: [ { stamp: 'after1' }, { stamp: 'after2' } ],
        };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };
      });

      it('should find <stamps> in game templates', function() {
        expect(this.gameTemplatesService.findStamp)
          .toHaveBeenCalledWith('before1', 'templates');
        expect(this.gameTemplatesService.findStamp)
          .toHaveBeenCalledWith('before2', 'templates');
      });

      it('should set <before> states', function() {
        expect(this.templateService.setState)
          .toHaveBeenCalledWith({ stamp: 'before1' }, { state: { stamp: 'before1' } });
        expect(this.templateService.setState)
          .toHaveBeenCalledWith({ stamp: 'before2' }, { state: { stamp: 'before2' } });
      });

      it('should set remote templateSelection to modified templates', function() {
        expect(this.gameTemplateSelectionService.set)
          .toHaveBeenCalledWith('remote', 'before2', this.scope, 'selection');
      });

      it('should emit changeTemplate gameEvents', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTemplate-before1');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTemplate-before2');
      });
    });
  });

  describe('templateCommand service', function() {
    beforeEach(inject([
      'template',
      function(templateService) {
        this.templateService = templateService;
        this.aoeTemplateService = spyOnService('aoeTemplate');
      }
    ]));

    when('call(<method>, <...args...>)', function() {
      this.ret = this.templateService
        .call(this.method, 'arg1', 'arg2', this.template);
    }, function() {
      beforeEach(function() {
        spyOn(this.templateService, 'saveState')
          .and.returnValue('template.saveState.returnValue');
      });

      when('<template.type> and <method> are known', function() {
        this.template = { state: { type: 'aoe' } };
        this.method = 'setSize';
      }, function() {
        it('should proxy <template.type>\'s <method>', function() {
          expect(this.aoeTemplateService.setSize)
            .toHaveBeenCalledWith('arg1', 'arg2', this.template);
        });

        it('should save <template.state>', function() {
          expect(this.templateService.saveState)
            .toHaveBeenCalledWith(this.template);
          expect(this.ret)
            .toBe('template.saveState.returnValue');
        });
      });
    });

    describe('saveState()', function() {
      it('should return a copy of template\'s state', function() {
        var template = { state: { stamp: 'stamp' } };
        var ret = this.templateService.saveState(template);
        expect(ret).toEqual({ stamp: 'stamp' });
        expect(ret).not.toBe(template.state);
      });
    });

    describe('setState(<state>)', function() {
      it('should set a copy of <state> as template\'s state', function() {
        var template = { state: null };
        var state = { stamp: 'stamp' };
        this.templateService.setState(state, template);
        expect(template.state).toEqual(state);
        expect(template.state).not.toBe(state);
      });
    });
  });
});
