'use strict';

describe('user', function() {

  beforeEach(function() {
    module('clickApp.controllers');
    module('clickApp.services');
  });

  describe('loungeCtrl', function(c) {

    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.userService = spyOnService('user');

        this.createController = function() {
          this.scope = $rootScope.$new();
          this.scope.checkUser = function() {};
          this.scope.user = { name: 'user' };
          $controller('loungeCtrl', { 
            '$scope': this.scope,
            '$state': {}
          });
          $rootScope.$digest();
        };
      }
    ]));

    when('page loads', function() {
      this.createController();
    }, function() {
      it('should get user description', function() {
        expect(this.userService.description)
          .toHaveBeenCalledWith({ name: 'user' });
        expect(this.scope.user_desc)
          .toBe('user.description.returnValue');
      });
    });
  });

  describe('user service', function() {
    beforeEach(inject([ 'user', function(userService) {
      this.userService = userService;
    }]));

    describe('description()', function() {
      using([
        [ 'user', 'desc' ],
        [ {}    , ''     ],
        [ { name: 'user' }, 'User' ],
        [ { name: 'user',
            language: 'FR,EN' }, 'User[FR,EN]' ],
        [ { name: 'user',
            language: 'FR,EN',
            chat: 'skype' }, 'User[FR,EN skype]' ],
        [ { name: 'user',
            faction: ['loe', 'cryx'] }, 'User - Loe,Cryx' ],
        [ { name: 'user',
            faction: ['loe', 'cryx'],
            game_size: '50,35' }, 'User - Loe,Cryx[50,35pts]' ],
        [ { name: 'user',
            ck_position: ['Missionary', '49'] }, 'User - likes Missionary,49' ],
      ], function(e, d) {
        it('should return a description string for user, '+d, function() {
          expect(this.userService.description(e.user))
            .toBe(e.desc);
        });
      });
    });
  });
});
