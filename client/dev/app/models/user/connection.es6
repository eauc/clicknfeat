(function() {
  angular.module('clickApp.models')
    .factory('userConnection', userConnectionServiceFactory);

  userConnectionServiceFactory.$inject = [
    'websocket',
  ];
  function userConnectionServiceFactory(websocketService) {
    const userConnectionService = {
      init: userConnectionInit,
      openP: userConnectionOpenP,
      close: userConnectionClose,
      active: userConnectionActive,
      sendChatP: userConnectionSendChatP,
      userNameForStamp: userNameForStamp,
      usersNamesForStamps: usersNamesForStamps
    };
    const userForStamp$ = R.curry(userForStamp);
    const usersForStamps$ = R.curry(usersForStamps);
    R.curryService(userConnectionService);
    return userConnectionService;

    function userConnectionInit(user) {
      const connection = {
        state: { socket: null }
      };
      return R.assoc('connection', connection, user);
    }
    function userConnectionOpenP(user) {
      if(userConnectionService.active(user)) {
        return R.resolveP(user);
      }

      const actions = {
        close: 'User.connection.close',
        users: 'User.connection.users',
        games: 'User.connection.games',
        chat: 'User.connection.chat'
      };

      user = R.assocPath(['connection','state','socket'], null, user);
      return R.threadP()(
        () => websocketService
          .createP(`/api/users/${user.state.stamp}`, 'user', actions),
        R.assocPath(['connection','state','socket'], R.__, user)
      );
    }
    function userConnectionClose(user) {
      if(userConnectionService.active(user)) {
        websocketService
          .close(user.connection.state.socket);
      }
      return R.over(R.lensProp('connection'),
                    cleanupConnection, user);
    }
    function userConnectionActive(user) {
      return R.thread(user)(
        R.path(['connection','state','socket']),
        R.exists
      );
    }
    function userConnectionSendChatP(chat, user) {
      return R.threadP(user)(
        R.rejectIfP(R.complement(userConnectionService.active),
                    'Not active'),
        (user) => R.thread(chat)(
          R.assoc('type', 'chat'),
          R.assoc('from', user.state.stamp)
        ),
        (chat) => websocketService
          .send(chat, user.connection.state.socket)
      );
    }
    function userNameForStamp(stamp, user) {
      return R.thread(user)(
        R.prop('connection'),
        userForStamp$(stamp),
        R.defaultTo({ name: 'Unknown' }),
        R.prop('name'),
        normalizeUserName
      );
    }
    function usersNamesForStamps(stamps, user) {
      return R.thread(user)(
        R.defaultTo({}),
        R.propOr({}, 'connection'),
        usersForStamps$(R.defaultTo([], stamps)),
        R.pluck('name'),
        R.when(
          R.isEmpty,
          () => ([ 'Unknown' ])
        ),
        R.map(normalizeUserName)
      );
    }
    function normalizeUserName(name) {
      return s(name).trim().capitalize().value();
    }
    function cleanupConnection(connection) {
      return R.thread(connection)(
        R.assocPath(['state','socket'], null),
        R.assoc('users', [])
      );
    }
    function userForStamp(stamp, connection) {
      return R.thread(connection)(
        R.prop('users'),
        R.find(R.propEq('stamp', stamp))
      );
    }
    function usersForStamps(stamps, connection) {
      return R.thread(stamps)(
        R.map(userForStamp$(R.__, connection)),
        R.reject(R.isNil)
      );
    }
  }
})();
