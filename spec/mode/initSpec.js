'use strict';

describe('init modes', function() {
  describe('gameCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.modesService = spyOnService('modes');
        this.gamesService = spyOnService('games');
        mockReturnPromise(this.gamesService.loadLocalGames);

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
        this.params = {};
      }
    ]));

    when('page loads', function() {
      this.createController(this.params);
        this.gamesService.loadLocalGames.resolve([ 'game1' ]);
    }, function() {
      beforeEach(function() {
        this.params = { where: 'offline', id: '0' };
      });

      it('should init modes', function() {
        expect(this.modesService.init)
          .toHaveBeenCalledWith(this.scope);
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
        this.defaultModeService.onEnter = jasmine.createSpy('onEnter');
        this.defaultModeService.actions.test = jasmine.createSpy('testAction');
        this.defaultModeService.bindings.test = 'ctrl+test';
        this.defaultModeService.buttons = [ 'testButtons' ];
        spyOn(Mousetrap, 'reset');
        spyOn(Mousetrap, 'bind');
      }
    ]));

    describe('init(<scope>)', function() {
      beforeEach(function() {
        this.scope = { 'this': 'scope' };
        this.ret = this.modesService.init(this.scope);
      });

      it('should start in default mode', function() {
        expect(this.modesService.currentModeName(this.ret))
          .toBe('Default');
      });

      it('should enter default mode', function() {
        expect(this.defaultModeService.onEnter)
          .toHaveBeenCalledWith(this.scope);
      });

      it('should reset Mousetrap bindings', function() {
        expect(Mousetrap.reset)
          .toHaveBeenCalled();
      });

      it('should setup default mode\'s buttons', function() {
        expect(this.scope.action_buttons)
          .toEqual(this.defaultModeService.buttons);
        expect(this.scope.action_bindings.test)
          .toBe('ctrl+test');
      });

      it('should setup default mode\'s Mousetrap bindings', function() {
        expect(Mousetrap.bind)
          .toHaveBeenCalledWith('ctrl+test', jasmine.any(Function));
      });

      describe('Mousetrap binding', function() {
        beforeEach(function() {
          this.binding = findCallByArgs(Mousetrap.bind,
                                        function(args) {
                                          return args[0] === 'ctrl+test';
                                        }).args[1];
          this.event = jasmine.createSpyObj('event', ['preventDefault']);
          this.binding(this.event);
        });

        it('should should call associated mode action', function() {
          expect(this.defaultModeService.actions.test)
            .toHaveBeenCalledWith(this.scope);
        });

        it('should prevent event default', function() {
          expect(this.event.preventDefault)
            .toHaveBeenCalled();
        });
      });
    });
  });
});
