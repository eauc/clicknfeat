'use strict';

describe('misc template', function() {
  describe('onTemplatesCommand service', function() {
    beforeEach(inject([
      'onTemplatesCommand',
      'allTemplates',
      function(onTemplatesCommandService) {
        this.onTemplatesCommandService = onTemplatesCommandService;
        this.templateService = spyOnService('template');
        this.templateService.call.and.callThrough();
        this.templateService.respondTo.and.callThrough();
        this.templateService.eventName.and.callThrough();
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.game = { templates: { active: [ { state: { type: 'aoe',
                                                        stamp: 'stamp1',
                                                        _debug: 'debug1' } },
                                             { state: { type: 'aoe',
                                                        stamp: 'stamp2',
                                                        _debug: 'debug2' } },
                                           ],
                                   locked: [ { state: { type: 'aoe',
                                                        stamp: 'stamp3',
                                                        _debug: 'debug3' } },
                                           ],
                                 },
                      template_selection: 'selection'
                    };

        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);

        this.templateService.saveState.and.callFake(function(t) {
          return t.state._debug+'State';
        });
        this.templateService.method = jasmine.createSpy('method')
          .and.callFake(function(a1, a2, t) {
            t.state._debug += 'Method';
          });
      }
    ]));

    when('execute(<method>, <..args..>, <stamps>, <scope>, <game>)', function() {
      this.ret = this.onTemplatesCommandService
        .execute(this.method, 'arg1', 'arg2', this.stamps, this.scope, this.game);
    }, function() {
      when('<method> is unknown', function() {
        this.method = 'unknown';
        this.stamps = ['stamp1', 'stamp2'];
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Unknown call unknown on aoe template');
          });
        });
      });

      when('<stamps> are not found', function() {
        this.method = 'method';
        this.stamps = ['stamp4', 'unknown'];
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No template found');
          });
        });
      });
      
      when('<method> is known and <stamps> are found', function() {
        this.method = 'method';
        this.stamps = ['stamp1', 'stamp2'];
      }, function() {
        it('should apply <method> on <stamps>', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(this.templateService.method)
              .toHaveBeenCalledWith('arg1', 'arg2', this.game.templates.active[0]);
            expect(this.templateService.method)
              .toHaveBeenCalledWith('arg1', 'arg2', this.game.templates.active[1]);
          });
        });
        
        it('should emit changeTemplate gameEvents', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('changeTemplate-stamp1');
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('changeTemplate-stamp2');
          });
        });
        
        it('should return context', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(ctxt).toEqual({
              before: [ 'debug1State', 'debug2State' ],
              after: [ 'debug1MethodState', 'debug2MethodState' ],
              desc: 'method'
            });
          });
        });
      });
    });

    when('replay(<ctxt>, <scope>, <game>)', function() {
      this.ret = this.onTemplatesCommandService
        .replay(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: [ { stamp: 'stamp1', _debug: 'before1' },
                   { stamp: 'stamp2', _debug: 'before2' }
                 ],
          after: [ { stamp: 'stamp1', _debug: 'after1' },
                   { stamp: 'stamp2', _debug: 'after2' }
                 ],
        };
      });

      when('<ctxt.after.stamps> are not found', function() {
        this.ctxt.after = [ { stamp: 'stamp4' }, { stamp: 'unknown' } ];
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No template found');
          });
        });
      });

      it('should set <after> states', function() {
        this.thenExpect(this.ret, function() {
          expect(this.templateService.setState)
            .toHaveBeenCalledWith({ stamp: 'stamp1', _debug: 'after1' },
                                  this.game.templates.active[0]);
          expect(this.templateService.setState)
            .toHaveBeenCalledWith({ stamp: 'stamp2', _debug: 'after2' },
                                  this.game.templates.active[1]);
        });
      });

      it('should set remote templateSelection to modified templates', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTemplateSelectionService.set)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2'],
                                  this.scope, 'selection');
        });
      });

      it('should emit changeTemplate gameEvents', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTemplate-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTemplate-stamp2');
        });
      });
    });

    when('undo(<ctxt>, <scope>, <game>)', function() {
      this.ret = this.onTemplatesCommandService
        .undo(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: [ { stamp: 'stamp1', _debug: 'before1' },
                   { stamp: 'stamp2', _debug: 'before2' }
                 ],
          after: [ { stamp: 'stamp1', _debug: 'after1' },
                   { stamp: 'stamp2', _debug: 'after2' }
                 ],
        };
      });

      when('<ctxt.after.stamps> are not found', function() {
        this.ctxt.before = [ { stamp: 'stamp4' }, { stamp: 'unknown' } ];
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No template found');
          });
        });
      });

      it('should set <before> states', function() {
        this.thenExpect(this.ret, function() {
          expect(this.templateService.setState)
            .toHaveBeenCalledWith({ stamp: 'stamp1', _debug: 'before1' },
                                  this.game.templates.active[0]);
        });
      });

      it('should set remote templateSelection to modified templates', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTemplateSelectionService.set)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2'],
                                  this.scope, 'selection');
        });
      });

      it('should emit changeTemplate gameEvents', function() {
        this.thenExpect(this.ret, function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTemplate-stamp1');
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeTemplate-stamp2');
        });
      });
    });
  });

  describe('gameTemplates service', function() {
    beforeEach(inject([
      'gameTemplates',
      function(gameTemplatesService) {
        this.gameTemplatesService = gameTemplatesService;
        this.templateService = spyOnService('template');
        mockReturnPromise(this.templateService.call);
        this.templateService.call.resolveWith = function(a,b,c,t) {
          return t.state.stamp+'Call';
        };
      }
    ]));

    when('findAnyStamps(<stamps>)', function() {
      this.ret = this.gameTemplatesService.findAnyStamps(this.stamps,
                                                         this.templates);
    }, function() {
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
      
      when('templates are not found', function() {
        this.stamps = ['stamp4', 'unknown'];
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toEqual('No template found');
          });
        });
      });

      using([
        [ 'stamps'             , 'templates' ],
        [ ['stamp2', 'stamp3'] , [ { state: { stamp: 'stamp2' } },
                                   { state: { stamp: 'stamp3' } }
                                 ] ],
        [ ['unknown', 'stamp3'], [ null,
                                   { state: { stamp: 'stamp3' } }
                                 ] ],
      ], function(e, d) {
        when('templates are found, '+d, function() {
          this.stamps = e.stamps;
        }, function() {
          it('should return templates', function() {
            this.thenExpect(this.ret, function(templates) {
              expect(templates)
                .toEqual(e.templates);
            });
          });
        });
      });
    });

    when('onStamps(<stamps>, <method>, <...args...>)', function() {
      this.ret = this.gameTemplatesService.onStamps('method', 'arg1', 'arg2',
                                                    this.stamps,
                                                    this.templates);
    }, function() {
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
      
      when('templates are not found', function() {
        this.stamps = ['stamp4', 'unknown'];
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toEqual('No template found');
          });
        });
      });
      
      when('templates are found', function() {
        this.stamps = ['stamp2', 'stamp3'];
      }, function() {
        it('should call <method> on <stamps> templates', function() {
          this.thenExpect(this.ret, function(res) {
            expect(this.templateService.call)
              .toHaveBeenCalledWith('method', 'arg1', 'arg2',
                                    { state: { stamp: 'stamp2' } });
            expect(this.templateService.call)
              .toHaveBeenCalledWith('method', 'arg1', 'arg2',
                                    { state: { stamp: 'stamp3' } });

            expect(res).toEqual(['stamp2Call','stamp3Call']);
          });
        });
        
        when('call fails', function() {
          this.templateService.call.rejectWith = 'reason';
        }, function() {
          it('should call <method> on <stamps> templates', function() {
            this.thenExpectError(this.ret, function(reason) {
              expect(reason).toEqual('reason');
            });
          });
        });
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

      when('<template.type> is unknown', function() {
        this.template = { state: { type: 'unknown' } };
        this.method = 'setSize';
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason)
              .toBe('Unknown call setSize on unknown template');
          });
        });
      });

      when('<method> is unknown', function() {
        this.template = { state: { type: 'aoe' } };
        this.method = 'unknown';
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason)
              .toBe('Unknown call unknown on aoe template');
          });
        });
      });

      when('<template.type> and <method> are known', function() {
        this.template = { state: { type: 'aoe' } };
        this.method = 'setSize';
      }, function() {
        it('should proxy <template.type>\'s <method>', function() {
          this.thenExpect(this.ret, function(result) {
            expect(this.aoeTemplateService.setSize)
              .toHaveBeenCalledWith('arg1', 'arg2', this.template);

            expect(result)
              .toBe('aoeTemplate.setSize.returnValue');
          });
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
