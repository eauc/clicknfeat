describe('appUser service', function() {
  beforeEach(inject([ 'appUser', function(appUserService) {
    this.appUserService = appUserService;

    this.userModel = spyOnService('user');
    this.userConnectionModel = spyOnService('userConnection');
    this.appActionService = spyOnService('appAction');

    this.state = { user: { state: 'user' } };
  }]));

  context('set(<user>)', function() {
    return this.appUserService
      .set(this.state, 'user');
  }, function() {
    it('should set state user', function() {
      expect(this.context.user)
        .toBe('user');
    });
  });

  context('updateState(<user_state>)', function() {
    return this.appUserService
      .updateState(this.state, 'user_state');
  }, function() {
    it('should set state user', function() {
      expect(this.context.user)
        .toEqual({ state: 'user_state' });
    });
  });

  context('toggleOnline()', function() {
    return this.appUserService
      .toggleOnline(this.state);
  }, function() {
    it('should toggle state\'s user online', function() {
      expect(this.userModel.toggleOnlineP)
        .toHaveBeenCalledWith(this.state.user);
    });

    it('should set state user after toggle', function() {
      expect(this.appActionService.do)
        .toHaveBeenCalledWith('User.set', 'user.toggleOnlineP.returnValue');
    });
  });

  context('sendChat(<chat>)', function() {
    return this.appUserService
      .sendChat(this.state, 'chat');
  }, function() {
    it('should send user chat', function() {
      expect(this.userConnectionModel.sendChatP)
        .toHaveBeenCalledWith('chat', this.state.user);
    });
  });

  context('connectionUsers(<msg>)', function() {
    return this.appUserService
      .connectionUsers(this.state, {
        users: [{ name: 'toto' },
                { name: 'titi' }]
      });
  }, function() {
    it('should set state online users list', function() {
      expect(this.context.user.connection.users)
        .toEqual([ { name: 'titi' },
                   { name: 'toto' } ]);
    });
  });

  context('connectionGames(<msg>)', function() {
    return this.appUserService
      .connectionGames(this.state, { games: ['games'] });
  }, function() {
    it('should set state online games list', function() {
      expect(this.context.user.connection.games)
        .toEqual(['games']);
    });
  });

  context('connectionChat(<msg>)', function() {
    return this.appUserService
      .connectionChat(this.state, this.msg);
  }, function() {
    beforeEach(function() {
      this.msg = { msg: 'hello' };
    });

    it('should set state online user chat', function() {
      expect(this.context.user.connection.chat)
        .toEqual([ { msg: 'hello' } ]);
    });
  });

  context('connectionClose', function() {
    return this.appUserService
      .connectionClose(this.state);
  }, function() {
    it('should check whether user is online', function() {
      expect(this.userModel.isOnline)
        .toHaveBeenCalledWith(this.state.user);
    });

    context('when user is not online', function() {
      this.userModel.isOnline
        .and.returnValue(false);
    }, function() {
      it('should do nothing', function() {
        expect(this.promptService.promptP)
          .not.toHaveBeenCalled();
        expect(this.appActionService.do)
          .not.toHaveBeenCalled();
      });
    });

    context('when user is online', function() {
      this.userModel.isOnline
        .and.returnValue(true);
    }, function() {
      it('should warn user about disconnection', function() {
        expect(this.promptService.promptP)
          .toHaveBeenCalledWith('alert', 'Server connection lost.');
      });

      it('should toggle online for user', function() {
        expect(this.appActionService.do)
          .toHaveBeenCalledWith('User.toggleOnline');
      });
    });
  });
});
