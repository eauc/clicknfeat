(function() {
  angular.module('clickApp.services')
    .factory('stateUser', stateUserServiceFactory);

  const KEEP_ALIVE_INTERVAL_SECONDS = 60;
  stateUserServiceFactory.$inject = [
    'user',
    'userConnection',
    'http',
    'prompt',
    'appState',
    'state',
  ];
  function stateUserServiceFactory(userModel,
                                   userConnectionModel,
                                   httpService,
                                   promptService,
                                   appStateService,
                                   stateModel) {
    const USER_LENS = R.lensProp('user');

    const stateUserModel = {
      create: stateUserCreate,
      watch: stateUserWatch,
      onUserSet: stateUserOnSet,
      onUserUpdate: stateUserOnUpdate,
      onUserToggleOnline: stateOnUserToggleOnline,
      onUserSendChatMsg: stateOnUserSendChatMsg,
      onUserConnectionClose: stateOnUserConnectionClose,
      onUserSetOnlineUsers: stateOnUserSetOnlineUsers,
      onUserSetOnlineGames: stateOnUserSetOnlineGames,
      onUserNewChatMsg: stateOnUserNewChatMsg,
      onUserStateChange: stateUserOnChange,
      onUserIsValid: stateUserOnIsValid,
      updateOnlineKeepAlive: stateUserUpdateOnlineKeepAlive,
      filterChatReceived: stateUserFilterChatReceived
    };
    R.curryService(stateUserModel);
    stateModel.register(stateUserModel);
    return stateUserModel;

    function stateUserCreate(state) {
      console.log('create stateUser');

      appStateService
        .addReducer('User.set'              , stateUserModel.onUserSet)
        .addReducer('User.update'           , stateUserModel.onUserUpdate)
        .addReducer('User.toggleOnline'     , stateUserModel.onUserToggleOnline)
        .addReducer('User.sendChatMsg'      , stateUserModel.onUserSendChatMsg)
        .addReducer('User.connection.close' , stateUserModel.onUserConnectionClose)
        .addReducer('User.setOnlineUsers'   , stateUserModel.onUserSetOnlineUsers)
        .addReducer('User.setOnlineGames'   , stateUserModel.onUserSetOnlineGames)
        .addReducer('User.newChatMsg'       , stateUserModel.onUserNewChatMsg)
        .addListener('User.state.change'    , stateUserModel.onUserStateChange)
        .addListener('User.isValid'         , stateUserModel.onUserIsValid);

      appStateService
        .onChange('AppState.change',
                  'User.state.change',
                  R.compose(R.prop('state'), R.view(USER_LENS)));
      appStateService
        .onChange('AppState.change',
                  'User.connection.change',
                  R.compose(R.prop('connection'), R.view(USER_LENS)));
      appStateService
        .onChange('AppState.change',
                  'User.isValid',
                  R.compose(userModel.isValid, R.view(USER_LENS)));
      appStateService
        .onChange('AppState.change',
                  'User.isOnline',
                  R.compose(userModel.online, R.view(USER_LENS)));
      appStateService
        .onChange('AppState.change',
                  'User.chat.new',
                  R.pipe(
                    R.view(USER_LENS),
                    R.pathOr([], ['connection', 'chat']),
                    R.last
                  ));
      appStateService
        .filterEvent('User.chat.new',
                     'User.chat.receive',
                     stateUserModel.filterChatReceived);
      appStateService
        .cell('User.isOnline',
              stateUserModel.updateOnlineKeepAlive,
              null);

      const user_ready = R.threadP()(
        userModel.initP,
        (user) => appStateService.reduce('User.set', user)
      );
      return R.thread(state)(
        R.set(USER_LENS, { init: false }),
        R.assoc('user_ready', user_ready)
      );
    }
    let _user;
    function stateUserWatch(state) {
      const user = R.view(USER_LENS, state);
      if(user === _user) return;
      _user = user;
      appStateService.emit('User.change', user);
    }
    function stateUserOnSet(state, _event_, [user]) {
      return R.set(USER_LENS, user, state);
    }
    function stateUserOnUpdate(state, _event_, [user_state]) {
      return R.over(
        USER_LENS,
        R.assoc('state', user_state),
        state
      );
    }
    function stateOnUserToggleOnline(state) {
      R.threadP(state)(
        R.view(USER_LENS),
        userModel.toggleOnlineP,
        (user) => appStateService.reduce('User.set', user)
      );
    }
    function stateOnUserSendChatMsg(state, _event_, [chat]) {
      R.threadP(state)(
        R.view(USER_LENS),
        userConnectionModel.sendChatP$(chat)
      );
    }
    function stateOnUserConnectionClose(state) {
      R.threadP(state)(
        R.view(USER_LENS),
        R.rejectIfP(R.complement(userModel.online),
                    'User not online when connection close'),
        () => promptService
          .promptP('alert','Server connection lost.')
          .catch(R.always(null)),
        () => {
          const state = appStateService.current();
          return userModel.toggleOnlineP(state, R.view(USER_LENS, state));
        },
        (user) => appStateService.reduce('User.set', user)
      );
    }
    function stateOnUserSetOnlineUsers(state, _event_, [users]) {
      return R.over(
        USER_LENS,
        R.assocPath(['connection','users'], users),
        state
      );
    }
    function stateOnUserSetOnlineGames(state, _event_, [games]) {
      return R.over(
        USER_LENS,
        R.assocPath(['connection','games'], games),
        state
      );
    }
    function stateOnUserNewChatMsg(state, _event_, [msg]) {
      return R.over(
        USER_LENS,
        R.over(R.lensPath(['connection','chat']), R.pipe(
          R.defaultTo([]),
          R.append(msg)
        )),
        state
      );
    }
    function stateUserOnChange() {
      const user = R.view(USER_LENS, appStateService.current());
      userModel.save(user);
    }
    function stateUserOnIsValid(_event_, [is_valid]) {
      if(!is_valid) {
        appStateService.emit('User.becomesInvalid');
      }
      else {
        appStateService.emit('User.becomesValid');
      }
    }
    function stateUserUpdateOnlineKeepAlive(interval, is_online) {
      if(is_online) {
        const user = R.view(USER_LENS, appStateService.current());
        return registerKeepAliveInterval(interval, user);
      }
      else {
        return clearKeepAliveInterval(interval);
      }
    }
    function registerKeepAliveInterval(interval, user) {
      if(R.exists(interval)) return interval;

      return self.window
        .setInterval(keepAliveRequest(user),
                     KEEP_ALIVE_INTERVAL_SECONDS * 1000);
    }
    function clearKeepAliveInterval(interval) {
      if(R.isNil(interval)) return null;

      self.window.clearInterval(interval);
      return null;
    }
    function keepAliveRequest(user) {
      return () => {
        httpService
          .getP(`/api/users/${user.state.stamp}`)
          .then(R.spyInfo('** keepAlive'));
      };
    }
    function stateUserFilterChatReceived(chat) {
      const user = R.view(USER_LENS, appStateService.current());
      return ( R.exists(chat) &&
               R.exists(chat.from) &&
               chat.from !== user.state.stamp
             );
    }
  }
})();
