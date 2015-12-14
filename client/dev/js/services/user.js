'use strict';

angular.module('clickApp.services').factory('user', ['http', 'localStorage', 'userConnection', function userServiceFactory(httpService, localStorageService, userConnectionService) {
  var STORAGE_KEY = 'clickApp.user';
  var userService = {
    isValid: function (user) {
      return R.pipe(R.pathOr('', ['state', 'name']), s.trim, R.length, R.lt(0))(user);
    },
    save: function userSave(user) {
      return R.pipeP(R.bind(self.Promise.resolve, self.Promise), R.prop('state'), function (state) {
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
    stateDescription: function userStateDescription(state) {
      var ret = '';
      if (R.exists(state.name)) {
        ret += s(state.name).trim().capitalize().value();
      }
      var lang_chat = [];
      if (R.exists(state.language)) {
        lang_chat.push(s(state.language).trim().value());
      }
      if (R.exists(state.chat)) {
        lang_chat.push(s(state.chat).trim().value());
      }
      if (!R.isEmpty(lang_chat)) {
        ret += '[' + lang_chat.join(' ') + ']';
      }
      if (R.exists(state.faction) && !R.isEmpty(state.faction)) {
        ret += ' - ' + R.map(s.capitalize, state.faction).join(',');
      }
      if (R.exists(state.game_size)) {
        ret += '[' + s.trim(state.game_size) + 'pts]';
      }
      if (R.exists(state.ck_position) && !R.isEmpty(state.ck_position)) {
        ret += ' - likes ' + state.ck_position.join(',');
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
    return R.pipeP(R.bind(self.Promise.resolve, self.Promise), function (user) {
      return httpService.delete('/api/users/' + user.state.stamp).catch(R.always(null));
    }, R.always(user), userOnlineStop)(user);
  }
  function userCreateOnline(user) {
    return R.pipeP(R.bind(self.Promise.resolve, self.Promise), R.prop('state'), httpService.post$('/api/users'), function (state) {
      return R.assoc('state', state, user);
    })(user);
  }
  function userUpdateOnline(user) {
    if (R.isNil(user.state.stamp)) {
      return self.Promise.reject('No valid stamp');
    }

    return R.pipeP(R.bind(self.Promise.resolve, self.Promise), R.prop('state'), httpService.put$('/api/users/' + user.state.stamp), function (state) {
      return R.assoc('state', state, user);
    })(user);
  }
  function userOnlineStart(user) {
    return R.pipeP(R.bind(self.Promise.resolve, self.Promise), userConnectionService.open, R.assocPath(['state', 'online'], true), R.spy('User online start'), userService.save)(user);
  }
  function userOnlineStop(user) {
    return R.pipeP(userConnectionService.close, R.assocPath(['state', 'stamp'], null), R.assocPath(['state', 'online'], false), R.spy('User online stop'), userService.save)(user);
  }
  return userService;
}]);
//# sourceMappingURL=user.js.map