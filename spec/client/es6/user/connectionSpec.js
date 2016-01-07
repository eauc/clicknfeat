describe('user', function() {
  describe('userConnection service', function() {
    beforeEach(inject([ 'userConnection', function(userConnectionService) {
      this.userConnectionService = userConnectionService;

      this.websocketService = spyOnService('websocket');
      mockReturnPromise(this.websocketService.create);
      this.websocketService.create.resolveWith = 'websocket.create.returnValue';
      mockReturnPromise(this.websocketService.close);
      this.websocketService.close.resolveWith = 'websocket.close.returnValue';

      this.state = { event: jasmine.createSpy('event')
                   };
    }]));

    when('init()', function() {
      this.ret = this.userConnectionService.init({});
    }, function() {
      it('should initialize a connection state', function() {
        expect(this.ret.connection)
          .toBeAn('Object');
      });
    });

    when('open()', function() {
      this.ret = this.userConnectionService
        .open(this.state, this.user);
    }, function() {
      beforeEach(function() {
        this.user = this.userConnectionService.init({
          state: { stamp: 'stamp' }
        });
      });

      it('should open websocket', function() {
        expect(this.websocketService.create)
          .toHaveBeenCalledWith('/api/users/stamp', 'user', jasmine.any(Object));
      });

      when('websocket creation fails', function() {
        this.websocketService.create.rejectWith = 'reason';
      }, function() {
        it('should reject creation', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.userConnectionService.active(this.user))
              .toBeFalsy();
          });
        });
      });

      it('should activate connection', function() {
        this.thenExpect(this.ret, function(user) {
          expect(user.connection.state.socket)
            .toBe('websocket.create.returnValue');
          expect(this.userConnectionService.active(user))
            .toBeTruthy();
        });
      });
    });

    when('close()', function() {
      this.ret = this.userConnectionService.close(this.user);
    }, function() {
      beforeEach(function(done) {
        this.user = this.userConnectionService.init({
          state: { stamp: 'stamp' }
        });
        this.userConnectionService.open(this.state, this.user)
          .then((user) => {
            this.user = user;
            done();
          });
      });

      it('should close websocket', function() {
        expect(this.websocketService.close)
          .toHaveBeenCalledWith('websocket.create.returnValue');
      });

      when('websocket close fails', function() {
        this.websocketService.close.rejectWith = 'reason';
      }, function() {
        it('should reject close', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('reason');
            expect(this.userConnectionService.active(this.user))
              .toBeTruthy();
          });
        });
      });

      it('should disactivate connection', function() {
        this.thenExpect(this.ret, function(user) {
          expect(user.connection.state.socket)
            .toBe(null);
          expect(user.connection.users)
            .toEqual([]);
          expect(this.userConnectionService.active(user))
            .toBeFalsy();
        });
      });
    });

    when('sendChat(<to>, <msg>)', function() {
      this.ret = this.userConnectionService
        .sendChat({ to: this.to, msg: this.msg}, this.user);
    }, function() {
      beforeEach(function(done) {
        this.user = this.userConnectionService.init({
          state: { stamp: 'stamp' }
        });
        this.userConnectionService.open(this.state, this.user)
          .then((user) => {
            this.user = user;
            done();
          });

        this.to = [ 'stamp1', 'stamp2' ];
        this.msg = 'hello';
      });

      it('should send chat msg on websocket', function() {
        expect(this.websocketService.send)
          .toHaveBeenCalledWith({
            type: 'chat',
            from: 'stamp',
            to: [ 'stamp1', 'stamp2' ],
            msg: 'hello'
          }, 'websocket.create.returnValue');
        expect(this.ret)
          .toBe('websocket.send.returnValue');
      });
    });

    when('sendChat(<to>, <msg>, <link>)', function() {
      this.ret = this.userConnectionService
        .sendChat({ to: this.to, msg: this.msg, link: this.link}, this.user);
    }, function() {
      beforeEach(function(done) {
        this.user = this.userConnectionService.init({
          state: { stamp: 'stamp' }
        });
        this.userConnectionService.open(this.state, this.user)
          .then((user) => {
            this.user = user;
            done();
          });

        this.to = [ 'stamp1', 'stamp2' ];
        this.msg = 'hello';
        this.link = '#link';
      });

      it('should send chat msg on websocket', function() {
        expect(this.websocketService.send)
          .toHaveBeenCalledWith({
            type: 'chat',
            from: 'stamp',
            to: [ 'stamp1', 'stamp2' ],
            msg: 'hello',
            link: '#link'
          }, 'websocket.create.returnValue');
        expect(this.ret)
          .toBe('websocket.send.returnValue');
      });
    });

    when('userNameForStamp(<stamp>)', function() {
      this.ret = this.userConnectionService
        .userNameForStamp(this.stamp, this.user);
    }, function() {
      beforeEach(function() {
        this.user = {
          connection: {
            users: [
              { stamp: 'stamp1', name: 'ToTo' },
              { stamp: 'stamp2', name: 'Manu' },
              { stamp: 'stamp3', name: 'wood' }
            ]
          }
        };
      });

      using([
        [ 'stamp' , 'result' ],
        [ null    , 'Unknown' ],
        [ 'stamp4', 'Unknown' ],
        [ 'stamp1', 'ToTo' ],
        [ 'stamp2', 'Manu' ],
        [ 'stamp3', 'Wood' ],
      ], function(e, d) {
        when(d, function() {
          this.stamp = e.stamp;
        }, function() {
          it('should return user name for <stamp>', function() {
            expect(this.ret)
              .toBe(e.result);
          });
        });
      });
    });

    when('usersNamesForStamps(<stamps>)', function() {
      this.ret = this.userConnectionService
        .usersNamesForStamps(this.stamps, this.user);
    }, function() {
      beforeEach(function() {
        this.user = {
          connection: {
            users: [
              { stamp: 'stamp1', name: 'ToTo' },
              { stamp: 'stamp2', name: 'Manu' },
              { stamp: 'stamp3', name: 'wood' }
            ]
          }
        };
      });

      using([
        [ 'stamps' , 'result' ],
        [ null    , ['Unknown'] ],
        [ ['stamp4'], ['Unknown'] ],
        [ ['stamp4','stamp1'], ['ToTo'] ],
        [ ['stamp2','stamp4','stamp1'], ['Manu','ToTo'] ],
        [ ['stamp1','stamp2','stamp3'], ['ToTo','Manu','Wood'] ],
      ], function(e, d) {
        when(d, function() {
          this.stamps = e.stamps;
        }, function() {
          it('should return users names for <stamps>', function() {
            expect(this.ret)
              .toEqual(e.result);
          });
        });
      });
    });

    describe('socket event handlers', function() {
      beforeEach(function(done) {
        this.user = this.userConnectionService.init({
          state: { stamp: 'stamp' }
        });
        this.userConnectionService
          .open(this.state, this.user)
          .then((user) => {
            this.user = user;
            done();
          });
        this.handlers = this.websocketService.create.calls.first().args[2];
      });
      
      when('users list message', function() {
        this.handlers.users(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { users: [ { name: 'ToTo' },
                                { name: 'Manu' },
                                { name: 'wood' }
                              ] };
        });
        
        it('should emit "setOnlineUsers" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('User.setOnlineUsers', [
              { name: 'Manu' },
              { name: 'ToTo' },
              { name: 'wood' }
            ]);
        });
      });
      
      when('games list message', function() {
        this.handlers.games(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { games: 'games' };
        });
        
        it('should emit "User.setOnlineGames" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('User.setOnlineGames', this.msg.games);
        });
      });
      
      when('chat message', function() {
        this.handlers.chat(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { msg: 'hello' };
        });
        
        it('should emit "User.newChatMsg" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('User.newChatMsg', this.msg);
        });
      });
      
      when('close', function() {
        this.handlers.close();
      }, function() {
        it('should emit "User.connection.close" event', function() {
          expect(this.state.event)
            .toHaveBeenCalledWith('User.connection.close');
        });
      });
    });
  });

  describe('stateUser service', function() {
    beforeEach(inject([ 'stateUser', function(stateUserService) {
      this.stateUserService = stateUserService;

      this.userService = spyOnService('user');
      
      this.state = { user: { user: 'user' },
                     changeEvent: jasmine.createSpy('changeEvent')
                   };
    }]));

    when('onUserSetOnlineUsers', function() {
      this.ret = this.stateUserService
        .onUserSetOnlineUsers(this.state, 'event', 'users');
    }, function() {        
      it('should set state users list', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.user)
            .toEqual({
              user: 'user',
              connection: { users: 'users' }
            });
        });
      });

      it('should emit "User.change" event', function() { 
        this.thenExpect(this.ret, () => {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('User.change');
        });
      });
    });

    when('onUserSetOnlineGames', function() {
      this.ret = this.stateUserService
        .onUserSetOnlineGames(this.state, 'event', 'games');
    }, function() {        
      it('should set state games list', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.user)
            .toEqual({
              user: 'user',
              connection: { games: 'games' }
            });
        });
      });

      it('should emit "User.change" event', function() { 
        this.thenExpect(this.ret, () => {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('User.change');
        });
      });
    });
    
    when('chat message', function() {
      this.ret = this.stateUserService
        .onUserNewChatMsg(this.state, 'event', this.msg);
    }, function() {
      beforeEach(function() {
        this.msg = { msg: 'hello' };
      });
      
      it('should set connection\'s chat list', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.user)
            .toEqual({
              user: 'user',
              connection: {
                chat: [ { msg: 'hello' }
                      ]
              }
            });
        });
      });

      it('should emit "User.change" event', function() { 
        this.thenExpect(this.ret, () => {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('User.change');
        });
      });
    });
    
    when('connection close', function() {
      this.ret = this.stateUserService
        .onUserConnectionClose(this.state);
    }, function() {
      beforeEach(function() {
        this.userService.online._retVal = true;
        this.promptService.prompt.resolveWith = true;
      });
      
      it('should alert user', function() {
        this.thenExpect(this.ret, () => {
          expect(this.promptService.prompt)
            .toHaveBeenCalledWith('alert', 'Server connection lost.');
        });
      });
      
      it('should toggle user online', function() {
        this.thenExpect(this.ret, () => {
          expect(this.userService.toggleOnline)
            .toHaveBeenCalledWith(this.state, { user: 'user' });
        });
      });
      
      it('should update state user', function() {
        this.thenExpect(this.ret, () => {
          expect(this.state.user)
            .toEqual('user.toggleOnline.returnValue');
        });
      });

      it('should emit "User.change" event', function() { 
        this.thenExpect(this.ret, () => {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('User.change');
        });
      });
    });
  });
});
