(function() {
  angular.module('clickApp.filters')
    .filter('capitalize', capitalizeFilterFactory)
    .filter('user', userFilterFactory)
    .filter('userConnection', userConnectionFilterFactory);

  capitalizeFilterFactory.$inject = [];
  function capitalizeFilterFactory() {
    return function capitalizeFilter(input) {
      return s.capitalize(input);
    };
  }
  userFilterFactory.$inject = [
    'user',
  ];
  function userFilterFactory(userModel) {
    return function userFilter(input, method, ...args) {
      if(!R.exists(userModel[method])) {
        console.error('User Filter: method "'+method+'" does not exist');
        return null;
      }
      return userModel[method].apply(null, R.append(input, args));
    };
  }
  userConnectionFilterFactory.$inject = [
    'userConnection',
  ];
  function userConnectionFilterFactory(userConnectionModel) {
    return function userConnectionFilter(input, method, ...args) {
      if(!R.exists(userConnectionModel[method])) {
        console.error('UserConnection Filter: method "'+method+'" does not exist');
        return null;
      }
      return userConnectionModel[method].apply(null, R.append(input, args));
    };
  }
})();
