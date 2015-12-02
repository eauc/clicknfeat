'use strict';

describe('user load', function() {
  describe('user service', function() {
    beforeEach(inject([ 'user', function(userService) {
      this.userService = userService;

      this.userConnectionService = spyOnService('userConnection');
      mockReturnPromise(this.userConnectionService.close);
      this.userConnectionService.close.resolveWith = R.identity;
      mockReturnPromise(this.userConnectionService.open);
      this.userConnectionService.open.resolveWith = R.identity;

      this.httpService = spyOnService('http');
      mockReturnPromise(this.httpService.put);
      this.httpService.put.resolveWith = 'http.put.returnValue';
      mockReturnPromise(this.httpService.post);
      this.httpService.post.resolveWith = 'http.post.returnValue';
      mockReturnPromise(this.httpService.delete);
      this.httpService.delete.resolveWith = 'http.delete.returnValue';
      
      this.localStorageService.save.resolveWith = 'localStorage.save.returnValue';

      this.user = {
        state: { stamp: null },
        connection: 'connection',
      };
    }]));

    when('toggleOnline()', function() {
      this.ret = this.userService.toggleOnline(this.user);
    }, function() {
      beforeEach(function() {
        spyOn(this.userService, 'checkOnline')
          .and.returnValue('user.checkOnline.returnValue');
        this.user.state.stamp = 'stamp';
      });

      when('user is online', function() {
        this.user.state.online = true;
      }, function() {
        it('should delete user on server', function() {
          this.thenExpect(this.ret, function() {
            expect(this.httpService.delete)
              .toHaveBeenCalledWith('/api/users/stamp');
          });
        });

        it_should_set_user_offline();
      });

      when('user is not offline', function() {
        this.user.state.online = false;
      }, function() {
        it('should try to go online', function() {
          expect(this.userService.checkOnline)
            .toHaveBeenCalledWith({
              state: { stamp: 'stamp', online: true },
              connection: 'connection'
            });
          expect(this.ret)
            .toBe('user.checkOnline.returnValue');
        });
      });
    });
    
    when('checkOnline()', function() {
      this.ret = this.userService.checkOnline(this.user);
    }, function() {
      when('user is not online', function() {
        this.user.state.online = false;
      }, function() {
        it('should not call server', function() {
          this.thenExpect(this.ret, function() {
            expect(this.httpService.put)
              .not.toHaveBeenCalled();
            expect(this.httpService.post)
              .not.toHaveBeenCalled();
          });
        });

        it_should_set_user_offline();
      });

      when('user is online', function() {
        this.user.state.online = true;
      }, function() {
        when('user does not have stamp', function() {
          this.user.state.stamp = null;
        }, function() {
          it_should_try_to_create_new_user();
        });
        
        when('user has stamp', function() {
          this.user.state.stamp = 'stamp';
        }, function() {
          it('should try to update user on server', function() {
            this.thenExpect(this.ret, function() {
              expect(this.httpService.put)
                .toHaveBeenCalledWith('/api/users/stamp', {
                  stamp: 'stamp', online: true
                });
            });
          });

          when('update succeeds', function() {
            this.httpService.put.resolveWith = {
              stamp: 'stamp',
              server: 'update'
            };
          }, function() {
            it('should not create new user on server', function() {
              this.thenExpect(this.ret, function() {
                expect(this.httpService.post)
                  .not.toHaveBeenCalled();
              });
            });

            it_should_set_user_online();
          });

          when('update fails', function() {
            this.httpService.put.rejectWith = 'reason';
          }, function() {
            it_should_try_to_create_new_user();
          });
        });
      });
    });
  });
});

function it_should_try_to_create_new_user() {
  it('should try to create new user on server', function() {
    this.thenExpect(this.ret, function() {
      expect(this.httpService.post)
        .toHaveBeenCalledWith('/api/users', this.user.state);
    });
  });
  
  when('creation fails', function() {
    this.httpService.post.rejectWith = 'reason';
  }, function() {
    it_should_set_user_offline();
  });
  
  when('creation succeeds', function() {
    this.httpService.post.resolveWith = {
      stamp: 'stamp',
      server: 'update'
    };
  }, function() {
    it_should_set_user_online();
  });
}

function it_should_set_user_offline() {
  it('should set user offline', function() {
    this.thenExpect(this.ret, function(user) {
      expect(this.userConnectionService.close)
        .toHaveBeenCalledWith(this.user);
      expect(user.state.stamp)
        .toBe(null);
      expect(this.userService.online(user))
        .toBeFalsy();
      expect(this.localStorageService.save)
        .toHaveBeenCalledWith('clickApp.user', user.state);
    });
  });
}
function it_should_set_user_online() {
  it('should set user online', function() {
    this.thenExpect(this.ret, function(user) {
      expect(this.userConnectionService.open)
        .toHaveBeenCalledWith({
          state: {
            stamp: 'stamp',
            server: 'update'
          },
          connection: 'connection'
        });
      expect(this.userService.online(user))
        .toBeTruthy();
      expect(this.localStorageService.save)
        .toHaveBeenCalledWith('clickApp.user', user.state);
    });
  });
}
