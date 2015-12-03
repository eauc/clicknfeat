'use strict';

describe('user', function() {
  describe('userConnection service', function() {
    beforeEach(inject([ 'userConnection', function(userConnectionService) {
      this.userConnectionService = userConnectionService;

      this.websocketService = spyOnService('websocket');
      mockReturnPromise(this.websocketService.create);
      this.websocketService.create.resolveWith = 'websocket.create.returnValue';
      mockReturnPromise(this.websocketService.close);
      this.websocketService.close.resolveWith = 'websocket.close.returnValue';
    }]));

    when('create()', function() {
      this.ret = this.userConnectionService.create({});
    }, function() {
      it('should initialize a connection state', function() {
        expect(this.ret.connection)
          .toBeAn('Object');
      });
    });

    when('open()', function() {
      this.ret = this.userConnectionService.open(this.user);
    }, function() {
      beforeEach(function() {
        this.user = this.userConnectionService.create({
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
        this.user = this.userConnectionService.create({
          state: { stamp: 'stamp' }
        });
        this.userConnectionService.open(this.user)
          .then(function() {
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
        .sendChat(this.to, this.msg, this.user);
    }, function() {
      beforeEach(function(done) {
        this.user = this.userConnectionService.create({
          state: { stamp: 'stamp' }
        });
        this.userConnectionService.open(this.user)
          .then(function() {
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
      beforeEach(inject(['pubSub', function(pubSubService) {
        this.user = this.userConnectionService.create({
          state: { stamp: 'stamp' }
        });
        this.userConnectionService.open(this.user);
        this.handlers = this.websocketService.create.calls.first().args[2];

        this.event_listener = jasmine.createSpy('event_listener');
        pubSubService.subscribe('#watch#', this.event_listener,
                                this.user.connection.channel);
      }]));
      
      when('users list message', function() {
        this.handlers.users(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { users: [ { name: 'ToTo' },
                                { name: 'Manu' },
                                { name: 'wood' }
                              ] };
        });
        
        it('should set connection\'s users list', function() {
          expect(this.user.connection.users)
            .toEqual([
              { name: 'Manu' },
              { name: 'ToTo' },
              { name: 'wood' }
            ]);
        });

        it('should emit "users" event', function() {
          expect(this.event_listener)
            .toHaveBeenCalledWith('users', this.user.connection.users);
        });
      });
      
      when('games list message', function() {
        this.handlers.games(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { games: 'games' };
        });
        
        it('should set connection\'s users list', function() {
          expect(this.user.connection.games)
            .toBe('games');
        });

        it('should emit "games" event', function() {
          expect(this.event_listener)
            .toHaveBeenCalledWith('games', this.user.connection.games);
        });
      });
      
      when('chat message', function() {
        this.handlers.chat(this.msg);
      }, function() {
        beforeEach(function() {
          this.msg = { msg: 'hello' };
        });
        
        it('should set connection\'s chat list', function() {
          expect(this.user.connection.chat)
            .toEqual([
              { msg: 'hello' },
            ]);
        });

        it('should emit "chat" event', function() {
          expect(this.event_listener)
            .toHaveBeenCalledWith('chat', this.user.connection.chat);
        });
      });
      
      when('close', function() {
        this.handlers.close();
      }, function() {
        it('should cleanup connection', function() {
          expect(this.user.connection.users)
            .toEqual([]);
          expect(this.userConnectionService.active(this.user))
            .toBeFalsy();
        });

        it('should emit "close" event', function() {
          expect(this.event_listener)
            .toHaveBeenCalledWith('close');
        });
      });
    });
  });
});
