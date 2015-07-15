'use strict';

describe('lock template', function() {
  describe('templatLockedMode service', function() {
    beforeEach(inject([
      'templateMode',
      function(templateModeService) {
        this.templateModeService = templateModeService;
        this.gameService = spyOnService('game');
        this.modesService = spyOnService('modes');
        this.templateService = spyOnService('template');
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection',
                  templates: 'templates' },
          modes: 'modes',
        };
      }
    ]));

    when('user toggles lock on current template selection', function() {
      this.templateModeService.actions.toggleLock(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = ['stamp'];
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
            expect(this.gameService.executeCommand)
              .toHaveBeenCalledWith('lockTemplates', e.set, ['stamp'],
                                    this.scope, this.scope.game);
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
      }
    ]));

    when('execute(<stamps>, <lock>, <scope>, <game>)', function() {
      this.ctxt = this.lockTemplatesCommandService
        .execute('lock', this.stamps, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2', 'stamp3'];
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates' };
      });

      it('should lock <stamps>', function() {
        expect(this.gameTemplatesService.lockStamps)
          .toHaveBeenCalledWith('lock', this.stamps, 'templates');
        expect(this.game.templates)
              .toBe('gameTemplates.lockStamps.returnValue');
      });
          
      it('should return ctxt', function() {
        expect(this.ctxt)
          .toEqual({
            stamps: this.stamps,
            desc: 'lock'
          });
      });

      it('should emit createTemplate gameEvent', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createTemplate');
      });
    });

    when('replay(<ctxt>, <scope>, <game>)', function() {
      this.lockTemplatesCommandService
        .replay(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          stamps: [ 'stamp1', 'stamp2' ],
          desc: 'lock',
        };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates' };
      });
      
      it('should lock <stamps>', function() {
        expect(this.gameTemplatesService.lockStamps)
          .toHaveBeenCalledWith('lock', ['stamp1', 'stamp2'], 'templates');
        expect(this.game.templates)
          .toBe('gameTemplates.lockStamps.returnValue');
      });

      it('should emit createTemplate gameEvent', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createTemplate');
      });
    });

    when('undo(<ctxt>, <scope>, <game>)', function() {
      this.lockTemplatesCommandService
        .undo(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          stamps: [ 'stamp1', 'stamp2' ],
          desc: false,
        };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates' };
      });
      
      it('should !lock <stamps>', function() {
        expect(this.gameTemplatesService.lockStamps)
          .toHaveBeenCalledWith(true, ['stamp1', 'stamp2'], 'templates');
        expect(this.game.templates)
          .toBe('gameTemplates.lockStamps.returnValue');
      });

      it('should emit createTemplate gameEvent', function() {
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

    describe('lockStamps(<lock>, <stamps>)', function() {
      beforeEach(function() {
        this.templates = {
          active: [ { state: { stamp: 's1', lk: false } },
                    { state: { stamp: 's2', lk: false } } ],
          locked: [ { state: { stamp: 's3', lk: true } },
                    { state: { stamp: 's4', lk: true } } ],
        };
      });

      using([
        [ 'lock', 'stamps', 'result' ],
        [ true  , ['s1']  , { active: [ { state: { stamp: 's2', lk: false } } ],
                              locked: [ { state: { stamp: 's1', lk: true } },
                                        { state: { stamp: 's3', lk: true } },
                                        { state: { stamp: 's4', lk: true } } ],
                            } ],
        [ false , ['s1']  , { active: [ { state: { stamp: 's1', lk: false } },
                                        { state: { stamp: 's2', lk: false } } ],
                              locked: [ { state: { stamp: 's3', lk: true } },
                                        { state: { stamp: 's4', lk: true } } ],
                            } ],
        [ true  , ['s3']  , { active: [ { state: { stamp: 's1', lk: false } },
                                        { state: { stamp: 's2', lk: false } } ],
                              locked: [ { state: { stamp: 's3', lk: true } },
                                        { state: { stamp: 's4', lk: true } } ],
                            } ],
        [ false , ['s4']  , { active: [ { state: { stamp: 's1', lk: false } },
                                        { state: { stamp: 's2', lk: false } },
                                        { state: { stamp: 's4', lk: false } } ],
                              locked: [ { state: { stamp: 's3', lk: true } } ],
                            } ],
        [ true  , ['s2','s3'] , { active: [ { state: { stamp: 's1', lk: false } } ],
                                  locked: [ { state: { stamp: 's2', lk: true } },
                                            { state: { stamp: 's3', lk: true } },
                                            { state: { stamp: 's4', lk: true } } ],
                                } ],
        [ false , ['s1','s4'] , { active: [ { state: { stamp: 's1', lk: false } },
                                            { state: { stamp: 's2', lk: false } },
                                            { state: { stamp: 's4', lk: false } } ],
                                  locked: [ { state: { stamp: 's3', lk: true } } ],
                                } ],
      ], function(e, d) {
        it('should set lock for <stamps>, '+d, function() {
          expect(this.gameTemplatesService.lockStamps(e.lock, e.stamps, this.templates))
            .toEqual(e.result);
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
        
        this.templateService.setLock(true, this.template);
        expect(this.templateService.isLocked(this.template))
          .toBeTruthy();
        
        this.templateService.setLock(false, this.template);
        expect(this.templateService.isLocked(this.template))
          .toBeFalsy();
      });
    });
  });
});
