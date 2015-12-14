'use strict';

angular.module('clickApp.services').factory('user', ['http', 'localStorage', 'userConnection', function userServiceFactory(httpService, localStorageService, userConnectionService) {
  var STORAGE_KEY = 'clickApp.user';
  var userService = {
    isValid: function isValid(user) {
      return R.pipe(R.pathOr('', ['state', 'name']), s.trim, R.length, R.lt(0))(user);
    },
    save: function userSave(user) {
      return R.pipePromise(R.prop('state'), function (state) {
        return localStorageService.save(STORAGE_KEY, state);
      }, R.always(user))(user);
    },
    load: function userLoad() {
      return R.pipeP(function () {
        return localStorageService.load(STORAGE_KEY);
      }, function (state) {
        return { state: state };
      }, userConnectionService.create)();
    },
    init: function userInit() {
      return R.pipeP(userService.load, userService.checkOnline)();
    },
    description: function userDescription(user) {
      if (R.type(R.prop('state', user)) !== 'Object') return '';

      return userService.stateDescription(user.state);
    },
    stateDescription: function userStateDescription() {
      var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      var name = _ref.name;
      var language = _ref.language;
      var chat = _ref.chat;
      var faction = _ref.faction;
      var game_size = _ref.game_size;
      var ck_position = _ref.ck_position;

      var ret = '';
      if (R.exists(name)) {
        ret += s(name).trim().capitalize().value();
      }
      var lang_chat = [];
      if (R.exists(language)) {
        lang_chat.push(s(language).trim().value());
      }
      if (R.exists(chat)) {
        lang_chat.push(s(chat).trim().value());
      }
      if (!R.isEmpty(lang_chat)) {
        ret += '[' + lang_chat.join(' ') + ']';
      }
      if (R.exists(faction) && !R.isEmpty(faction)) {
        ret += ' - ' + R.map(s.capitalize, faction).join(',');
      }
      if (R.exists(game_size)) {
        ret += '[' + s.trim(game_size) + 'pts]';
      }
      if (R.exists(ck_position) && !R.isEmpty(ck_position)) {
        ret += ' - likes ' + ck_position.join(',');
      }
      return ret;
    },
    online: function userOnline(user) {
      return R.path(['state', 'online'], user);
    },
    toggleOnline: function userToggleOnline(user) {
      return userService.online(user) ? userGoOffline(user) : userGoOnline(user);
    },
    checkOnline: function userCheckOnline(user) {
      return R.pipeP(function (user) {
        if (!userService.online(user)) {
          return self.Promise.reject('No online flag');
        }
        return self.Promise.resolve(user);
      }, function (user) {
        return userUpdateOnline(user).catch(function () {
          return userCreateOnline(user);
        });
      }, userOnlineStart)(user).catch(function (reason) {
        console.error('User: checkOnline error', reason);
        return userOnlineStop(user);
      });
    }
  };
  function userGoOnline(user) {
    return userService.checkOnline(R.assocPath(['state', 'online'], true, user));
  }
  function userGoOffline(user) {
    return R.pipePromise(function (user) {
      return httpService.delete('/api/users/' + user.state.stamp).catch(R.always(null));
    }, R.always(user), userOnlineStop)(user);
  }
  function userCreateOnline(user) {
    return R.pipePromise(R.prop('state'), httpService.post$('/api/users'), function (state) {
      return R.assoc('state', state, user);
    })(user);
  }
  function userUpdateOnline(user) {
    if (R.isNil(user.state.stamp)) {
      return self.Promise.reject('No valid stamp');
    }

    return R.pipePromise(R.prop('state'), httpService.put$('/api/users/' + user.state.stamp), function (state) {
      return R.assoc('state', state, user);
    })(user);
  }
  function userOnlineStart(user) {
    return R.pipePromise(userConnectionService.open, R.assocPath(['state', 'online'], true), R.spy('User online start'), userService.save)(user);
  }
  function userOnlineStop(user) {
    return R.pipeP(userConnectionService.close, R.assocPath(['state', 'stamp'], null), R.assocPath(['state', 'online'], false), R.spy('User online stop'), userService.save)(user);
  }
  return userService;
}]);
//# sourceMappingURL=user.js.map
