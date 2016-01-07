describe('create template', function() {
  describe('createTemplateMode service', function() {
    beforeEach(inject([
      'createTemplateMode',
      function(createTemplateModeService) {
        this.createTemplateModeService = createTemplateModeService;

        this.state = jasmine.createSpyObj('state', [
          'event', 'changeEvent'
        ]);
        this.state.create = { template: {} };
        this.game = 'game';
      }
    ]));

    describe('onEnter()', function() {
      beforeEach(function() {
        this.createTemplateModeService.onEnter(this.state);
      });

      using([
        [ 'event' ],
        [ 'Game.template.create.enable' ],
        [ 'Game.moveMap.enable' ],
      ], function(e) {
        it('should emit '+e.event+' event', function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith(e.event);
        });
      });
    });

    when('user move mouse over map', function() {
      this.createTemplateModeService.actions
        .moveMap(this.state, { x: 42, y: 71 });
    }, function() {
      it('should update state\'s create object', function() {
        expect(this.state.create)
          .toEqual({
            template: {
              base: { x: 42, y: 71 }
            }
          });
      });

      it('should emit moveCreateTemplate event', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.create.update');
      });
    });

    when('user create\'s template', function() {
      this.ret = this.createTemplateModeService
        .actions.create(this.state, {
          'click#': { x: 42, y: 71 }
        });
    }, function() {
      using([
        [ 'flip_map', 'r' ],
        [ true      , 180 ],
        [ false     , 0   ],
      ], function(e, d) {
        when('map is '+(e.flip_map ? '' : 'not ')+'flipped', function() {
          this.state.ui_state = { flip_map: e.flip_map };
        }, function() {
          it('should update state\'s create object, '+d, function() {
            expect(this.state.create)
              .toEqual({
                template: {
                  base: { x: 42, y: 71 }
                }
              });
          });
      
          it('should execute createTemplateCommand', function() {
            expect(this.state.event)
              .toHaveBeenCalledWith('Game.command.execute',
                                    'createTemplate', [this.state.create.template, e.flip_map]);
          });
        });
      });
    });

    describe('onLeave()', function() {
      beforeEach(function() {
        this.createTemplateModeService.onLeave(this.state);
      });

      it('should reset state\'s create object', function() {
        expect(this.state.create)
          .toEqual({ template: null });
      });

      using([
        [ 'event' ],
        [ 'Game.template.create.disable' ],
        [ 'Game.moveMap.disable' ],
      ], function(e) {
        it('should emit '+e.event+' event', function() {
          expect(this.state.changeEvent)
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

        this.state = {
          factions: 'factions',
          changeEvent: jasmine.createSpy('changeEvent')
        };
        this.game = { templates: 'templates',
                      template_selection: 'selection'
                    };

        var stamp_index = 1;
        mockReturnPromise(this.templateService.create);
        this.templateService.create.resolveWith = (m) => {
          return { state: R.assoc('stamp', 'stamp'+(stamp_index++), m) };
        };
      }
    ]));

    when('execute(<create>, <flip>, <state>, <game>)', function() {
      this.ret = this.createTemplateCommandService
        .execute(this.create, this.flip, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.create = {
          base: { x: 240, y: 240, r: 180 },
          templates: [ {
            x: 0, y: 0, r: 45
          }, {
            x: 20, y: 0, r: 0
          }, {
            x: 40, y: 0, r: -45
          } ]
        };
        this.flip = false;
      });

      it('should create new templates from <create>', function() {
        this.thenExpect(this.ret, function() {
          expect(this.templateService.create)
            .toHaveBeenCalledWith({
              x: 240, y: 240, r: 225
            });
          expect(this.templateService.create)
            .toHaveBeenCalledWith({
              x: 260, y: 240, r: 180
            });
          expect(this.templateService.create)
            .toHaveBeenCalledWith({
              x: 280, y: 240, r: 135
            });
        });
      });

      when('map is flipped', function() {
        this.flip = true;
      }, function() {
        it('should flip new templates positions', function() {
          this.thenExpect(this.ret, function() {
            expect(this.templateService.create)
              .toHaveBeenCalledWith({
                x: 240, y: 240, r: 405
              });
            expect(this.templateService.create)
              .toHaveBeenCalledWith({
                x: 220, y: 240, r: 360
              });
            expect(this.templateService.create)
              .toHaveBeenCalledWith({
                x: 200, y: 240, r: 315
              });
          });
        });
      });

      when('create templates fails', function() {
        this.templateService.create.rejectWith = 'reason';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No valid template definition');
          });
        });
      });

      it('should add new template to <game> templates', function() {
        this.thenExpect(this.ret, function([ctxt, game]) {
          expect(this.gameTemplatesService.add)
            .toHaveBeenCalledWith([
              { state: { x: 240, y: 240, r: 225,
                         stamp: 'stamp1'
                       }
              },
              { state: { x: 260, y: 240, r: 180,
                         stamp: 'stamp2'
                       }
              },
              { state: { x: 280, y: 240, r: 135,
                         stamp: 'stamp3'
                       }
              }
            ], 'templates');
          expect(game.templates)
            .toBe('gameTemplates.add.returnValue');
        });
      });

      it('should set local templateSelection to new template', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTemplateSelectionService.set)
            .toHaveBeenCalledWith('local', ['stamp1', 'stamp2', 'stamp3'],
                                  this.state, 'selection');
        });
      });

      it('should emit createTemplate event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.template.create');
        });
      });

      it('should return context', function() {
        this.thenExpect(this.ret, function([ctxt]) {
          expect(this.templateService.saveState)
            .toHaveBeenCalledWith({
              state: { x: 240, y: 240, r: 225,
                       stamp: 'stamp1'
                     }
            });
          expect(this.templateService.saveState)
            .toHaveBeenCalledWith({
              state: { x: 260, y: 240, r: 180,
                       stamp: 'stamp2'
                     }
            });
          expect(this.templateService.saveState)
            .toHaveBeenCalledWith({
              state: { x: 280, y: 240, r: 135,
                       stamp: 'stamp3'
                     }
            });

          expect(ctxt)
            .toEqual({
              templates: [ 'template.saveState.returnValue',
                           'template.saveState.returnValue',
                           'template.saveState.returnValue' ],
              desc: undefined
            });
        });
      });
    });

    when('replay(<ctxt>, <state>, <game>)', function() {
      this.ret = this.createTemplateCommandService
        .replay(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          templates: [
            { x: 240, y: 240,
              stamp: 'stamp'
            },
            { x: 260, y: 240,
              stamp: 'stamp'
            },
            { x: 280, y: 240,
              stamp: 'stamp'
            }
          ],
          desc: 'type'
        };
      });

      it('should create new templates from <ctxt.templates>', function() {
        this.thenExpect(this.ret, function() {
          expect(this.templateService.create)
            .toHaveBeenCalledWith({
              x: 240, y: 240,
              stamp: 'stamp'
            });
          expect(this.templateService.create)
            .toHaveBeenCalledWith({
              x: 260, y: 240,
              stamp: 'stamp'
            });
          expect(this.templateService.create)
            .toHaveBeenCalledWith({
              x: 280, y: 240,
              stamp: 'stamp'
            });
        });
      });

      when('create templates fails', function() {
        this.templateService.create.rejectWith = 'reason';
      }, function() {
        it('should reject command', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No valid template definition');
          });
        });
      });

      it('should add new template to <game> templates', function() {
        this.thenExpect(this.ret, function(game) {
          expect(this.gameTemplatesService.add)
            .toHaveBeenCalledWith([
              { state: { x: 240, y: 240,
                         stamp: 'stamp1'
                       }
              },
              { state: { x: 260, y: 240,
                         stamp: 'stamp2'
                       }
              },
              { state: { x: 280, y: 240,
                         stamp: 'stamp3'
                       }
              }
            ], 'templates');
          expect(game.templates)
            .toBe('gameTemplates.add.returnValue');
        });
      });

      it('should set remote templateSelection to new template', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameTemplateSelectionService.set)
            .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                  this.state, 'selection');
        });
      });

      it('should emit createTemplate event', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.template.create');
        });
      });
    });

    when('undo(<ctxt>, <state>, <game>)', function() {
      this.game = this.createTemplateCommandService
        .undo(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          templates: [
            { info: [ 'legion', 'templates', 'locks', 'absylonia1' ],
              x: 240, y: 240,
              stamp: 'stamp1'
            },
            { info: [ 'legion', 'templates', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 260, y: 240,
              stamp: 'stamp2'
            },
            { info: [ 'legion', 'templates', 'units', 'archers', 'entries', 'unit', 'grunt' ],
              x: 280, y: 240,
              stamp: 'stamp3'
            }
          ],
          desc: 'type'
        };
      });

      it('should remove <ctxt.template> from <game> templates', function() {
        expect(this.gameTemplatesService.removeStamps)
          .toHaveBeenCalledWith(['stamp1','stamp2','stamp3'], 'templates');
        expect(this.game.templates)
          .toBe('gameTemplates.removeStamps.returnValue');
      });

      it('should remove <ctxt.template> from templateSelection', function() {
        expect(this.gameTemplateSelectionService.removeFrom)
          .toHaveBeenCalledWith('local', ['stamp1','stamp2','stamp3'],
                                this.state, 'selection');
        expect(this.gameTemplateSelectionService.removeFrom)
          .toHaveBeenCalledWith('remote', ['stamp1','stamp2','stamp3'],
                                this.state, 'gameTemplateSelection.removeFrom.returnValue');
      });

      it('should emit createTemplate event', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.template.create');
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
