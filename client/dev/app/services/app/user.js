'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('appUser', appUserServiceFactory);

  appUserServiceFactory.$inject = ['prompt', 'appAction', 'appState', 'user', 'userConnection'];
  function appUserServiceFactory(promptService, appActionService, appStateService, userModel, userConnectionModel) {
    var USER_LENS = R.lensProp('user');
    var CONNECTION_USERS_LENS = R.lensPath(['user', 'connection', 'users']);
    var CONNECTION_GAMES_LENS = R.lensPath(['user', 'connection', 'games']);
    var CONNECTION_CHAT_LENS = R.lensPath(['user', 'connection', 'chat']);

    var user = appStateService.state.map(R.viewOr({}, USER_LENS));
    user.map(R.prop('state')).changes().listen(function (state) {
      return userModel.saveP({ state: state });
    });
    var valid = user.map(userModel.isValid);
    var new_chat = appStateService.state.map(R.pipe(R.viewOr([], CONNECTION_CHAT_LENS), R.last)).changes().snapshot(function (user, chat) {
      return [user, chat];
    }, user).filter(function (_ref) {
      var _ref2 = _slicedToArray(_ref, 2);

      var user = _ref2[0];
      var chat = _ref2[1];
      return R.exists(chat) && !userModel.isChatAuthor(chat, user);
    });
    var ready = undefined;
    var userService = {
      user: user, valid: valid, new_chat: new_chat, ready: ready,
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
      appActionService.register('User.connection.chat', actionUserConnectionChat).register('User.connection.close', actionUserConnectionClose).register('User.connection.games', actionUserConnectionGames).register('User.connection.users', actionUserConnectionUsers).register('User.sendChat', actionUserSendChat).register('User.set', actionUserSet).register('User.toggleOnline', actionUserToggleOnline).register('User.updateState', actionUserUpdateState);
      ready = userModel.initP().then(function (user) {
        return appActionService.action.send(['User.set', user]);
      });
    }

    function actionUserSet(state, user) {
      return R.set(USER_LENS, user, state);
    }
    function actionUserUpdateState(state, user_state) {
      return R.over(USER_LENS, R.assoc('state', user_state), state);
    }
    function actionUserToggleOnline(state) {
      return R.threadP(state)(R.view(USER_LENS), userModel.toggleOnlineP, function (user) {
        appActionService.do('User.set', user);
      });
    }
    function actionUserSendChat(state, chat) {
      return R.threadP(state)(R.view(USER_LENS), userConnectionModel.sendChatP$(chat));
    }
    function actionUserConnectionClose(state) {
      return R.threadP(state)(R.view(USER_LENS), R.when(userModel.isOnline, function () {
        return R.threadP()(function () {
          return promptService.promptP('alert', 'Server connection lost.').catch(R.always(null));
        }, function () {
          appActionService.do('User.toggleOnline');
        });
      }));
    }
    function actionUserConnectionUsers(state, msg) {
      return R.thread(msg)(R.propOr([], 'users'), R.sortBy(R.compose(R.toLower, R.prop('name'))), R.set(CONNECTION_USERS_LENS, R.__, state));
    }
    function actionUserConnectionGames(state, msg) {
      return R.thread(msg)(R.propOr([], 'games'), R.set(CONNECTION_GAMES_LENS, R.__, state));
    }
    function actionUserConnectionChat(state, msg) {
      return R.over(CONNECTION_CHAT_LENS, R.pipe(R.defaultTo([]), R.append(msg)), state);
    }
  }
})();
//# sourceMappingURL=user.js.map
