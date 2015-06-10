'use strict';

describe('load game', function() {
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
          this.scope.data_ready = {
            then: function(fn) { fn(); }
          };
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
      this.gamesService.loadLocalGames.resolve(['game1','game2']);
    }, function() {
      when('loading an offline game', function() {
        this.params.where = 'offline';
      }, function() {
        when('the game does not exist', function() {
          this.params.id = '4';
        }, function() {
          it('should return to the lounge page', function() {
            expect(this.scope.goToState)
              .toHaveBeenCalledWith('lounge');
          });
        });

        when('the game exists', function() {
          this.params.id = '1';
        }, function() {
          it('should return not to the lounge page', function() {
            expect(this.scope.goToState)
              .not.toHaveBeenCalled();
          });

          it('should load game', function() {
            expect(this.gameService.load)
              .toHaveBeenCalledWith(this.scope, 'game2');
            expect(this.scope.game)
              .toBe('game.load.returnValue');
          });
        });
      });
    });
  });

  describe('game service', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
    }]));

    describe('load(scope)', function() {
      beforeEach(function() {
        this.commandsService = spyOnService('commands');

        this.game = {
          players: { p1: { name: 'p1' } },
          commands: ['cmd1', 'cmd2']
        };
        this.scope = { 'this': 'scope',
                       deferDigest: jasmine.createSpy('deferDigest'),
                       gameEvent: jasmine.createSpy('gameEvent'),
                     };
        this.ret = this.gameService.load(this.scope, this.game);
      });

      it('should extend game with default values', function() {
        expect(this.ret)
          .toEqual({
            players: { p1: { name: 'p1' },
                       p2: { name: null }
                     },
            board: {},
            scenario: {},
            commands: [ 'cmd1', 'cmd2' ],
            undo: [],
            dice: [],
            ruler: {
              local: {
                display: false,
                start: { x:0, y: 0 },
                end: { x:0, y: 0 },
                length: null,
              },
              remote: {
                display: false,
                start: { x:0, y: 0 },
                end: { x:0, y: 0 },
                length: null,
              },
            },
            models: { active: [], locked: [] },
            templates: { active: [], locked: [] },
            template_selection: { local: { stamps: [] },
                                  remote: { stamps: [] }
                                },
          });
      });

      it('should replay commands', function() {
        expect(this.commandsService.replay)
          .toHaveBeenCalledWith('cmd1', this.scope, this.ret);
        expect(this.commandsService.replay)
          .toHaveBeenCalledWith('cmd2', this.scope, this.ret);
      });

      it('should send Loading and Loaded event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('gameLoading');
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('gameLoaded');
      });

      it('should refresh scope', function() {
        expect(this.scope.deferDigest)
          .toHaveBeenCalled();
      });
    });
  });
});
