'use strict';

(function () {
  angular.module('clickApp.models').factory('user', userModelFactory);

  userModelFactory.$inject = ['http', 'localStorage', 'userConnection'];
  function userModelFactory(httpService, localStorageService, userConnectionModel) {
    var STORAGE_KEY = 'clickApp.user';
    var userModel = {
      isValid: userIsValid,
      saveP: userSaveP,
      loadP: userLoadP,
      initP: userInitP,
      description: userDescription,
      stateDescription: userStateDescription,
      isOnline: userIsOnline,
      toggleOnlineP: userToggleOnlineP,
      checkOnlineP: userCheckOnlineP
    };

    R.curryService(userModel);
    return userModel;

    function userIsValid(user) {
      return R.thread(user)(R.pathOr('', ['state', 'name']), s.trim, R.length, R.lt(0));
    }
    function userSaveP(user) {
      return R.threadP(user)(R.when(userModel.isOnline, userUpdateOnlineP), R.prop('state'), R.spyWarn('User save'), localStorageService.save$(STORAGE_KEY), R.always(user));
    }
    function userLoadP() {
      return R.threadP(STORAGE_KEY)(localStorageService.loadP, R.defaultTo({}), R.spyInfo('User load'), function (state) {
        return { state: state };
      }, userConnectionModel.init);
    }
    function userInitP() {
      return R.threadP()(userLoadP, userModel.checkOnlineP);
    }
    function userDescription(user) {
      return R.thread(user)(R.prop('state'), R.ifElse(R.compose(R.equals('Object'), R.type), userModel.stateDescription, R.always('')));
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
    function userIsOnline(user) {
      return R.path(['state', 'online'], user);
    }
    function userToggleOnlineP(user) {
      return userModel.isOnline(user) ? userGoOffline(user) : userGoOnlineP(user);
    }
    function userCheckOnlineP(user) {
      return R.threadP(user)(R.rejectIfP(R.complement(userModel.isOnline), 'No online flag'), function (user) {
        return userUpdateOnlineP(user).catch(function () {
          return userCreateOnlineP(user);
        });
      }, userOnlineStartP).catch(function (reason) {
        console.error('User: checkOnline error', reason);
        return userOnlineStop(user);
      });
    }
    function userGoOnlineP(user) {
      return R.threadP(user)(R.assocPath(['state', 'online'], true), userModel.checkOnlineP);
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
      return R.threadP(user)(R.rejectIfP(R.compose(R.isNil, R.path(['state', 'stamp'])), 'No valid stamp'), R.prop('state'), httpService.putP$('/api/users/' + user.state.stamp), function (state) {
        return R.assoc('state', state, user);
      });
    }
    function userOnlineStartP(user) {
      return R.threadP(user)(userConnectionModel.openP, R.assocPath(['state', 'online'], true));
    }
    function userOnlineStop(user) {
      return R.thread(user)(R.assocPath(['state', 'online'], false), userConnectionModel.close);
    }
  }
})();
//# sourceMappingURL=user.js.map
