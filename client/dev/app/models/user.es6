angular.module('clickApp.services')
  .factory('user', [
    'http',
    'localStorage',
    'userConnection',
    function userServiceFactory(httpService,
                                localStorageService,
                                userConnectionService) {
      var STORAGE_KEY = 'clickApp.user';
      var userService = {
        isValid: function(user) {
          return R.pipe(
            R.pathOr('', ['state','name']),
            s.trim,
            R.length,
            R.lt(0)
          )(user);
        },
        save: function userSave(user) {
          return R.pipePromise(
            R.prop('state'),
            R.spyWarn('User save'),
            localStorageService.save$(STORAGE_KEY),
            R.always(user)
          )(user);
        },
        load: function userLoad() {
          return R.pipeP(
            () => {
              return localStorageService
                .load(STORAGE_KEY);
            },
            R.spyWarn('User load'),
            (state) => {
              return { state: state };
            },
            userConnectionService.init
          )();
        },
        init: function userInit(state) {
          return R.pipeP(
            userService.load,
            userService.checkOnline$(state)
          )();
        },
        description: function userDescription(user) {
          if(R.type(R.prop('state', user)) !== 'Object') return '';

          return userService.stateDescription(user.state);
        },
        stateDescription: function userStateDescription({ name,
                                                          language,
                                                          chat,
                                                          faction,
                                                          game_size,
                                                          ck_position
                                                        } = {}) {
          var ret = '';
          if(R.exists(name)) {
            ret += s(name).trim().capitalize().value();
          }
          var lang_chat = [];
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
        },
        online: function userOnline(user) {
          return R.path(['state','online'], user);
        },
        toggleOnline: function userToggleOnline(state, user) {
          return ( userService.online(user) ?
                   userGoOffline(user) :
                   userGoOnline(state, user)
                 );
        },
        checkOnline: function userCheckOnline(state, user) {
          return R.pipePromise(
            (user) => {
              if(!userService.online(user)) {
                return self.Promise.reject('No online flag');
              }
              return user;
            },
            (user) => {
              return userUpdateOnline(user)
                .catch(() => {
                  return userCreateOnline(user);
                });
            },
            userOnlineStart$(state)
          )(user)
            .catch((reason) => {
              console.error('User: checkOnline error', reason);
              return userOnlineStop(user);
            });
        }
      };
      function userGoOnline(state, user) {
        return R.pipePromise(
          R.assocPath(['state','online'], true),
          userService.checkOnline$(state)
        )(user);
      }
      function userGoOffline(user) {
        return userOnlineStop(user);
      }
      function userCreateOnline(user) {
        return R.pipePromise(
          R.prop('state'),
          httpService.post$('/api/users'),
          (state) => {
            return R.assoc('state', state, user);
          }
        )(user);
      }
      function userUpdateOnline(user) {
        if(R.isNil(user.state.stamp)) {
          return self.Promise.reject('No valid stamp');
        }

        return R.pipePromise(
          R.prop('state'),
          httpService.put$('/api/users/'+user.state.stamp),
          (state) => {
            return R.assoc('state', state, user);
          }
        )(user);
      }
      var userOnlineStart$ = R.curry((state, user) => {
        return R.pipePromise(
          userConnectionService.open$(state),
          R.assocPath(['state','online'], true)
        )(user);
      });
      function userOnlineStop(user) {
        return R.pipePromise(
          R.assocPath(['state','online'], false),
          R.assocPath(['state','stamp'], null),
          userConnectionService.close
        )(user);
      }
      R.curryService(userService);
      return userService;
    }
  ]);
