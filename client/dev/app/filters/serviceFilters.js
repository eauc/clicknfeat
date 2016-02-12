'use strict';

(function () {
  angular.module('clickApp.filters').filter('capitalize', capitalizeFilterFactory).filter('game', gameFilterFactory).filter('gameLayers', gameLayersFilterFactory).filter('user', userFilterFactory).filter('userConnection', userConnectionFilterFactory);

  capitalizeFilterFactory.$inject = [];
  function capitalizeFilterFactory() {
    return function capitalizeFilter(input) {
      return s.capitalize(input);
    };
  }
  gameFilterFactory.$inject = ['game'];
  function gameFilterFactory(gameModel) {
    return function gameFilter(input, method) {
      if (R.isNil(gameModel[method])) {
        console.error('Game Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      return gameModel[method].apply(null, R.append(input, args));
    };
  }
  gameLayersFilterFactory.$inject = ['gameLayers'];
  function gameLayersFilterFactory(gameLayersModel) {
    return function gameLayersFilter(input, method) {
      if (R.isNil(gameLayersModel[method])) {
        console.error('GameLayers Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      return gameLayersModel[method].apply(null, R.append(input, args));
    };
  }
  userFilterFactory.$inject = ['user'];
  function userFilterFactory(userModel) {
    return function userFilter(input, method) {
      if (R.isNil(userModel[method])) {
        console.error('User Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      return userModel[method].apply(null, R.append(input, args));
    };
  }
  userConnectionFilterFactory.$inject = ['userConnection'];
  function userConnectionFilterFactory(userConnectionModel) {
    return function userConnectionFilter(input, method) {
      if (R.isNil(userConnectionModel[method])) {
        console.error('UserConnection Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        args[_key4 - 2] = arguments[_key4];
      }

      return userConnectionModel[method].apply(null, R.append(input, args));
    };
  }
})();
//# sourceMappingURL=serviceFilters.js.map
