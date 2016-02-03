describe('user model', function() {
  beforeEach(inject([
    'user',
    function(userModel) {
      this.userModel = userModel;

      this.localStorageService = spyOnService('localStorage');
      this.userConnectionService = spyOnService('userConnection');
    }
  ]));

  context('load()', function() {
    return this.userModel.loadP();
  }, function() {
    it('should read user data from local storage', function() {
      expect(this.localStorageService.loadP)
        .toHaveBeenCalledWith('clickApp.user');
    });

    it('should create userConnection', function() {
      expect(this.userConnectionService.init)
        .toHaveBeenCalledWith({ state: 'localStorage.loadP.returnValue' });
      expect(this.context).toBe('userConnection.init.returnValue');
    });
  });

  context('save()', function() {
    return this.userModel.save(this.user);
  }, function() {
    beforeEach(function() {
      this.user = { state: { name: 'exemple' },
                    connection: 'connection'
                  };
    });

    it('should save user in local storage', function() {
      expect(this.localStorageService.save)
        .toHaveBeenCalledWith('clickApp.user', this.user.state);

      expect(this.context).toEqual(this.user);
    });
  });

  context('isValid()', function() {
    return this.userModel.isValid(this.user);
  }, function() {
    example(function(e, d) {
      context(d, function() {
        this.user = { state: e.state };
      }, function() {
        it('should check if user is valid', function() {
          expect(this.context).toBe(e.is_valid);
        });
      });
    }, [
      [ 'state'              , 'is_valid' ],
      [ { toto: 'toto' }     , false ],
      [ { name: null }       , false ],
      [ { name: '   ' }      , false ],
      [ { name: 'toto' }     , true ],
      [ { name: ' to to  ' } , true ],
    ]);
  });

  context('description()', function() {
    return this.userModel.description(this.user);
  }, function() {
    example(function(e, d) {
      context(d, function() {
        this.user = { state: e.user };
      }, function() {
        it('should return a description string for user', function() {
          expect(this.context).toBe(e.desc);
        });
      });
    }, [
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
    ]);
  });
});
