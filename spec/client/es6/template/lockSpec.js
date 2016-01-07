describe('lock template', function() {
  describe('templateMode service', function() {
    beforeEach(inject([
      'templateMode',
      function(templateModeService) {
        this.templateModeService = templateModeService;

        this.modesService = spyOnService('modes');
        this.templateService = spyOnService('template');
        this.gameTemplatesService = spyOnService('gameTemplates');
        mockReturnPromise(this.gameTemplatesService.findStamp);
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.state = {
          game: { template_selection: 'selection',
                  templates: 'templates' },
          event: jasmine.createSpy('event')
        };
      }
    ]));

    when('user toggles lock on current template selection', function() {
      this.ret = this.templateModeService.actions
        .toggleLock(this.state);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
        this.gameTemplatesService.findStamp.resolveWith = 'template';
      });

      it('should get current selection', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      using([
        ['lock','set'],
        [true,false],
      ], function(e, d) {
        when('selection lock is '+e.lock, function() {
          this.templateService.isLocked._retVal = e.lock;
        }, function() {
          it('should execute lockTemplates command, '+d, function() {
            this.thenExpect(this.ret, () => {
              expect(this.state.event)
                .toHaveBeenCalledWith('Game.command.execute',
                                      'lockTemplates', [ e.set, ['stamp'] ]);
            });
          });
        });
      });
    });
  });

  describe('lockTemplatesCommand service', function() {
    beforeEach(inject([
      'lockTemplatesCommand',
      function(lockTemplatesCommandService) {
        this.lockTemplatesCommandService = lockTemplatesCommandService;

        this.gameTemplatesService = spyOnService('gameTemplates');
        mockReturnPromise(this.gameTemplatesService.lockStamps);
        this.gameTemplatesService.lockStamps
          .resolveWith = 'gameTemplates.lockStamps.returnValue';
      }
    ]));

    when('execute(<stamps>, <lock>, <state>, <game>)', function() {
      this.ret = this.lockTemplatesCommandService
        .execute('lock', this.stamps, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2', 'stamp3'];
        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);
        this.game = { templates: 'templates' };
      });

      it('should lock <stamps>', function() {
        this.thenExpect(this.ret, function([ctxt, game]) {
          expect(this.gameTemplatesService.lockStamps)
            .toHaveBeenCalledWith('lock', this.stamps, 'templates');
          expect(game.templates)
            .toBe('gameTemplates.lockStamps.returnValue');
        });
      });
          
      it('should return ctxt', function() {
        this.thenExpect(this.ret, function([ctxt]) {
          expect(ctxt).toEqual({
            stamps: this.stamps,
            desc: 'lock'
          });
        });
      });

      it('should emit createTemplate changeEvent', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.template.create');
        });
      });
    });

    when('replay(<ctxt>, <state>, <game>)', function() {
      this.ret = this.lockTemplatesCommandService
        .replay(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          stamps: [ 'stamp1', 'stamp2' ],
          desc: 'lock'
        };
        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);
        this.game = { templates: 'templates' };
      });
      
      it('should lock <stamps>', function() {
        this.thenExpect(this.ret, function(game) {
          expect(this.gameTemplatesService.lockStamps)
            .toHaveBeenCalledWith('lock', ['stamp1', 'stamp2'], 'templates');
          expect(game.templates)
            .toBe('gameTemplates.lockStamps.returnValue');
        });
      });

      it('should emit createTemplate changeEvent', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.template.create');
        });
      });
    });

    when('undo(<ctxt>, <state>, <game>)', function() {
      this.ret = this.lockTemplatesCommandService
        .undo(this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          stamps: [ 'stamp1', 'stamp2' ],
          desc: false
        };
        this.state = jasmine.createSpyObj('state', [
          'changeEvent'
        ]);
        this.game = { templates: 'templates' };
      });
      
      it('should !lock <stamps>', function() {
        this.thenExpect(this.ret, function(game) {
          expect(this.gameTemplatesService.lockStamps)
            .toHaveBeenCalledWith(true, ['stamp1', 'stamp2'], 'templates');
          expect(game.templates)
            .toBe('gameTemplates.lockStamps.returnValue');
        });
      });

      it('should emit createTemplate changeEvent', function() {
        this.thenExpect(this.ret, function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.template.create');
        });
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

    describe('lockStamps(<lock>, <stamps>)', function() {
      beforeEach(function() {
        this.templates = {
          active: [ { state: { stamp: 's1', lk: false } },
                    { state: { stamp: 's2', lk: false } } ],
          locked: [ { state: { stamp: 's3', lk: true } },
                    { state: { stamp: 's4', lk: true } } ]
        };
      });

      using([
        [ 'lock', 'stamps', 'result' ],
        [ true  , ['s1']  , { active: [ { state: { stamp: 's2', lk: false } } ],
                              locked: [ { state: { stamp: 's1', lk: true } },
                                        { state: { stamp: 's3', lk: true } },
                                        { state: { stamp: 's4', lk: true } } ]
                            } ],
        [ false , ['s1']  , { active: [ { state: { stamp: 's1', lk: false } },
                                        { state: { stamp: 's2', lk: false } } ],
                              locked: [ { state: { stamp: 's3', lk: true } },
                                        { state: { stamp: 's4', lk: true } } ]
                            } ],
        [ true  , ['s3']  , { active: [ { state: { stamp: 's1', lk: false } },
                                        { state: { stamp: 's2', lk: false } } ],
                              locked: [ { state: { stamp: 's3', lk: true } },
                                        { state: { stamp: 's4', lk: true } } ]
                            } ],
        [ false , ['s4']  , { active: [ { state: { stamp: 's4', lk: false } },
                                        { state: { stamp: 's1', lk: false } },
                                        { state: { stamp: 's2', lk: false } } ],
                              locked: [ { state: { stamp: 's3', lk: true } } ]
                            } ],
        [ true  , ['s2','s3'] , { active: [ { state: { stamp: 's1', lk: false } } ],
                                  locked: [ { state: { stamp: 's2', lk: true } },
                                            { state: { stamp: 's3', lk: true } },
                                            { state: { stamp: 's4', lk: true } } ]
                                } ],
        [ false , ['s1','s4'] , { active: [ { state: { stamp: 's1', lk: false } },
                                            { state: { stamp: 's4', lk: false } },
                                            { state: { stamp: 's2', lk: false } } ],
                                  locked: [ { state: { stamp: 's3', lk: true } } ]
                                } ],
      ], function(e, d) {
        it('should set lock for <stamps>, '+d, function() {
          this.ret = this.gameTemplatesService
            .lockStamps(e.lock, e.stamps, this.templates);

          this.thenExpect(this.ret, function(templates) {
            expect(templates)
              .toEqual(e.result);
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
      }
    ]));

    describe('setLock(<set>)', function() {
      it('should set lock for <template>', function() {
        this.template = { state: { dsp: [] } };
        
        this.template = this.templateService
          .setLock(true, this.template);
        expect(this.templateService.isLocked(this.template))
          .toBeTruthy();
        
        this.template = this.templateService
          .setLock(false, this.template);
        expect(this.templateService.isLocked(this.template))
          .toBeFalsy();
      });
    });
  });
});
