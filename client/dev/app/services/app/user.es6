(function() {
  angular.module('clickApp.services')
    .factory('appUser', appUserServiceFactory);

  appUserServiceFactory.$inject=  [
    'prompt',
    'behaviours',
    'appError',
    'appAction',
    'appState',
    'user',
    'userConnection',
  ];
  function appUserServiceFactory(promptService,
                                 behaviours,
                                 appErrorService,
                                 appActionService,
                                 appStateService,
                                 userModel,
                                 userConnectionModel) {
    const USER_LENS = R.lensProp('user');
    const CONNECTION_USERS_LENS = R.lensPath(['user', 'connection', 'users']);
    const CONNECTION_GAMES_LENS = R.lensPath(['user', 'connection', 'games']);
    const CONNECTION_CHAT_LENS = R.lensPath(['user', 'connection', 'chat']);

    const user = appStateService.state
            .map(R.view(USER_LENS));
    user.changes().listen(userModel.saveP);
    const valid = user.map(userModel.isValid);

    const userService = {
      user, valid,
      set: actionUserSet,
      updateState: actionUserUpdateState,
      toggleOnline: actionUserToggleOnline,
      sendChat: actionUserSendChat,
      connectionChat: actionUserConnectionChat,
      connectionClose: actionUserConnectionClose,
      connectionGames: actionUserConnectionGames,
      connectionUsers: actionUserConnectionUsers
    };
    R.curryService(userService);

    mount();

    return userService;

    function mount() {
      appActionService
        .register('User.connection.chat', actionUserConnectionChat)
        .register('User.connection.close', actionUserConnectionClose)
        .register('User.connection.games', actionUserConnectionGames)
        .register('User.connection.users', actionUserConnectionUsers)
        .register('User.sendChat', actionUserSendChat)
        .register('User.set', actionUserSet)
        .register('User.toggleOnline', actionUserToggleOnline)
        .register('User.updateState', actionUserUpdateState);
      userModel.initP()
        .then((user) => appActionService.action.send(['User.set', user]));
    }

    function actionUserSet(state, user) {
      return R.set(USER_LENS, user, state);
    }
    function actionUserUpdateState(state, user_state) {
      return R.over(
        USER_LENS,
        R.assoc('state', user_state),
        state
      );
    }
    function actionUserToggleOnline(state) {
      return R.threadP(state)(
        R.view(USER_LENS),
        userModel.toggleOnlineP,
        (user) => {
          appActionService.do('User.set', user);
        }
      );
    }
    function actionUserSendChat(state, chat) {
      return R.threadP(state)(
        R.view(USER_LENS),
        userConnectionModel.sendChatP$(chat)
      );
    }
    function actionUserConnectionClose(state) {
      return R.threadP(state)(
        R.view(USER_LENS),
        R.when(
          userModel.isOnline,
          () => R.threadP()(
            () => promptService
              .promptP('alert','Server connection lost.')
              .catch(R.always(null)),
            () => {
              appActionService.do('User.toggleOnline');
            }
          )
        )
      );
    }
    function actionUserConnectionUsers(state, msg) {
      return R.thread(msg)(
        R.propOr([], 'users'),
        R.sortBy(R.compose(R.toLower, R.prop('name'))),
        R.set(CONNECTION_USERS_LENS, R.__, state)
      );
    }
    function actionUserConnectionGames(state, msg) {
      return R.thread(msg)(
        R.propOr([], 'games'),
        R.set(CONNECTION_GAMES_LENS, R.__, state)
      );
    }
    function actionUserConnectionChat(state, msg) {
      return R.over(
        CONNECTION_CHAT_LENS,
        R.pipe(
          R.defaultTo([]),
          R.append(msg)
        ),
        state
      );
    }
  }
})();
