'use strict';

angular.module('clickApp.services').factory('stateUser', ['user', 'userConnection', 'prompt', function stateUserServiceFactory(userService, userConnectionService, promptService) {
  var stateUserService = {
    init: function stateUserInit(state) {
      state.user = {};
      state.user_ready = R.pipeP(userService.init, setUser$(state))(state);

      state.onEvent('User.set', stateUserService.onUserSet$(state));
      state.onEvent('User.toggleOnline', stateUserService.onUserToggleOnline$(state));
      state.onEvent('User.sendChatMsg', stateUserService.onUserSendChatMsg$(state));
      state.onEvent('User.connection.close', stateUserService.onUserConnectionClose$(state));
      state.onEvent('User.setOnlineUsers', stateUserService.onUserSetOnlineUsers$(state));
      state.onEvent('User.setOnlineGames', stateUserService.onUserSetOnlineGames$(state));
      state.onEvent('User.newChatMsg', stateUserService.onUserNewChatMsg$(state));

      return state;
    },
    save: function stateUserSave(state) {
      return saveCurrentUser(state);
    },
    onUserSet: function stateOnUserSet(state, event, user_state) {
      return R.pipePromise(R.assoc('state', user_state), userService.checkOnline$(state), setUser$(state))(state.user);
    },
    onUserToggleOnline: function stateOnUserToggleOnline(state, event) {
      event = event;
      return R.pipePromise(userService.toggleOnline$(state), setUser$(state))(state.user);
    },
    onUserSendChatMsg: function stateOnUserSendChatMsg(state, event, chat) {
      return userConnectionService.sendChat$(chat, state.user);
    },
    onUserConnectionClose: function stateOnUserConnectionClose(state, event) {
      event = event;
      return R.pipePromise(userService.online, function (online) {
        if (!online) {
          return self.Promise.reject('User not online when connection close');
        }

        return promptService.prompt('alert', 'Server connection lost.').catch(R.always(null));
      }, R.always(state.user), userService.toggleOnline$(state), setUser$(state))(state.user);
    },
    onUserSetOnlineUsers: function stateOnUserSetOnlineUsers(state, event, users) {
      return R.pipePromise(R.assocPath(['connection', 'users'], users), setUser$(state))(state.user);
    },
    onUserSetOnlineGames: function stateOnUserSetOnlineGames(state, event, games) {
      return R.pipePromise(R.assocPath(['connection', 'games'], games), setUser$(state))(state.user);
    },
    onUserNewChatMsg: function stateOnUserNewChatMsg(state, event, msg) {
      state.changeEvent('User.chat', msg);
      return R.pipePromise(R.assocPath(['connection', 'chat'], R.pipe(R.pathOr([], ['connection', 'chat']), R.append(msg))(state.user)), setUser$(state))(state.user);
    }
  };
  var setUser$ = R.curry(function (state, user) {
    state.user = user;
    console.log('stateSetUser', state.user);
    state.changeEvent('User.change');
  });
  function saveCurrentUser(state) {
    if (state._user === state.user) return null;
    state._user = state.user;
    return userService.save(state.user);
  }
  R.curryService(stateUserService);
  return stateUserService;
}]);
//# sourceMappingURL=user.js.map
