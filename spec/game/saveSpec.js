'use strict';

describe('save game', function() {
  describe('gameCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.gameService = spyOnService('game');
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
        this.params = { where: 'offline', id: '0' };
        this.createController(this.params);
        this.gamesService.loadLocalGames.resolve([ 'game1', 'game2' ]);
      }
    ]));

    when('game is saved', function() {
      this.scope.saveGame('new_game');
    }, function() {
      it('should update current game', function() {
        expect(this.scope.game)
          .toBe('new_game');
      });

      it('should store local games', function() {
        expect(this.gamesService.storeLocalGames)
          .toHaveBeenCalledWith(['new_game','game2']);
      });
    });
  });
});
