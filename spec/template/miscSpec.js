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
        this.gameTemplatesService.onStamps.and.callFake(function(m) {
          return 'gameTemplates.onStamps.returnValue('+m+')';
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
          t.state.stamp += 'After';
        });
      });

      it('should save <stamps> states before change', function() {
        expect(this.gameTemplatesService.onStamps)
          .toHaveBeenCalledWith('saveState', this.stamps, 'templates');
        expect(this.ctxt.before)
          .toEqual('gameTemplates.onStamps.returnValue(saveState)');
      });

      it('should apply <method> on <stamps>', function() {
        expect(this.gameTemplatesService.onStamps)
          .toHaveBeenCalledWith('method', 'arg1', 'arg2', this.stamps, 'templates');
      });

      it('should save <stamps> states after change', function() {
        expect(this.ctxt.before)
          .toEqual('gameTemplates.onStamps.returnValue(saveState)');
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
      this.onTemplatesCommandService
        .replay(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.gameTemplatesService.findStamp.and.callFake(function(s) {
          return { state: { stamp: s } };
        });
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
          .toHaveBeenCalledWith('remote', ['after1','after2'],
                                this.scope, 'selection');
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
        this.gameTemplatesService.findStamp.and.callFake(function(s) {
          return { state: { stamp: s } };
        });
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
          .toHaveBeenCalledWith('remote', ['before1','before2'],
                                this.scope, 'selection');
      });

      it('should emit changeTemplate gameEvents', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTemplate-before1');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeTemplate-before2');
      });
    });
  });

  describe('gameTemplates service', function() {
    beforeEach(inject([
      'gameTemplates',
      function(gameTemplatesService) {
        this.gameTemplatesService = gameTemplatesService;
        this.templateService = spyOnService('template');
      }
    ]));

    describe('onStamps(<stamps>, <method>, <...args...>)', function() {
      beforeEach(function() {
        this.templates = {
          active: [
            { state: { stamp: 'stamp1' } },
            { state: { stamp: 'stamp2' } },
          ],
          locked: [
            { state: { stamp: 'stamp3' } },
          ],
        };
      });

      it('should call <method> on <stamp> template', function() {
        this.gameTemplatesService.onStamps('method', 'arg1', 'arg2',
                                           ['stamp2', 'stamp3'],
                                           this.templates);
        expect(this.templateService.call)
          .toHaveBeenCalledWith('method', 'arg1', 'arg2',
                                { state: { stamp: 'stamp2' } });
        expect(this.templateService.call)
          .toHaveBeenCalledWith('method', 'arg1', 'arg2',
                                { state: { stamp: 'stamp3' } });
      });
    });
  });

  describe('template service', function() {
    beforeEach(inject([
      'template',
      function(templateService) {
        this.templateService = templateService;
        this.aoeTemplateService = spyOnService('aoeTemplate');
      }
    ]));

    describe('answerTo(<method>)', function() {
      it('should test whether template responds to <method>', function() {
        this.template = { state: { type: 'aoe' } };
        expect(this.templateService.respondTo('setSize', this.template))
          .toBe(true);
        expect(this.templateService.respondTo('whatever', this.template))
          .toBe(false);
      });
    });

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
          expect(this.ret)
            .toBe('aoeTemplate.setSize.returnValue');
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
