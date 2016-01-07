describe('misc template', function() {
  describe('onTemplatesCommand service', function() {
    beforeEach(inject([
      'onTemplatesCommand',
      'allTemplates',
      function(onTemplatesCommandService) {
        this.onTemplatesCommandService = onTemplatesCommandService;

        this.gameTemplatesService = spyOnService('gameTemplates');
        mockReturnPromise(this.gameTemplatesService.fromStamps);
        this.gameTemplatesService.fromStamps
          .resolveWith = 'gameTemplates.fromStamps.returnValue';
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.game = { templates: 'templates',
                      template_selection: 'selection'
                    };

        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);
      }
    ]));

    when('execute(<method>, <..args..>, <stamps>, <state>, <game>)', function() {
      this.ret = this.onTemplatesCommandService
        .execute('method', this.args, this.stamps, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.args = ['arg1', 'arg2'];
        this.stamps = [ 'stamp1', 'stamp2' ];
      });

      it('should save before state', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTemplatesService.fromStamps)
            .toHaveBeenCalledWith('saveState', [], this.stamps, this.game.templates);
        });
      });
      
      it('should apply <method> on <stamps>', function() {
        this.thenExpect(this.ret, function([ctxt, game]) {
          expect(this.gameTemplatesService.onStamps)
            .toHaveBeenCalledWith('method', this.args, this.stamps, this.game.templates);
          expect(game.templates).toBe('gameTemplates.onStamps.returnValue');
        });
      });
      
      it('should emit changeTemplate changeEvents', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.template.change.stamp1');
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.template.change.stamp2');
        });
      });

      it('should save after state', function() {
        this.thenExpect(this.ret, () => {
          expect(this.gameTemplatesService.fromStamps)
            .toHaveBeenCalledWith('saveState', [], this.stamps, 'gameTemplates.onStamps.returnValue');
        });
      });
      
      it('should return context', function() {
        this.thenExpect(this.ret, function([ctxt]) {
          expect(ctxt).toEqual({
            before: 'gameTemplates.fromStamps.returnValue',
            after: 'gameTemplates.fromStamps.returnValue',
            desc: 'method'
          });
        });
      });
    });

    using([
      ['method', 'ctxt'],
      ['replay', 'after'],
      ['undo', 'before'],
    ], function(e) {
      when(e.method+'(<ctxt>, <state>, <game>)', function() {
        this.ret = this.onTemplatesCommandService[e.method](this.ctxt, this.state, this.game);
      }, function() {
        beforeEach(function() {
          this.ctxt = {
            before: [ { stamp: 'before1' },
                      { stamp: 'before2' }
                    ],
            after: [ { stamp: 'after1' },
                     { stamp: 'after2' }
                   ]
          };
        });
        
        it('should set <after> states', function() {
          this.thenExpect(this.ret, (game) => {
            expect(this.gameTemplatesService.setStateStamps)
              .toHaveBeenCalledWith(this.ctxt[e.ctxt],
                                    [ e.ctxt+'1', e.ctxt+'2' ],
                                    'templates');
            expect(game.templates)
              .toBe('gameTemplates.setStateStamps.returnValue');
          });
        });
        
        it('should set remote templateSelection to modified templates', function() {
          this.thenExpect(this.ret, (game) => {
            expect(this.gameTemplateSelectionService.set)
              .toHaveBeenCalledWith('remote', [e.ctxt+'1',e.ctxt+'2'],
                                    this.state, 'selection');
            expect(game.template_selection)
              .toBe('gameTemplateSelection.set.returnValue');
          });
        });
        
        it('should emit changeTemplate changeEvents', function() {
          this.thenExpect(this.ret, () => {
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith(`Game.template.change.${e.ctxt}1`);
            expect(this.state.changeEvent)
              .toHaveBeenCalledWith(`Game.template.change.${e.ctxt}2`);
          });
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

        this.templates = {
          active: [
            { state: { stamp: 'stamp1' } },
            { state: { stamp: 'stamp2' } },
          ],
          locked: [
            { state: { stamp: 'stamp3' } },
          ]
        };
      }
    ]));

    when('findAnyStamps(<stamps>)', function() {
      this.ret = this.gameTemplatesService
        .findAnyStamps(this.stamps, this.templates);
    }, function() {
      beforeEach(function() {
        this.templates = {
          active: [
            { state: { stamp: 'stamp1' } },
            { state: { stamp: 'stamp2' } },
          ],
          locked: [
            { state: { stamp: 'stamp3' } },
          ]
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

    
    when('onStamp(<method>, <...args...>, <stamps>)', function() {
      this.ret = this.gameTemplatesService
        .onStamps('method', this.args, this.stamps, this.templates);
    }, function() {
      beforeEach(function() {
        this.args = ['arg1', 'arg2'];
        this.stamps = ['stamp2', 'stamp3'];
      });

      when('none of the <stamps> are found', function() {
        this.stamps = ['whatever', 'unknown'];
      }, function() {
        it('should reject method', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No template found');
          });
        });
      });

      when('some <stamps> are found', function() {
        this.stamps = ['stamp2', 'whatever', 'stamp3'];
      }, function() {
        beforeEach(function() {
          this.templateService.isLocked.and.callFake((m) => {
            return m.state.stamp === 'stamp2';
          });
          this.templateService.call.resolveWith = (m,a,t) => {
            return R.assocPath(['state','set'],'set', t);
          };
        });

        it('should call <method> on <stamp> template', function() {
          this.thenExpect(this.ret, function(result) {
            expect(this.templateService.call)
              .toHaveBeenCalledWith('method', this.args,
                                    { state: { stamp: 'stamp2' } });
            expect(this.templateService.call)
              .toHaveBeenCalledWith('method', this.args,
                                    { state: { stamp: 'stamp3' } });
            expect(result)
              .toEqual({
                active: [ { state: { stamp: 'stamp3', set: 'set' } },
                          { state: { stamp: 'stamp1' } }
                        ],
                locked: [ { state: { stamp: 'stamp2', set: 'set' } }
                        ]
                });
          });
        });
        
        when('some calls to <method> fail', function() {
          this.templateService.call.resolveWith = (m,a,t) => {
            return ( t.state.stamp === 'stamp2' ?
                     R.assocPath(['state','set'],'set', t) :
                     self.Promise.reject('reason')
                   );
          };
        }, function() {
          it('should return partial result', function() {
            this.thenExpect(this.ret, function(result) {
              expect(result).toEqual({
                active: [ { state: { stamp: 'stamp3' } },
                          { state: { stamp: 'stamp1' } }
                        ],
                locked: [ { state: { stamp: 'stamp2', set: 'set' } }
                        ]
              });
            });
          });
        });
      });
    });
    
    when('fromStamp(<method>, <...args...>, <stamps>)', function() {
      this.ret = this.gameTemplatesService
        .fromStamps('method', this.args, this.stamps, this.templates);
    }, function() {
      beforeEach(function() {
        this.args = ['arg1', 'arg2'];
        this.stamps = ['stamp2', 'stamp3'];
      });

      when('none of the <stamps> are found', function() {
        this.stamps = ['whatever', 'unknown'];
      }, function() {
        it('should reject method', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No template found');
          });
        });
      });

      when('some <stamps> are found', function() {
        this.stamps = ['stamp2', 'whatever', 'stamp3'];
      }, function() {
        beforeEach(function() {
          this.templateService.isLocked.and.callFake((m) => {
            return m.state.stamp === 'stamp2';
          });
          this.templateService.call.resolveWith = (m,a,t) => {
            return `template.setState.returnValue(${t.state.stamp})`;
          };
        });

        it('should call <method> on <stamp> template', function() {
          this.thenExpect(this.ret, function(result) {
            expect(this.templateService.call)
              .toHaveBeenCalledWith('method', this.args,
                                    { state: { stamp: 'stamp2' } });
            expect(this.templateService.call)
              .toHaveBeenCalledWith('method', this.args,
                                    { state: { stamp: 'stamp3' } });
            expect(result)
              .toEqual([
                'template.setState.returnValue(stamp2)',
                'template.setState.returnValue(stamp3)'
              ]);
          });
        });

        when('some calls to <method> fail', function() {
          this.templateService.call.resolveWith = (m,a,t) => {
            return ( t.state.stamp === 'stamp2' ?
                     `template.setState.returnValue(${t.state.stamp})` :
                     self.Promise.reject('reason')
                   );
          };
        }, function() {
          it('should return partial result', function() {
            this.thenExpect(this.ret, function(result) {
              expect(result).toEqual([
                'template.setState.returnValue(stamp2)',
                null
              ]);
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
        .call(this.method, ['arg1', 'arg2'], this.template);
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
        template = this.templateService.setState(state, template);
        expect(template.state).toEqual(state);
        expect(template.state).not.toBe(state);
      });
    });
  });
});
