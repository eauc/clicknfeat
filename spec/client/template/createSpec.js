'use strict';

describe('create template', function() {
  describe('createTemplateMode service', function() {
    beforeEach(inject([
      'createTemplateMode',
      function(createTemplateModeService) {
        this.createTemplateModeService = createTemplateModeService;
        this.gameService = spyOnService('game');

        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.scope.create = { template: {} };
        this.game = 'game';
      }
    ]));

    describe('onEnter()', function() {
      beforeEach(function() {
        this.createTemplateModeService.onEnter(this.scope);
      });

      using([
        [ 'event' ],
        [ 'enableCreateTemplate' ],
        [ 'enableMoveMap' ],
      ], function(e, d) {
        it('should emit '+e.event+' event', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith(e.event);
        });
      });
    });

    when('user move mouse over map', function() {
      this.createTemplateModeService.actions.moveMap(this.scope, {
        x: 42, y: 71
      });
    }, function() {
      it('should update scope\'s create object', function() {
        expect(this.scope.create.template)
          .toEqual({
            x: 42, y: 71
          });
      });

      it('should emit moveCreateTemplate event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('moveCreateTemplate');
      });
    });

    when('user click on map', function() {
      this.ret = this.createTemplateModeService
        .actions.clickMap(this.scope, {
          x: 42, y: 71
        });
    }, function() {
      using([
        [ 'flip_map', 'r' ],
        [ true      , 180 ],
        [ false     , 0   ],
      ], function(e, d) {
        when('map is '+(e.flip_map ? '' : 'not ')+'flipped', function() {
          this.scope.ui_state = { flip_map: e.flip_map };
        }, function() {
          it('should update scope\'s create object, '+d, function() {
            expect(this.scope.create.template)
              .toEqual({
                x: 42, y: 71, r: e.r
              });
          });
        });
      });
      
      it('should execute createTemplateCommand', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('createTemplate',
                                [this.scope.create.template],
                                this.scope, this.scope.game);
        expect(this.ret)
          .toBe('game.executeCommand.returnValue');
      });
    });

    describe('onLeave()', function() {
      beforeEach(function() {
        this.createTemplateModeService.onLeave(this.scope);
      });

      it('should reset scope\'s create object', function() {
        expect(this.scope.create)
          .toEqual({ template: null });
      });

      using([
        [ 'event' ],
        [ 'disableCreateTemplate' ],
        [ 'disableMoveMap' ],
      ], function(e, d) {
        it('should emit '+e.event+' event', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith(e.event);
        });
      });
    });
  });

  describe('createTemplateCommand service', function() {
    beforeEach(inject([
      'createTemplateCommand',
      function(createTemplateCommandService) {
        this.createTemplateCommandService = createTemplateCommandService;
        this.templateService = spyOnService('template');
        mockReturnPromise(this.templateService.create);
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
      }
    ]));

    when('execute(<state>, <scope>, <game>)', function() {
      this.ret = this.createTemplateCommandService
        .execute([this.state], this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.state = { state: 'state', type: 'type' };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };

      });

      when('template creation fails', function() {
        this.templateService.create.rejectWith = 'reason';
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No valid template definition');
          });
        });
      });
      
      when('template creation succeeds', function() {
        this.templateService.create.resolveWith = {
          state: { stamp: 'stamp'}, type: 'type'
        };
      }, function() {
        it('should create a new template from <state>', function() {
          this.thenExpect(this.ret, function() {
            expect(this.templateService.create)
              .toHaveBeenCalledWith(this.state);
          });
        });

        it('should add new template to <game> templates', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameTemplatesService.add)
              .toHaveBeenCalledWith([{
                state: { stamp: 'stamp' }, type: 'type'
              }], 'templates');
            expect(this.game.templates)
              .toBe('gameTemplates.add.returnValue');
          });
        });

        it('should set local templateSelection to new template', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameTemplateSelectionService.set)
              .toHaveBeenCalledWith('local', ['stamp'], this.scope, 'selection');
            expect(this.game.template_selection)
              .toBe('gameTemplateSelection.set.returnValue');
          });
        });

        it('should emit createTemplate event', function() {
          this.thenExpect(this.ret, function() {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('createTemplate');
          });
        });

        it('should return context', function() {
          this.thenExpect(this.ret, function(ctxt) {
            expect(this.templateService.saveState)
              .toHaveBeenCalledWith({
                state: { stamp: 'stamp' }, type: 'type'
              });
            expect(ctxt)
              .toEqual({
                templates: ['template.saveState.returnValue'],
                desc: 'type',
              });
          });
        });
      });
    });
    
    when('replay(<ctxt>, <scope>, <game>)', function() {
      this.ret = this.createTemplateCommandService
        .replay(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          templates: [{ stamp: 'stamp' }],
          desc: 'type',
        };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };
      });

      when('template creation fails', function() {
        this.templateService.create.rejectWith = 'reason';
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No valid template definition');
          });
        });
      });

      when('template creation succeeds', function() {
        this.templateService.create.resolveWith = {
          state: this.ctxt.templates[0]
        };
      }, function() {
        it('should create a new template from <ctxt.template>', function() {
          this.thenExpect(this.ret, function() {
            expect(this.templateService.create)
              .toHaveBeenCalledWith({ stamp: 'stamp' });
          });
        });
        
        it('should add new template to <game> templates', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameTemplatesService.add)
              .toHaveBeenCalledWith([{ state: { stamp: 'stamp' } }], 'templates');
            expect(this.game.templates)
              .toBe('gameTemplates.add.returnValue');
          });
        });
        
        it('should set remote templateSelection to new template', function() {
          this.thenExpect(this.ret, function() {
            expect(this.gameTemplateSelectionService.set)
              .toHaveBeenCalledWith('remote', ['stamp'], this.scope, 'selection');
          });
        });
        
        it('should emit createTemplate event', function() {
          this.thenExpect(this.ret, function() {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('createTemplate');
          });
        });
      });
    });

    when('undo(<ctxt>, <scope>, <game>)', function() {
      this.ret = this.createTemplateCommandService
        .undo(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          templates: [{ stamp: 'stamp' }],
          desc: 'type',
        };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };

      });

      it('should remove <ctxt.template> from <game> templates', function() {
        expect(this.gameTemplatesService.removeStamps)
          .toHaveBeenCalledWith(['stamp'], 'templates');
        expect(this.game.templates)
          .toBe('gameTemplates.removeStamps.returnValue');
      });

      it('should remove <ctxt.template> from templateSelection', function() {
        expect(this.gameTemplateSelectionService.removeFrom)
          .toHaveBeenCalledWith('local', ['stamp'], this.scope, 'selection');
        expect(this.gameTemplateSelectionService.removeFrom)
          .toHaveBeenCalledWith('remote', ['stamp'], this.scope,
                                'gameTemplateSelection.removeFrom.returnValue');
      });

      it('should emit createTemplate event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createTemplate');
      });
    });
  });

  describe('gameTemplates service', function() {
    beforeEach(inject([
      'gameTemplates',
      function(gameTemplatesService) {
        this.gameTemplatesService = gameTemplatesService;
      }
    ]));

    describe('add(<template>)', function() {
      beforeEach(function() {
        this.templates = {
          active: [ { state: { stamp: 'other', x: 1 } } ],
          locked: []
        };
      });

      using([
        [ 'new', 'result' ],
        [ { state: { stamp: 'new' } }, [ { state: { stamp: 'other', x: 1 } },
                                         { state: { stamp: 'new' } } ] ],
        // remove other identics stamps
        [ { state: { stamp: 'other' } }, [ { state: { stamp: 'other' } } ] ],
      ], function(e, d) {
        it('should add <template> to active templates list, '+d, function() {
          expect(this.gameTemplatesService.add([e.new], this.templates))
            .toEqual({ active: e.result,
                       locked: [] });
        });
      });
    });

    describe('removeStamp(<template>)', function() {
      beforeEach(function() {
        this.templates = {
          active: [ { state: { stamp: 'active' } } ],
          locked: [ { state: { stamp: 'locked' } } ]
        };
      });

      using([
        [ 'stamp', 'result' ],
        [ 'active',  { active: [ ],
                       locked: [ { state: { stamp: 'locked' } } ] } ],
        [ 'locked',  { active: [ { state: { stamp: 'active' } } ],
                       locked: [ ] } ],
        [ 'unknwown',  { active: [ { state: { stamp: 'active' } } ],
                         locked: [ { state: { stamp: 'locked' } } ] } ],
      ], function(e, d) {
        it('should remove <stamp> from templates list, '+d, function() {
          expect(this.gameTemplatesService.removeStamps([e.stamp], this.templates))
            .toEqual(e.result);
        });
      });
    });
  });

  describe('template service', function() {
    beforeEach(inject([
      'template',
      'allTemplates',
      function(templateService) {
        this.templateService = templateService;
        this.aoeTemplateService = spyOnService('aoeTemplate');
        this.aoeTemplateService.create.and.callFake(R.clone);
        spyOn(R, 'guid').and.returnValue('newGuid');
      }
    ]));

    when('create(<state>)', function() {
      this.ret = this.templateService.create(this.state);
    }, function() {
      when('<state.type> is unknown', function() {
        this.state = { type: 'unknown' };
      }, function() {
        it('should reject promise', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('Create unknown template type unknown');
          });
        });
      });

      when('<state.type> is known', function() {
        this.state = {
          type: 'aoe',
          x: 1, y: 4, r: 180,
          l: ['label'],
          stamp: 'stamp'
        };
      }, function() {
        it('should proxy <type> create', function() {
          this.thenExpect(this.ret, function() {
            expect(this.aoeTemplateService.create)
              .toHaveBeenCalledWith({
                state: {
                  type: 'aoe',
                  x: 0, y: 0, r: 0,
                  l: [],
                  stamp: 'newGuid'
                }
              });
          });
        });

        it('should extend <state> with default values', function() {
          this.thenExpect(this.ret, function(template) {
            expect(template)
              .toEqual({
                state: {
                  type: 'aoe',
                  x: 1, y: 4, r: 180,
                  l: [ 'label' ],
                  stamp: 'stamp'
                }
              });
          });
        });
      });
    });
  });
});
