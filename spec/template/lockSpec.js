'use strict';

describe('lock template', function() {
  describe('templatLockedMode service', function() {
    beforeEach(inject([
      'templateLockedMode',
      function(templateLockedModeService) {
        this.templateLockedModeService = templateLockedModeService;
        this.gameService = spyOnService('game');
        this.modesService = spyOnService('modes');
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection',
                  templates: 'templates' },
          modes: 'modes',
        };
      }
    ]));

    when('user unlocks current template selection', function() {
      this.templateLockedModeService.actions.unlock(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = 'stamp';
      });

      it('should get current selection', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute lockTemplates command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('lockTemplates', ['stamp'], false,
                                this.scope, this.scope.game);
      });

      it('should switch to correct mode', function() {
        expect(this.gameTemplatesService.modeForStamp)
          .toHaveBeenCalledWith('stamp', 'templates');
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('gameTemplates.modeForStamp.returnValue',
                                this.scope, 'modes');
      });
    });
  });

  describe('templateMode service', function() {
    beforeEach(inject([
      'templateMode',
      function(templateModeService) {
        this.templateModeService = templateModeService;
        this.gameService = spyOnService('game');
        this.modesService = spyOnService('modes');
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');

        this.scope = {
          game: { template_selection: 'selection',
                  templates: 'templates' },
          modes: 'modes',
        };
      }
    ]));

    when('user locks current template selection', function() {
      this.templateModeService.actions.lock(this.scope);
    }, function() {
      beforeEach(function() {
        this.gameTemplateSelectionService.get._retVal = 'stamp';
      });

      it('should get current selection', function() {
        expect(this.gameTemplateSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
      });

      it('should execute lockTemplates command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('lockTemplates', ['stamp'], true,
                                this.scope, this.scope.game);
      });

      it('should switch to correct mode', function() {
        expect(this.gameTemplatesService.modeForStamp)
          .toHaveBeenCalledWith('stamp', 'templates');
        expect(this.modesService.switchToMode)
          .toHaveBeenCalledWith('gameTemplates.modeForStamp.returnValue',
                                this.scope, 'modes');
      });
    });
  });

  describe('lockTemplatesCommand service', function() {
    beforeEach(inject([
      'lockTemplatesCommand',
      function(lockTemplatesCommandService) {
        this.lockTemplatesCommandService = lockTemplatesCommandService;
        this.templateService = spyOnService('template');
        this.gameTemplatesService = spyOnService('gameTemplates');
        this.gameTemplateSelectionService = spyOnService('gameTemplateSelection');
      }
    ]));

    when('execute(<stamps>, <lock>, <scope>, <game>)', function() {
      this.ctxt = this.lockTemplatesCommandService
        .execute(this.stamps, this.lock, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.stamps = ['stamp1', 'stamp2', 'stamp3'];
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };

        this.gameTemplatesService.isActive.and.callFake(function(s) {
          return (s === 'stamp1' || s === 'stamp3');
        });
        this.gameTemplatesService.isLocked.and.callFake(function(s) {
          return (s === 'stamp2');
        });
      });

      using([
        [ 'lock', 'desc'  , 'action'      , 'stamps' ],
        [ true  , 'lock'  , 'lockStamps'  , ['stamp1','stamp3'] ],
        [ false , 'unlock', 'unlockStamps', ['stamp2'] ],
      ], function(e, d) {
        when('lock is '+e.lock, function() {
          this.lock = e.lock;
        }, function() {
          it('should lock active <stamps>', function() {
            expect(this.gameTemplatesService[e.action])
              .toHaveBeenCalledWith(e.stamps, 'templates');
            expect(this.game.templates)
              .toBe('gameTemplates.'+e.action+'.returnValue');
          });
          
          it('should return ctxt', function() {
            expect(this.ctxt)
              .toEqual({
                stamps: e.stamps,
                desc: e.desc
              });
          });
        });
      });

      it('should emit createTemplate gameEvent', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('createTemplate');
      });
    });

    when('replay(<ctxt>, <scope>, <game>)', function() {
      this.lockTemplatesCommandService.replay(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          stamps: [ 'stamp1', 'stamp2' ],
        };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };
      });
      
      using([
        [ 'desc'   , 'action' ],
        [ 'lock'   , 'lockStamps' ],
        [ 'unlock' , 'unlockStamps' ],
      ], function(e, d) {
        when('desc is '+e.desc, function() {
          this.ctxt.desc = e.desc;
        }, function() {
          it('should '+e.lock+' <stamps>', function() {
            expect(this.gameTemplatesService[e.action])
              .toHaveBeenCalledWith(['stamp1', 'stamp2'], 'templates');
            expect(this.game.templates)
              .toBe('gameTemplates.'+e.action+'.returnValue');
          });

          it('should set remote templateSelection to modified templates', function() {
            expect(this.gameTemplateSelectionService.set)
              .toHaveBeenCalledWith('remote', 'stamp2', this.scope, 'selection');
          });
          
          it('should emit createTemplate gameEvent', function() {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('createTemplate');
          });
        });
      });
    });

    when('undo(<ctxt>, <scope>, <game>)', function() {
      this.lockTemplatesCommandService.undo(this.ctxt, this.scope, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          stamps: [ 'stamp1', 'stamp2' ],
        };
        this.scope = jasmine.createSpyObj('scope', [
          'gameEvent'
        ]);
        this.game = { templates: 'templates',
                      template_selection: 'selection' };
      });
      
      using([
        [ 'desc'   , 'action' ],
        [ 'lock'   , 'unlockStamps' ],
        [ 'unlock' , 'lockStamps' ],
      ], function(e, d) {
        when('desc is '+e.desc, function() {
          this.ctxt.desc = e.desc;
        }, function() {
          it('should '+e.lock+' <stamps>', function() {
            expect(this.gameTemplatesService[e.action])
              .toHaveBeenCalledWith(['stamp1', 'stamp2'], 'templates');
            expect(this.game.templates)
              .toBe('gameTemplates.'+e.action+'.returnValue');
          });

          it('should set remote templateSelection to modified templates', function() {
            expect(this.gameTemplateSelectionService.set)
              .toHaveBeenCalledWith('remote', 'stamp2', this.scope, 'selection');
          });
          
          it('should emit createTemplate gameEvent', function() {
            expect(this.scope.gameEvent)
              .toHaveBeenCalledWith('createTemplate');
          });
        });
      });
    });
  });

  describe('gameTemplatesCommand service', function() {
    beforeEach(inject([
      'gameTemplates',
      function(gameTemplatesService) {
        this.gameTemplatesService = gameTemplatesService;
        this.templateService = spyOnService('template');
      }
    ]));

    using([
      [ 'action', 'active', 'locked' ],
      [ 'lockStamps', [ { state: { stamp: 'stamp3' } }
                      ], [ { state: { stamp: 'stamp4' } },
                           { state: { stamp: 'stamp1' } },
                           // handle already locked templates
                           { state: { stamp: 'stamp2' } },
                         ] ],
      [ 'unlockStamps', [ { state: { stamp: 'stamp3' } },
                          // handle already active templates
                          { state: { stamp: 'stamp1' } },
                          { state: { stamp: 'stamp2' } },
                        ], [ { state: { stamp: 'stamp4' } }
                           ] ],
    ], function(e, d) {
      describe(e.action+'(<stamps>)', function() {
        beforeEach(function() {
          this.stamps = [ 'stamp1', 'stamp2' ];
          this.templates = {
            active: [ { state: { stamp: 'stamp1' } },
                      { state: { stamp: 'stamp3' } } ],
            locked: [ { state: { stamp: 'stamp2' } },
                      { state: { stamp: 'stamp4' } } ]
          };
          
          this.ret = this.gameTemplatesService[e.action](this.stamps,
                                                         this.templates);
        });
        
        it('should '+e.action, function() {
          expect(this.ret.active)
            .toEqual(e.active);
          expect(this.ret.locked)
            .toEqual(e.locked);
        });
      });
    });
  });
});
