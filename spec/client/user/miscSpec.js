'use strict';

describe('user', function() {
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
