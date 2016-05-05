describe('userConnection model', function() {
  beforeEach(inject([ 'userConnection', function(userConnectionModel) {
    this.userConnectionModel = userConnectionModel;

    this.websocketService = spyOnService('websocket');
    this.appStateService = spyOnService('appState');
  }]));

  context('init()', function() {
    return this.userConnectionModel.init({});
  }, function() {
    it('should initialize a connection state', function() {
      expect(this.context.connection)
        .toBeAn('Object');
    });
  });

  context('openP()', function() {
    return this.userConnectionModel
      .openP(this.user);
  }, function() {
    beforeEach(function() {
      this.user = this.userConnectionModel.init({
        state: { stamp: 'stamp' }
      });
    });

    it('should open websocket', function() {
      expect(this.websocketService.createP)
        .toHaveBeenCalledWith('/api/users/stamp', {
          close: 'User.connection.close',
          users: 'User.connection.users',
          games: 'User.connection.games',
          chat: 'User.connection.chat'
        });
    });

    context('when websocket creation fails', function() {
      this.websocketService.createP
        .rejectWith('reason');
      this.expectContextError();
    }, function() {
      it('should reject creation', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
        expect(this.userConnectionModel.active(this.user))
          .toBeFalsy();
      });
    });

    it('should activate connection', function() {
      expect(this.context.connection.state.socket)
        .toBe('websocket.createP.returnValue');
      expect(this.userConnectionModel.active(this.context))
        .toBeTruthy();
    });
  });

  context('close()', function() {
    return this.userConnectionModel
      .close(this.user);
  }, function() {
    beforeEach(function() {
      this.user = this.userConnectionModel.init({
        state: { stamp: 'stamp' }
      });
      return this.userConnectionModel
        .openP(this.user)
        .then((user) => {
          this.user = user;
        });
    });

    it('should close websocket', function() {
      expect(this.websocketService.close)
        .toHaveBeenCalledWith('websocket.createP.returnValue');
    });

    it('should disactivate connection', function() {
      expect(this.context.connection.state.socket)
        .toBe(null);
      expect(this.context.connection.users)
        .toEqual([]);
      expect(this.userConnectionModel.active(this.context))
        .toBeFalsy();
    });
  });

  context('sendChat(<to>, <msg>)', function() {
    return this.userConnectionModel
      .sendChatP({ to: this.to, msg: this.msg}, this.user);
  }, function() {
    beforeEach(function() {
      this.user = this.userConnectionModel.init({
        state: { stamp: 'stamp' }
      });
      this.to = [ 'stamp1', 'stamp2' ];
      this.msg = 'hello';
      return this.userConnectionModel
        .openP(this.user)
        .then((user) => {
          this.user = user;
        });
    });

    it('should send chat msg on websocket', function() {
      expect(this.websocketService.send)
        .toHaveBeenCalledWith({
          type: 'chat',
          from: 'stamp',
          to: [ 'stamp1', 'stamp2' ],
          msg: 'hello'
        }, 'websocket.createP.returnValue');
      expect(this.context)
        .toBe('websocket.send.returnValue');
    });
  });

  context('sendChat(<to>, <msg>, <link>)', function() {
    return this.userConnectionModel
      .sendChatP({ to: this.to, msg: this.msg, link: this.link}, this.user);
  }, function() {
    beforeEach(function() {
      this.user = this.userConnectionModel.init({
        state: { stamp: 'stamp' }
      });
      this.to = [ 'stamp1', 'stamp2' ];
      this.msg = 'hello';
      this.link = '#link';
      return this.userConnectionModel
        .openP(this.user)
        .then((user) => {
          this.user = user;
        });
    });

    it('should send chat msg on websocket', function() {
      expect(this.websocketService.send)
        .toHaveBeenCalledWith({
          type: 'chat',
          from: 'stamp',
          to: [ 'stamp1', 'stamp2' ],
          msg: 'hello',
          link: '#link'
        }, 'websocket.createP.returnValue');
      expect(this.context)
        .toBe('websocket.send.returnValue');
    });
  });

  context('userNameForStamp(<stamp>)', function() {
    return this.userConnectionModel
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

    example(function(e, d) {
      context(d, function() {
        this.stamp = e.stamp;
      }, function() {
        it('should return user name for <stamp>', function() {
          expect(this.context)
            .toBe(e.result);
        });
      });
    }, [
      [ 'stamp'  , 'result'  ],
      [ null     , 'Unknown' ],
      [ 'stamp4' , 'Unknown' ],
      [ 'stamp1' , 'ToTo'    ],
      [ 'stamp2' , 'Manu'    ],
      [ 'stamp3' , 'Wood'    ],
    ]);
  });

  context('usersNamesForStamps(<stamps>)', function() {
    return this.userConnectionModel
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

    example(function(e, d) {
      context(d, function() {
        this.stamps = e.stamps;
      }, function() {
        it('should return users names for <stamps>', function() {
          expect(this.context)
            .toEqual(e.result);
        });
      });
    }, [
      [ 'stamps'                    , 'result'                ],
      [ null                        , ['Unknown']             ],
      [ ['stamp4'                   ], ['Unknown']            ],
      [ ['stamp4','stamp1'          ], ['ToTo']               ],
      [ ['stamp2','stamp4','stamp1' ], ['Manu','ToTo']        ],
      [ ['stamp1','stamp2','stamp3' ], ['ToTo','Manu','Wood'] ],
    ]);
  });
});

