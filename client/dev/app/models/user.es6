(function() {
  angular.module('clickApp.models')
    .factory('user', userModelFactory);

  userModelFactory.$inject = [
    'http',
    'localStorage',
    'userConnection',
  ];
  function userModelFactory(httpService,
                            localStorageService,
                            userConnectionService) {
    const STORAGE_KEY = 'clickApp.user';
    const userModel = {
      isValid: userIsValid,
      save: userSave,
      loadP: userLoadP,
      initP: userInitP,
      description: userDescription,
      stateDescription: userStateDescription,
      online: userOnline,
      // toggleOnline: userToggleOnline,
      // checkOnline: userCheckOnline
    };
    // const userOnlineStart$ = R.curry(userOnlineStart);
    R.curryService(userModel);
    return userModel;

    function userIsValid(user) {
      return R.thread(user)(
        R.pathOr('', ['state','name']),
        s.trim,
        R.length,
        R.lt(0)
      );
    }
    function userSave(user) {
      return R.thread(user)(
        R.prop('state'),
        R.spyWarn('User save'),
        localStorageService.save$(STORAGE_KEY),
        R.always(user)
      );
    }
    function userLoadP() {
      return R.threadP(STORAGE_KEY)(
        localStorageService.loadP,
        R.defaultTo({}),
        R.spyWarn('User load'),
        (state) => ({ state: state }),
        userConnectionService.init
      );
    }
    function userInitP(state) {
      return R.pipeP(
        userLoadP
        // ,
        // userModel.checkOnline$(state)
      )();
    }
    function userDescription(user) {
      if(R.type(R.prop('state', user)) !== 'Object') return '';

      return userModel.stateDescription(user.state);
    }
    function userStateDescription({ name,
                                    language,
                                    chat,
                                    faction,
                                    game_size,
                                    ck_position
                                  } = {}) {
      let ret = '';
      if(R.exists(name)) {
        ret += s(name).trim().capitalize().value();
      }
      const lang_chat = [];
      if(R.exists(language)) {
        lang_chat.push(s(language).trim().value());
      }
      if(R.exists(chat)) {
        lang_chat.push(s(chat).trim().value());
      }
      if(!R.isEmpty(lang_chat)) {
        ret += '['+lang_chat.join(' ')+']';
      }
      if(R.exists(faction) &&
         !R.isEmpty(faction)) {
        ret += ' - '+R.map(s.capitalize, faction).join(',');
      }
      if(R.exists(game_size)) {
        ret += '['+s.trim(game_size)+'pts]';
      }
      if(R.exists(ck_position) &&
         !R.isEmpty(ck_position)) {
        ret += ' - likes '+ck_position.join(',');
      }
      return ret;
    }
    function userOnline(user) {
      return R.path(['state','online'], user);
    }
    // function userToggleOnline(state, user) {
    //   return ( userModel.online(user) ?
    //            userGoOffline(user) :
    //            userGoOnline(state, user)
    //          );
    // }
    // function userCheckOnline(state, user) {
    //   return R.pipePromise(
    //     (user) => {
    //       if(!userModel.online(user)) {
    //         return self.Promise.reject('No online flag');
    //       }
    //       return user;
    //     },
    //     (user) => {
    //       return userUpdateOnline(user)
    //         .catch(() => {
    //           return userCreateOnline(user);
    //         });
    //     },
    //     userOnlineStart$(state)
    //   )(user)
    //     .catch((reason) => {
    //       console.error('User: checkOnline error', reason);
    //       return userOnlineStop(user);
    //     });
    // }
    // function userGoOnline(state, user) {
    //   return R.pipePromise(
    //     R.assocPath(['state','online'], true),
    //     userModel.checkOnline$(state)
    //   )(user);
    // }
    // function userGoOffline(user) {
    //   return userOnlineStop(user);
    // }
    // function userCreateOnline(user) {
    //   return R.pipePromise(
    //     R.prop('state'),
    //     httpService.post$('/api/users'),
    //     (state) => {
    //       return R.assoc('state', state, user);
    //     }
    //   )(user);
    // }
    // function userUpdateOnline(user) {
    //   if(R.isNil(user.state.stamp)) {
    //     return self.Promise.reject('No valid stamp');
    //   }

    //   return R.pipePromise(
    //     R.prop('state'),
    //     httpService.put$('/api/users/'+user.state.stamp),
    //     (state) => {
    //       return R.assoc('state', state, user);
    //     }
    //   )(user);
    // }
    // function userOnlineStart(state, user) {
    //   return R.pipePromise(
    //     userConnectionService.open$(state),
    //     R.assocPath(['state','online'], true)
    //   )(user);
    // }
    // function userOnlineStop(user) {
    //   return R.pipePromise(
    //     R.assocPath(['state','online'], false),
    //     R.assocPath(['state','stamp'], null),
    //     userConnectionService.close
    //   )(user);
    // }
  }
})();
