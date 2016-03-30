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
});
