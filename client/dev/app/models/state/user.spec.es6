describe('stateUser model', function() {
  beforeEach(inject([ 'stateUser', function(stateUserModel) {
    this.stateUserModel = stateUserModel;

    this.userModel = spyOnService('user');
    this.appStateService = spyOnService('appState');

    this.state = { user: { user: 'user' } };
  }]));

  context('onUserSetOnlineUsers', function() {
    return this.stateUserModel
      .onUserSetOnlineUsers(this.state, 'event', ['users']);
  }, function() {
    it('should set state users list', function() {
      expect(this.context.user)
        .toEqual({
          user: 'user',
          connection: { users: 'users' }
        });
    });
  });

  context('onUserSetOnlineGames', function() {
    return this.stateUserModel
      .onUserSetOnlineGames(this.state, 'event', ['games']);
  }, function() {
    it('should set state games list', function() {
      expect(this.context.user)
        .toEqual({
          user: 'user',
          connection: { games: 'games' }
        });
    });
  });

  context('on chat message', function() {
    return this.stateUserModel
      .onUserNewChatMsg(this.state, 'event', [this.msg]);
  }, function() {
    beforeEach(function() {
      this.msg = { msg: 'hello' };
    });

    it('should set connection\'s chat list', function() {
      expect(this.context.user)
        .toEqual({
          user: 'user',
          connection: {
            chat: [ { msg: 'hello' }
                  ]
          }
        });
    });
  });

  context('onConnectionClose', function() {
    return this.stateUserModel
      .onUserConnectionClose(this.state);
  }, function() {
    beforeEach(function() {
      this.appStateService.current
        .and.returnValue(this.state);
    });

    it('should check whether user is online', function() {
      expect(this.userModel.online)
        .toHaveBeenCalledWith(this.state.user);
    });

    context('when user is not online', function() {
      this.userModel.online
        .and.returnValue(false);
      this.expectContextError();
    }, function() {
      it('should do nothing', function() {
        expect(this.promptService.promptP)
          .not.toHaveBeenCalled();
        expect(this.userModel.toggleOnlineP)
          .not.toHaveBeenCalled();
        expect(this.appStateService.reduce)
          .not.toHaveBeenCalled();
      });
    });

    context('when user is online', function() {
      this.userModel.online
        .and.returnValue(true);
    }, function() {
      it('should warn user about disconnection', function() {
        expect(this.promptService.promptP)
          .toHaveBeenCalledWith('alert', 'Server connection lost.');
      });

      it('should toggle online for user', function() {
        expect(this.userModel.toggleOnlineP)
          .toHaveBeenCalledWith(this.state.user);
      });

      it('should set user state', function() {
        expect(this.appStateService.reduce)
          .toHaveBeenCalledWith('User.set',
                                'user.toggleOnlineP.returnValue');
      });
    });
  });
});
