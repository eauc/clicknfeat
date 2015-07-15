'use strict';

describe('create template', function() {
  describe('gameMainCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.modesService = spyOnService('modes');

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          this.scope.onGameEvent = jasmine.createSpy('onGameEvent');
          this.scope.modes = 'modes';
          this.scope.create = {};
          this.scope.digestOnGameEvent = function() {};

          $controller('gameMainCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    when('user creates a template', function() {
      this.scope.doCreateTemplate('type');
    }, function() {
      it('should init scope\'s create object', function() {
        expect(this.scope.create)
          .toEqual({
            template: {
              type: 'type',
              x: 240, y: 240
            }
          });
      });

      it('should switch to CreateTemplate mode', function() {
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('CreateTemplate', this.scope, 'modes');
      });
    });
  });

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
      this.createTemplateModeService.actions.clickMap(this.scope, {
        x: 42, y: 71
      });
    }, function() {
      it('should update scope\'s create object', function() {
        expect(this.scope.create.template)
          .toEqual({
            x: 42, y: 71
          });
      });

      it('should execute createTemplateCommand', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('createTemplate',
                                [this.scope.create.template],
                                this.scope, this.scope.game);
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
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
      }
    ]));

    describe('execute(<state>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.state = { state: 'state', type: 'type' };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };

        this.templateService.create._retVal = { state: { stamp: 'stamp' } };

        this.ret = this.createTemplateCommandService
          .execute([this.state], this.scope, this.game);
      });

      it('should create a new template from <state>', function() {
        expect(this.templateService.create)
          .toHaveBeenCalledWith(this.state);
      });

      it('should add new template to <game> templates', function() {
        expect(this.gameTemplatesService.add)
          .toHaveBeenCalledWith([{ state: { stamp: 'stamp' } }], 'templates');
        expect(this.game.templates)
          .toBe('gameTemplates.add.returnValue');
      });

      it('should set local templateSelection to new template', function() {
        expect(this.gameTemplateSelectionService.set)
          .toHaveBeenCalledWith('local', ['stamp'], this.scope, 'selection');
      });

      it('should emit createTemplate event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createTemplate');
      });

      it('should return context', function() {
        expect(this.templateService.saveState)
          .toHaveBeenCalledWith({ state: { stamp: 'stamp' } });
        expect(this.ret)
          .toEqual({
            templates: ['template.saveState.returnValue'],
            desc: 'type',
          });
      });
    });

    describe('replay(<ctxt>, <scope>, <game>)', function() {
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
        this.templateService.create._retVal = { state: this.ctxt.templates[0] };
        
        this.createTemplateCommandService.replay(this.ctxt, this.scope, this.game);
      });

      it('should create a new template from <ctxt.template>', function() {
        expect(this.templateService.create)
          .toHaveBeenCalledWith({ stamp: 'stamp' });
      });

      it('should add new template to <game> templates', function() {
        expect(this.gameTemplatesService.add)
          .toHaveBeenCalledWith([{ state: { stamp: 'stamp' } }], 'templates');
        expect(this.game.templates)
          .toBe('gameTemplates.add.returnValue');
      });

      it('should set remote templateSelection to new template', function() {
        expect(this.gameTemplateSelectionService.set)
          .toHaveBeenCalledWith('remote', ['stamp'], this.scope, 'selection');
      });

      it('should emit createTemplate event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createTemplate');
      });
    });

    describe('undo(<ctxt>, <scope>, <game>)', function() {
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

        this.createTemplateCommandService.undo(this.ctxt, this.scope, this.game);
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
        spyOn(R, 'guid').and.returnValue('newGuid');
      }
    ]));

    describe('create(<state>)', function() {
      when('<state.type> is unknown', function() {
        this.ret = this.templateService.create({ type: 'unknown' });
      }, function() {
        it('should return Nil', function() {
          expect(this.ret).toBe(undefined);
        });
      });

      when('<state.type> is known', function() {
        this.type = 'aoe';
        this.aoeTemplateService.create.and.callFake(function(t) {
          return R.clone(t);
        });
      }, function() {
        it('should proxy <type> create', function() {
          this.templateService.create({ type: this.type });
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

        it('should extend <state> with default values', function() {
          this.templateService.create({
            type: this.type,
            x: 1, y: 4,
            l: ['label'],
            stamp: 'stamp'
          });
          expect(this.aoeTemplateService.create)
            .toHaveBeenCalledWith({
              state: {
                type: 'aoe',
                x: 0, y: 0, r: 0,
                l: [],
                stamp: 'newGuid',
              }
            });
        });

        it('should return <type>.create value', function() {
          var ret = this.templateService.create({
            type: this.type,
            x: 1, y: 4,
            l: ['label'],
            stamp: 'stamp'
          });
          expect(ret)
            .toEqual({
              state: {
                type: 'aoe',
                x: 1, y: 4, r: 0,
                l: [ 'label' ],
                stamp: 'stamp'
              }
            });
        });
      });
    });
  });
});
