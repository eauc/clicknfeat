'use strict';

angular.module('clickApp.services')
  .factory('user', [
    'localStorage',
    function userServiceFactory(localStorageService) {
      var STORAGE_KEY = 'clickApp.user';
      var userService = {
        save: function userSave(user) {
          return localStorageService.save(STORAGE_KEY, user);
        },
        load: function userLoad() {
          return localStorageService.load(STORAGE_KEY);
        },
        description: function userDescription(user) {
          var ret = '';
          if(R.type(user) !== 'Object') return ret;

          if(R.exists(user.name)) {
            ret += s(user.name).trim().capitalize().value();
          }
          var lang_chat = [];
          if(R.exists(user.language)) {
            lang_chat.push(s(user.language).trim().value());
          }
          if(R.exists(user.chat)) {
            lang_chat.push(s(user.chat).trim().value());
          }
          if(!R.isEmpty(lang_chat)) {
            ret += '['+lang_chat.join(' ')+']';
          }
          if(R.exists(user.faction) &&
             !R.isEmpty(user.faction)) {
            ret += ' - '+R.map(s.capitalize, user.faction).join(',');
          }
          if(R.exists(user.game_size)) {
            ret += '['+s.trim(user.game_size)+'pts]';
          }
          if(R.exists(user.ck_position) &&
             !R.isEmpty(user.ck_position)) {
            ret += ' - likes '+user.ck_position.join(',');
          }
          return ret;
        }
      };
      return userService;
    }
  ]);
