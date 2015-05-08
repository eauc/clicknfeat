'use strict';

describe('load game', function() {

  beforeEach(function() {
    module('clickApp.controllers');
    module('clickApp.services');
  });

  describe('gameCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.gameService = spyOnService('game');
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
        this.params = {};
      }
    ]));

    when('page loads', function() {
      this.createController(this.params);
    }, function() {
      when('loading an offline game', function() {
        this.params.where = 'offline';
      }, function() {
        when('the game does not exist', function() {
          this.params.id = '4';
          this.gamesService.loadLocalGames._retVal = ['game1','game2'];
        }, function() {
          it('should return to the lounge page', function() {
            expect(this.scope.goToState)
              .toHaveBeenCalledWith('lounge');
          });
        });

        when('the game exists', function() {
          this.params.id = '1';
          this.gamesService.loadLocalGames._retVal = ['game1','game2'];
        }, function() {
          it('should return not to the lounge page', function() {
            expect(this.scope.goToState)
              .not.toHaveBeenCalled();
          });

          it('should load game', function() {
            expect(this.scope.game)
              .toBe('game2');
          });
        });
      });
    });
  });

  describe('game service', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
    }]));
  });
});
