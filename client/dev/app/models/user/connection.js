'use strict';

(function () {
  angular.module('clickApp.models').factory('userConnection', userConnectionServiceFactory);

  userConnectionServiceFactory.$inject = ['http', 'pubSub', 'websocket'];
  function userConnectionServiceFactory(httpService, pubSubService, websocketService) {
    var userConnectionService = {
      init: userConnectionInit,
      openP: userConnectionOpenP,
      close: userConnectionClose,
      active: userConnectionActive,
      sendChatP: userConnectionSendChatP,
      userNameForStamp: userNameForStamp,
      usersNamesForStamps: usersNamesForStamps
    };
    var usersMessageHandler$ = R.curry(usersMessageHandler);
    var gamesMessageHandler$ = R.curry(gamesMessageHandler);
    var chatMessageHandler$ = R.curry(chatMessageHandler);
    var userForStamp$ = R.curry(userForStamp);
    var usersForStamps$ = R.curry(usersForStamps);
    R.curryService(userConnectionService);
    return userConnectionService;

    function userConnectionInit(user) {
      var connection = {
        state: { socket: null }
      };
      return R.assoc('connection', connection, user);
    }
    function userConnectionOpenP(state, user) {
      if (userConnectionService.active(user)) {
        return R.resolveP(user);
      }

      var handlers = {
        close: closeHandler$(state),
        users: usersMessageHandler$(state),
        games: gamesMessageHandler$(state),
        chat: chatMessageHandler$(state)
      };

      user = R.assocPath(['connection', 'state', 'socket'], null, user);
      return R.threadP()(function () {
        return websocketService.createP('/api/users/' + user.state.stamp, 'user', handlers);
      }, function (socket) {
        return R.assocPath(['connection', 'state', 'socket'], socket, user);
      });
    }
    function userConnectionClose(user) {
      return R.thread()(function () {
        if (userConnectionService.active(user)) {
          websocketService.close(user.connection.state.socket);
        }
      }, function () {
        return R.over(R.lensProp('connection'), cleanupConnection, user);
      });
    }
    function userConnectionActive(user) {
      return R.thread(user)(R.path(['connection', 'state', 'socket']), R.exists);
    }
    function userConnectionSendChatP(chat, user) {
      return R.threadP(user)(R.rejectIf(R.complement(userConnectionService.active), 'Not active'), function (user) {
        chat = R.thread(chat)(R.assoc('type', 'chat'), R.assoc('from', user.state.stamp));
        return websocketService.send(chat, user.connection.state.socket);
      });
    }
    function userNameForStamp(stamp, user) {
      return R.thread(user)(R.prop('connection'), userForStamp$(stamp), R.defaultTo({ name: 'Unknown' }), R.prop('name'), normalizeUserName);
    }
    function usersNamesForStamps(stamps, user) {
      return R.thread(user)(R.defaultTo({}), R.propOr({}, 'connection'), usersForStamps$(R.defaultTo([], stamps)), R.pluck('name'), function (names) {
        return R.isEmpty(names) ? ['Unknown'] : names;
      }, R.map(normalizeUserName));
    }
    function normalizeUserName(name) {
      return s(name).trim().capitalize().value();
    }
    function cleanupConnection(connection) {
      return R.thread(connection)(R.assocPath(['state', 'socket'], null), R.assoc('users', []));
    }
    function closeHandler$(state) {
      return function () {
        console.error('User connection: close');
        state.queueEventP('User.connection.close');
      };
    }
    function usersMessageHandler(state, msg) {
      console.log('User connection: users list', msg);
      state.queueEventP('User.setOnlineUsers', R.thread(msg)(R.propOr([], 'users'), R.sortBy(R.compose(R.toLower, R.prop('name')))));
    }
    function gamesMessageHandler(state, msg) {
      console.log('User connection: games list', msg);
      state.queueEventP('User.setOnlineGames', R.thread(msg)(R.propOr([], 'games')));
    }
    function chatMessageHandler(state, msg) {
      console.log('User connection: chat msg', msg);
      state.queueEventP('User.newChatMsg', msg);
    }
    function userForStamp(stamp, connection) {
      return R.thread(connection)(R.prop('users'), R.find(R.propEq('stamp', stamp)));
    }
    function usersForStamps(stamps, connection) {
      return R.thread(stamps)(R.map(R.flip(userForStamp$)(connection)), R.reject(R.isNil));
    }
  }
})();
//# sourceMappingURL=connection.js.map
