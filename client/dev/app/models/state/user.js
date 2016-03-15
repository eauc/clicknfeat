'use strict';

(function () {
  angular.module('clickApp.services').factory('stateUser', stateUserServiceFactory);

  stateUserServiceFactory.$inject = ['user'];

  // 'userConnection',
  // 'prompt',
  function stateUserServiceFactory(userModel) {
    // userConnectionService,
    // promptService) {
    var stateUserService = {
      create: stateUserCreate,
      save: stateUserSave,
      onStateInit: stateUserOnInit,
      onUserSet: stateUserOnSet
    };
    // onUserToggleOnline: stateOnUserToggleOnline,
    // onUserSendChatMsg: stateOnUserSendChatMsg,
    // onUserConnectionClose: stateOnUserConnectionClose,
    // onUserSetOnlineUsers: stateOnUserSetOnlineUsers,
    // onUserSetOnlineGames: stateOnUserSetOnlineGames,
    // onUserNewChatMsg: stateOnUserNewChatMsg
    var setUser$ = R.curry(setUser);
    R.curryService(stateUserService);
    return stateUserService;

    function stateUserCreate(state) {
      state.user = {};
      state.user_ready = new self.Promise(function (resolve) {
        state.onEvent('State.init', stateUserService.onStateInit$(state, resolve));
      });

      state.onEvent('User.set', stateUserService.onUserSet$(state));
      // state.onEvent('User.toggleOnline',
      //               stateUserService.onUserToggleOnline$(state));
      // state.onEvent('User.sendChatMsg',
      //               stateUserService.onUserSendChatMsg$(state));
      // state.onEvent('User.connection.close',
      //               stateUserService.onUserConnectionClose$(state));
      // state.onEvent('User.setOnlineUsers',
      //               stateUserService.onUserSetOnlineUsers$(state));
      // state.onEvent('User.setOnlineGames',
      //               stateUserService.onUserSetOnlineGames$(state));
      // state.onEvent('User.newChatMsg',
      //               stateUserService.onUserNewChatMsg$(state));

      return state;
    }
    function stateUserSave(state) {
      if (state._user === state.user) return null;
      state._user = state.user;
      return userModel.save(state.user);
    }
    function stateUserOnInit(state, ready, event) {
      return R.threadP(state)(userModel.initP, setUser$(state), function () {
        state.user_ready.fulfilled = true;
      }, ready);
    }
    function stateUserOnSet(state, event, user_state) {
      return R.threadP(state.user)(R.assoc('state', user_state),
      // userService.checkOnline$(state),
      setUser$(state));
    }
    // function stateOnUserToggleOnline(state, event) {
    //   event = event;
    //   return R.pipePromise(
    //     userService.toggleOnline$(state),
    //     setUser$(state)
    //   )(state.user);
    // }
    // function stateOnUserSendChatMsg(state, event, chat) {
    //   return userConnectionService
    //     .sendChat$(chat, state.user);
    // }
    // function stateOnUserConnectionClose(state, event) {
    //   event = event;
    //   return R.pipePromise(
    //     userService.online,
    //     (online) => {
    //       if(!online) {
    //         return self.Promise
    //           .reject('User not online when connection close');
    //       }

    //       return promptService
    //         .prompt('alert','Server connection lost.')
    //         .catch(R.always(null));
    //     },
    //     R.always(state.user),
    //     userService.toggleOnline$(state),
    //     setUser$(state)
    //   )(state.user);
    // }
    // function stateOnUserSetOnlineUsers(state, event, users) {
    //   return R.pipePromise(
    //     R.assocPath(['connection','users'], users),
    //     setUser$(state)
    //   )(state.user);
    // }
    // function stateOnUserSetOnlineGames(state, event, games) {
    //   return R.pipePromise(
    //     R.assocPath(['connection','games'], games),
    //     setUser$(state)
    //   )(state.user);
    // }
    // function stateOnUserNewChatMsg(state, event, msg) {
    //   state.changeEvent('User.chat', msg);
    //   return R.pipePromise(
    //     R.assocPath(['connection','chat'], R.pipe(
    //       R.pathOr([], ['connection','chat']),
    //       R.append(msg)
    //     )(state.user)),
    //     setUser$(state)
    //   )(state.user);
    // }
    function setUser(state, user) {
      state.user = user;
      console.log('stateSetUser', state.user);
      state.queueChangeEventP('User.change');
    }
  }
})();
//# sourceMappingURL=user.js.map
