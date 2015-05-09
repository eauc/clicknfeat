'use strict';

describe('on mode action', function() {
  describe('gameCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.modesService = spyOnService('modes');
        this.gamesService = spyOnService('games');

        this.createController = function(params) {
          this.scope = $rootScope.$new();
          this.scope.checkUser = function() {};
          this.scope.goToState = jasmine.createSpy('goToState');
          this.state = { current: { name: 'game.main' } };

          $controller('gameCtrl', { 
            '$scope': this.scope,
            '$state': this.state,
            '$stateParams': params
          });
          $rootScope.$digest();
        };
        this.params = { where: 'offline', id: '0' };
        this.gamesService.loadLocalGames._retVal = ['game1'];
        this.createController(this.params);
      }
    ]));

    when('a mode action occurs', function() {
      this.scope.doModeAction('action');
    }, function() {
      it('proxy currentModeAction', function() {
        expect(this.modesService.currentModeAction)
          .toHaveBeenCalledWith('modes.init.returnValue',
                                'action',
                                this.scope);
      });
    });

    when('a mode action button is clicked', function() {
      this.scope.doActionButton(this.action);
    }, function() {
      beforeEach(function() {
        spyOn(this.scope, 'doModeAction');
      });

      when('button is a toggle group button', function() {
        this.action = ['test', 'toggle', 'test' ];
      }, function() {
        it('should set action group flag', function() {
          expect(this.scope.show_action_group)
            .toBe('test');
        });

        it('should not proxy doModeAction', function() {
          expect(this.scope.doModeAction)
            .not.toHaveBeenCalled();
        });
      });

      when('button is an action button', function() {
        this.action = ['test', 'testAction', 'test' ];
      }, function() {
        it('should proxy doModeAction', function() {
          expect(this.scope.doModeAction)
            .toHaveBeenCalledWith('testAction');
        });
      });
    });
  });

  describe('modesService', function() {
    beforeEach(inject([
      'modes',
      'defaultMode',
      'allModes',
      function(modesService, defaultModeService) {
        this.modesService = modesService;
        this.defaultModeService = defaultModeService;
        spyOn(this.defaultModeService.actions, 'zoomIn');
      }
    ]));

    describe('currentModeAction', function() {
      beforeEach(function() {
        this.scope = { 'this': 'scope' };
        this.modes = this.modesService.init(this.scope);
        this.modesService.currentModeAction(this.modes,
                                            'zoomIn',
                                            this.scope);
      });

      it('should proxy current mode\'s action', function() {
        expect(this.defaultModeService.actions.zoomIn)
          .toHaveBeenCalledWith(this.scope);
      });
    });
  });
});
