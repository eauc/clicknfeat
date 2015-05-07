'use strict';

describe('local game', function() {

  beforeEach(function() {
    module('clickApp.controllers');
    module('clickApp.services');

    this.localStorage = jasmine.createSpyObj('localStorage', [
      'setItem',
      'getItem'
    ]);
    module({
      'localStorage': this.localStorage,
    });
  });

  describe('loungeCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.gameService = spyOnService('game');
        this.gamesService = spyOnService('games');

        this.createController = function() {
          this.scope = $rootScope.$new();
          this.scope.checkUser = function() {};
          this.scope.goToState = jasmine.createSpy('goToState');

          $controller('loungeCtrl', { 
            '$scope': this.scope
          });
          $rootScope.$digest();
        };
      }
    ]));

    when('page loads', function() {
      this.createController();
    }, function() {
      it('should load local games', function() {
        expect(this.gamesService.loadLocalGames)
          .toHaveBeenCalled();
        expect(this.scope.local_games)
          .toBe('games.loadLocalGames.returnValue');
      });
    });

    when('user create local game', function() {
      this.scope.doCreateLocalGame();
    }, function() {
      beforeEach(function() {
        this.createController();
        this.scope.user = { name: 'user' };
        this.scope.local_games = ['game1','game2'];
      });

      it('should create a new game', function() {
        expect(this.gameService.create)
          .toHaveBeenCalledWith(this.scope.user);
      });

      it('should store the new game locally', function() {
        expect(this.gamesService.storeLocalGames)
          .toHaveBeenCalledWith(['game1','game2','game.create.returnValue']);
      });

      it('should go to game page', function() {
        expect(this.scope.goToState)
          .toHaveBeenCalledWith('game', {
            where: 'offline',
            id: 2
          });
      });
    });
    
    when('user load local game', function() {
      this.scope.local_games_selection = [42];
      this.scope.doLoadLocalGame();
    }, function() {
      beforeEach(function() {
        this.createController();
      });
      
      it('should go to game page', function() {
        expect(this.scope.goToState)
          .toHaveBeenCalledWith('game', { where: 'offline', id: 42 });
      });
    });
    
    when('user delete local game', function() {
      this.scope.local_games_selection = [1];
      this.scope.local_games = ['game1','game2','game3'];
      this.scope.doDeleteLocalGame();
    }, function() {
      beforeEach(function() {
        this.createController();
      });
      
      it('should delete game selection from local storage', function() {
        expect(this.gamesService.storeLocalGames)
          .toHaveBeenCalledWith(['game1','game3']);
      });
    });
  });

  describe('game service', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
    }]));

    describe('create(<user>)', function() {
      it('should create default game', function() {
        expect(this.gameService.create({ name: 'user' }))
          .toEqual({
            players: {
              p1: { name: 'user' },
              p2: { name: null   }
            }
          });
      });
    });
  });

  describe('games service', function() {
    beforeEach(inject([
      'games',
      function(gamesService) {
        this.gamesService = gamesService;
      }
    ]));

    describe('loadLocalGames()', function() {
      beforeEach(function() {
        this.localStorage.getItem
          .and.returnValue('["game1","game2"]');
      });

      it('should retrieve local games from local storage', function() {
        expect(this.gamesService.loadLocalGames())
          .toEqual(['game1','game2']);
      });
    });

    describe('storeLocalGames(<games>)', function() {
      it('should append new game to local games and store them', function() {
        this.gamesService.storeLocalGames(["game1","game2"]);

        expect(this.localStorage.setItem)
          .toHaveBeenCalledWith('clickApp.local_games',
                                '["game1","game2"]');
      });
    });
  });
});
