'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('stateUser', stateUserServiceFactory);

  var KEEP_ALIVE_INTERVAL_SECONDS = 60;
  stateUserServiceFactory.$inject = ['user', 'userConnection', 'http', 'prompt', 'appState', 'state'];
  function stateUserServiceFactory(userModel, userConnectionModel, httpService, promptService, appStateService, stateModel) {
    var USER_LENS = R.lensProp('user');

    var stateUserModel = {
      create: stateUserCreate,
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

      appStateService.addReducer('User.set', stateUserModel.onUserSet).addReducer('User.update', stateUserModel.onUserUpdate).addReducer('User.toggleOnline', stateUserModel.onUserToggleOnline).addReducer('User.sendChatMsg', stateUserModel.onUserSendChatMsg).addReducer('User.connection.close', stateUserModel.onUserConnectionClose).addReducer('User.setOnlineUsers', stateUserModel.onUserSetOnlineUsers).addReducer('User.setOnlineGames', stateUserModel.onUserSetOnlineGames).addReducer('User.newChatMsg', stateUserModel.onUserNewChatMsg).addListener('User.state.change', stateUserModel.onUserStateChange).addListener('User.isValid', stateUserModel.onUserIsValid);

      appStateService.onChange('AppState.change', 'User.state.change', R.compose(R.prop('state'), R.view(USER_LENS)));
      appStateService.onChange('AppState.change', 'User.connection.change', R.compose(R.prop('connection'), R.view(USER_LENS)));
      appStateService.onChange('AppState.change', 'User.isValid', R.compose(userModel.isValid, R.view(USER_LENS)));
      appStateService.onChange('AppState.change', 'User.isOnline', R.compose(userModel.online, R.view(USER_LENS)));
      appStateService.onChange('User.connection.change', 'Games.online.change', R.prop('games'));
      appStateService.onChange('AppState.change', 'User.chat.new', R.pipe(R.view(USER_LENS), R.pathOr([], ['connection', 'chat']), R.last));
      appStateService.filterEvent('User.chat.new', 'User.chat.receive', stateUserModel.filterChatReceived);
      appStateService.cell('User.isOnline', stateUserModel.updateOnlineKeepAlive, null);

      var user_ready = R.threadP()(userModel.initP, function (user) {
        return appStateService.reduce('User.set', user);
      });
      return R.thread(state)(R.set(USER_LENS, { init: false }), R.assoc('user_ready', user_ready));
    }
    function stateUserOnSet(state, _event_, _ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var user = _ref2[0];

      return R.set(USER_LENS, user, state);
    }
    function stateUserOnUpdate(state, _event_, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 1);

      var user_state = _ref4[0];

      return R.over(USER_LENS, R.assoc('state', user_state), state);
    }
    function stateOnUserToggleOnline(state) {
      R.threadP(state)(R.view(USER_LENS), userModel.toggleOnlineP, function (user) {
        return appStateService.reduce('User.set', user);
      });
    }
    function stateOnUserSendChatMsg(state, _event_, _ref5) {
      var _ref6 = _slicedToArray(_ref5, 1);

      var chat = _ref6[0];

      R.threadP(state)(R.view(USER_LENS), userConnectionModel.sendChatP$(chat));
    }
    function stateOnUserConnectionClose(state) {
      return R.threadP(state)(R.view(USER_LENS), R.rejectIfP(R.complement(userModel.online), 'User not online when connection close'), function () {
        return promptService.promptP('alert', 'Server connection lost.').catch(R.always(null));
      }, function () {
        var state = appStateService.current();
        return userModel.toggleOnlineP(R.view(USER_LENS, state));
      }, function (user) {
        return appStateService.reduce('User.set', user);
      });
    }
    function stateOnUserSetOnlineUsers(state, _event_, _ref7) {
      var _ref8 = _slicedToArray(_ref7, 1);

      var users = _ref8[0];

      return R.over(USER_LENS, R.assocPath(['connection', 'users'], users), state);
    }
    function stateOnUserSetOnlineGames(state, _event_, _ref9) {
      var _ref10 = _slicedToArray(_ref9, 1);

      var games = _ref10[0];

      return R.over(USER_LENS, R.assocPath(['connection', 'games'], games), state);
    }
    function stateOnUserNewChatMsg(state, _event_, _ref11) {
      var _ref12 = _slicedToArray(_ref11, 1);

      var msg = _ref12[0];

      return R.over(USER_LENS, R.over(R.lensPath(['connection', 'chat']), R.pipe(R.defaultTo([]), R.append(msg))), state);
    }
    function stateUserOnChange() {
      var user = R.view(USER_LENS, appStateService.current());
      userModel.save(user);
    }
    function stateUserOnIsValid(_event_, _ref13) {
      var _ref14 = _slicedToArray(_ref13, 1);

      var is_valid = _ref14[0];

      if (!is_valid) {
        appStateService.emit('User.becomesInvalid');
      } else {
        appStateService.emit('User.becomesValid');
      }
    }
    function stateUserUpdateOnlineKeepAlive(interval, is_online) {
      if (is_online) {
        var user = R.view(USER_LENS, appStateService.current());
        return registerKeepAliveInterval(interval, user);
      } else {
        return clearKeepAliveInterval(interval);
      }
    }
    function registerKeepAliveInterval(interval, user) {
      if (R.exists(interval)) return interval;

      return self.window.setInterval(keepAliveRequest(user), KEEP_ALIVE_INTERVAL_SECONDS * 1000);
    }
    function clearKeepAliveInterval(interval) {
      if (R.isNil(interval)) return null;

      self.window.clearInterval(interval);
      return null;
    }
    function keepAliveRequest(user) {
      return function () {
        httpService.getP('/api/users/' + user.state.stamp).then(R.spyInfo('** keepAlive'));
      };
    }
    function stateUserFilterChatReceived(chat) {
      var user = R.view(USER_LENS, appStateService.current());
      return R.exists(chat) && R.exists(chat.from) && chat.from !== user.state.stamp;
    }
  }
})();
//# sourceMappingURL=user.js.map
