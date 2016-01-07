describe('user', function() {
  describe('user service', function() {
    beforeEach(inject([ 'user', function(userService) {
      this.userService = userService;
    }]));

    when('isValid()', function() {
      this.ret = this.userService.isValid(this.user);
    }, function() {
      using([
        [ 'state'              , 'is_valid' ],
        [ { toto: 'toto' }     , false ],
        [ { name: null }       , false ],
        [ { name: '   ' }      , false ],
        [ { name: 'toto' }     , true ],
        [ { name: ' to to  ' } , true ],
      ], function(e, d) {
        when(d, function() {
          this.user = { state: e.state };
        }, function() {
          it('should check if user is valid', function() {
            expect(this.ret).toBe(e.is_valid);
          });
        });
      });
    });
    when('description()', function() {
      this.ret = this.userService.description(this.user);
    }, function() {
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
        when(d, function() {
          this.user = { state: e.user };
        }, function() {
          it('should return a description string for user', function() {
            expect(this.ret)
              .toBe(e.desc);
          });
        });
      });
    });
  });
});
