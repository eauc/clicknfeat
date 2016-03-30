describe('user model', function() {
  beforeEach(inject([
    'user',
    function(userModel) {
      this.userModel = userModel;

      this.httpService = spyOnService('http');
      this.localStorageService = spyOnService('localStorage');
      this.userConnectionModel = spyOnService('userConnection');
      this.userConnectionModel.openP
        .resolveWith(R.identity);
      this.userConnectionModel.close
        .and.callFake(R.identity);

      this.user = {
        state: { stamp: null },
        connection: 'connection'
      };
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
      expect(this.userConnectionModel.init)
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
          language: 'FR,EN' }, 'User [FR,EN]' ],
      [ { name: 'user',
          language: 'FR,EN',
          chat: 'skype' }, 'User [FR,EN skype]' ],
      [ { name: 'user',
          faction: ['loe', 'cryx'] }, 'User - Loe,Cryx' ],
      [ { name: 'user',
          faction: ['loe', 'cryx'],
          game_size: '50,35' }, 'User - Loe,Cryx[50,35pts]' ],
      [ { name: 'user',
          ck_position: ['Missionary', '49'] }, 'User - likes Missionary,49' ],
    ]);
  });

  context('toggleOnlineP()', function() {
    return this.userModel
      .toggleOnlineP(this.user);
  }, function() {
    beforeEach(function() {
      spyOn(this.userModel, 'checkOnlineP')
        .and.returnValue('user.checkOnlineP.returnValue');
      this.userModel.checkOnlineP$ =
        R.curryN(2, this.userModel.checkOnlineP);

      this.user.state.stamp = 'stamp';
    });

    context('when user is online', function() {
      this.user.state.online = true;
    }, function() {
      it_should_set_user_offline();
    });

    context('when user is offline', function() {
      this.user.state.online = false;
    }, function() {
      it('should try to go online', function() {
        expect(this.userModel.checkOnlineP)
          .toHaveBeenCalledWith({
            state: { stamp: 'stamp', online: true },
            connection: 'connection'
          });
        expect(this.context)
          .toBe('user.checkOnlineP.returnValue');
      });
    });
  });

  context('checkOnline()', function() {
    return this.userModel
      .checkOnlineP(this.user);
  }, function() {
    context('when user is not online', function() {
      this.user.state.stamp = 'stamp';
      this.user.state.online = false;
    }, function() {
      it('should not call server', function() {
        expect(this.httpService.putP)
          .not.toHaveBeenCalled();
        expect(this.httpService.postP)
          .not.toHaveBeenCalled();
      });

      it_should_set_user_offline();
    });

    context('when user is online', function() {
      this.user.state.online = true;
    }, function() {
      context('when user does not have stamp', function() {
        this.user.state.stamp = null;
      }, function() {
        it_should_try_to_create_new_user();
      });

      context('when user has stamp', function() {
        this.user.state.stamp = 'stamp';
      }, function() {
        it('should try to update user on server', function() {
          expect(this.httpService.putP)
            .toHaveBeenCalledWith('/api/users/stamp', {
              stamp: 'stamp', online: true
            });
        });

        context('when update succeeds', function() {
          this.httpService.putP
            .resolveWith({
              stamp: 'stamp',
              server: 'update'
            });
        }, function() {
          it('should not create new user on server', function() {
            expect(this.httpService.postP)
              .not.toHaveBeenCalled();
          });

          it_should_set_user_online();
        });

        context('when update fails', function() {
          this.httpService.putP
            .rejectWith('reason');
        }, function() {
          it_should_try_to_create_new_user();
        });
      });
    });
  });
  function it_should_try_to_create_new_user() {
    it('should try to create new user on server', function() {
      expect(this.httpService.postP)
        .toHaveBeenCalledWith('/api/users', this.user.state);
    });

    context('when creation fails', function() {
      this.httpService.postP
        .rejectWith('reason');
    }, function() {
      it_should_set_user_offline();
    });

    context('when creation succeeds', function() {
      this.httpService.postP.resolveWith({
        stamp: 'stamp',
        server: 'update'
      });
    }, function() {
      it_should_set_user_online();
    });
  }
  function it_should_set_user_offline() {
    it('should set user offline', function() {
      expect(this.userConnectionModel.close)
        .toHaveBeenCalledWith(this.context);
      expect(this.context.state.stamp)
        .toBe(this.user.state.stamp);
      expect(this.userModel.online(this.context))
        .toBeFalsy();
    });
  }
  function it_should_set_user_online() {
    it('should set user online', function() {
      expect(this.userConnectionModel.openP)
        .toHaveBeenCalledWith({
          state: {
            stamp: 'stamp',
            server: 'update'
          },
          connection: 'connection'
        });
      expect(this.userModel.online(this.context))
        .toBeTruthy();
    });
  }
});
