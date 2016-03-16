'use strict';

(function () {
  angular.module('clickApp.models').factory('user', userModelFactory);

  userModelFactory.$inject = ['http', 'localStorage', 'userConnection'];
  function userModelFactory(httpService, localStorageService, userConnectionModel) {
    var STORAGE_KEY = 'clickApp.user';
    var userModel = {
      isValid: userIsValid,
      save: userSave,
      loadP: userLoadP,
      initP: userInitP,
      description: userDescription,
      stateDescription: userStateDescription,
      online: userOnline,
      toggleOnlineP: userToggleOnlineP,
      checkOnlineP: userCheckOnlineP
    };

    R.curryService(userModel);
    return userModel;

    function userIsValid(user) {
      return R.thread(user)(R.pathOr('', ['state', 'name']), s.trim, R.length, R.lt(0));
    }
    function userSave(user) {
      return R.thread(user)(R.prop('state'), R.spyWarn('User save'), localStorageService.save$(STORAGE_KEY), R.always(user));
    }
    function userLoadP() {
      return R.threadP(STORAGE_KEY)(localStorageService.loadP, R.defaultTo({}), R.spyWarn('User load'), function (state) {
        return { state: state };
      }, userConnectionModel.init);
    }
    function userInitP(state) {
      return R.threadP()(userLoadP, userModel.checkOnlineP$(state));
    }
    function userDescription(user) {
      if (R.type(R.prop('state', user)) !== 'Object') return '';

      return userModel.stateDescription(user.state);
    }
    function userStateDescription() {
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
        ret += ' [' + lang_chat.join(' ') + ']';
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
    }
    function userOnline(user) {
      return R.path(['state', 'online'], user);
    }
    function userToggleOnlineP(state, user) {
      return userModel.online(user) ? userGoOffline(user) : userGoOnlineP(state, user);
    }
    function userCheckOnlineP(state, user) {
      return R.threadP(user)(R.rejectIf(R.complement(userModel.online), 'No online flag'), function (user) {
        return userUpdateOnlineP(user).catch(function () {
          return userCreateOnlineP(user);
        });
      }, function (user) {
        return userOnlineStartP(state, user);
      }).catch(function (reason) {
        console.error('User: checkOnline error', reason);
        return userOnlineStop(user);
      });
    }
    function userGoOnlineP(state, user) {
      return R.threadP(user)(R.assocPath(['state', 'online'], true), userModel.checkOnlineP$(state));
    }
    function userGoOffline(user) {
      return userOnlineStop(user);
    }
    function userCreateOnlineP(user) {
      return R.threadP(user)(R.prop('state'), httpService.postP$('/api/users'), function (state) {
        return R.assoc('state', state, user);
      });
    }
    function userUpdateOnlineP(user) {
      return R.threadP(user)(R.rejectIf(R.compose(R.isNil, R.path(['state', 'stamp'])), 'No valid stamp'), R.prop('state'), httpService.putP$('/api/users/' + user.state.stamp), function (state) {
        return R.assoc('state', state, user);
      });
    }
    function userOnlineStartP(state, user) {
      return R.threadP(user)(userConnectionModel.openP$(state), R.assocPath(['state', 'online'], true));
    }
    function userOnlineStop(user) {
      return R.thread(user)(R.assocPath(['state', 'online'], false),
      // R.assocPath(['state','stamp'], null),
      userConnectionModel.close);
    }
  }
})();
//# sourceMappingURL=user.js.map
