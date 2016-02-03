'use strict';

(function () {
  angular.module('clickApp.filters').filter('capitalize', capitalizeFilterFactory).filter('user', userFilterFactory).filter('userConnection', userConnectionFilterFactory);

  capitalizeFilterFactory.$inject = [];
  function capitalizeFilterFactory() {
    return function capitalizeFilter(input) {
      return s.capitalize(input);
    };
  }
  userFilterFactory.$inject = ['user'];
  function userFilterFactory(userModel) {
    return function userFilter(input, method) {
      if (!R.exists(userModel[method])) {
        console.error('User Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return userModel[method].apply(null, R.append(input, args));
    };
  }
  userConnectionFilterFactory.$inject = ['userConnection'];
  function userConnectionFilterFactory(userConnectionModel) {
    return function userConnectionFilter(input, method) {
      if (!R.exists(userConnectionModel[method])) {
        console.error('UserConnection Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      return userConnectionModel[method].apply(null, R.append(input, args));
    };
  }
})();
//# sourceMappingURL=serviceFilters.js.map
