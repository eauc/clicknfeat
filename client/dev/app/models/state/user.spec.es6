describe('stateUser model', function() {
  beforeEach(inject([ 'stateUser', function(stateUserModel) {
    this.stateUserModel = stateUserModel;

    this.userModel = spyOnService('user');

    this.state = { user: { user: 'user' },
                   queueChangeEventP: jasmine.createSpy('queueChangeEventP')
                 };
  }]));

  context('onUserSetOnlineUsers', function() {
    return this.stateUserModel
      .onUserSetOnlineUsers(this.state, 'event', 'users');
  }, function() {
    it('should set state users list', function() {
      expect(this.state.user)
        .toEqual({
          user: 'user',
          connection: { users: 'users' }
        });
    });

    it('should emit "User.change" event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('User.change');
    });
  });

  context('onUserSetOnlineGames', function() {
    return this.stateUserModel
      .onUserSetOnlineGames(this.state, 'event', 'games');
  }, function() {
    it('should set state games list', function() {
      expect(this.state.user)
        .toEqual({
          user: 'user',
          connection: { games: 'games' }
        });
    });

    it('should emit "User.change" event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('User.change');
    });
  });

  context('on chat message', function() {
    return this.stateUserModel
      .onUserNewChatMsg(this.state, 'event', this.msg);
  }, function() {
    beforeEach(function() {
      this.msg = { msg: 'hello' };
    });

    it('should set connection\'s chat list', function() {
      expect(this.state.user)
        .toEqual({
          user: 'user',
          connection: {
            chat: [ { msg: 'hello' }
                  ]
          }
        });
    });

    it('should emit "User.change" event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('User.change');
    });
  });

  context('on connection close', function() {
    return this.stateUserModel
      .onUserConnectionClose(this.state);
  }, function() {
    beforeEach(function() {
      this.userModel.online
        .and.returnValue(true);
      this.promptService.promptP
        .resolveWith(true);
    });

    it('should alert user', function() {
      expect(this.promptService.promptP)
        .toHaveBeenCalledWith('alert', 'Server connection lost.');
    });

    it('should toggle user online', function() {
      expect(this.userModel.toggleOnlineP)
        .toHaveBeenCalledWith(this.state, { user: 'user' });
    });

    it('should update state user', function() {
      expect(this.state.user)
        .toEqual('user.toggleOnlineP.returnValue');
    });

    it('should emit "User.change" event', function() { 
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('User.change');
    });
  });
});
