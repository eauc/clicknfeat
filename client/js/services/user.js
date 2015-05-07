self.userServiceFactory = function userServiceFactory(localStorage) {
  var STORAGE_KEY = 'clickApp.user';
  var userService = {
    store: function userStore(user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    },
    load: function userLoad() {
      var data = localStorage.getItem(STORAGE_KEY);
      var user = {};
      if(R.type(data) === 'String') {
        try {
          user = JSON.parse(data);
        }
        catch(e) {
          console.log('could not parse stored user', e);
        }
      }
      return user;
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
};
