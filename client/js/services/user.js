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
    }
  };
  return userService;
};
