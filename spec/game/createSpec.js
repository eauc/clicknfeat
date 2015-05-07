'use strict';

describe('game create', function() {

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
        this.stateService = jasmine.createSpyObj('$state', ['go']);
        this.gameService = spyOnService('game');
        this.gamesService = spyOnService('games');

        this.createController = function() {
          this.scope = $rootScope.$new();
          this.scope.checkUser = function() {};

          $controller('loungeCtrl', { 
            '$scope': this.scope,
            '$state': this.stateService
          });
          $rootScope.$digest();
        };
      }
    ]));

    describe('doCreateLocalGame()', function() {
      beforeEach(function() {
        this.createController();
        this.scope.user = { name: 'user' };
        this.scope.doCreateLocalGame();
      });

      it('should create a new game', function() {
        expect(this.gameService.create)
          .toHaveBeenCalledWith(this.scope.user);
      });

      it('should store the new game locally', function() {
        expect(this.gamesService.storeNewLocalGame)
          .toHaveBeenCalledWith('game.create.returnValue');
      });

      it('should go to game page', function() {
        expect(this.stateService.go)
          .toHaveBeenCalledWith('game', {
            where: 'offline',
            id: 'games.storeNewLocalGame.returnValue'
          });
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

    describe('storeNewLocalGame(<game>)', function() {
      beforeEach(function() {
        this.game = 'new_game';
        this.localStorage.getItem
          .and.returnValue('["game1","game2"]');
      });

      it('should retrieve local games from local storage', function() {
        this.gamesService.storeNewLocalGame(this.game);

        expect(this.localStorage.getItem)
          .toHaveBeenCalledWith('clickApp.local_games');
      });

      it('should append new game to local games and store them', function() {
        this.gamesService.storeNewLocalGame(this.game);

        expect(this.localStorage.setItem)
          .toHaveBeenCalledWith('clickApp.local_games',
                                '["game1","game2","new_game"]');
      });

      it('should return the new game index', function() {
        expect(this.gamesService.storeNewLocalGame(this.game))
          .toBe(2);
      });
    });
  });
});
