'use strict';

(function () {
  angular.module('clickApp.filters').filter('capitalize', capitalizeFilterFactory).filter('game', gameFilterFactory).filter('gameConnection', gameConnectionFilterFactory).filter('gameLayers', gameLayersFilterFactory).filter('gameLos', gameLosFilterFactory).filter('gameRuler', gameRulerFilterFactory).filter('user', userFilterFactory).filter('userConnection', userConnectionFilterFactory);

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
  gameConnectionFilterFactory.$inject = ['gameConnection'];
  function gameConnectionFilterFactory(gameConnectionModel) {
    return function gameConnectionFilter(input, method) {
      if (R.isNil(gameConnectionModel[method])) {
        console.error('GameConnection Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
        args[_key2 - 2] = arguments[_key2];
      }

      return gameConnectionModel[method].apply(null, R.append(input, args));
    };
  }
  gameLayersFilterFactory.$inject = ['gameLayers'];
  function gameLayersFilterFactory(gameLayersModel) {
    return function gameLayersFilter(input, method) {
      if (R.isNil(gameLayersModel[method])) {
        console.error('GameLayers Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
        args[_key3 - 2] = arguments[_key3];
      }

      return gameLayersModel[method].apply(null, R.append(input, args));
    };
  }
  gameLosFilterFactory.$inject = ['gameLos'];
  function gameLosFilterFactory(gameLosModel) {
    return function gameLosFilter(input, method) {
      if (R.isNil(gameLosModel[method])) {
        console.error('GameLos Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
        args[_key4 - 2] = arguments[_key4];
      }

      return gameLosModel[method].apply(null, R.append(input, args));
    };
  }
  gameRulerFilterFactory.$inject = ['gameRuler'];
  function gameRulerFilterFactory(gameRulerModel) {
    return function gameRulerFilter(input, method) {
      if (R.isNil(gameRulerModel[method])) {
        console.error('GameRuler Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len5 = arguments.length, args = Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
        args[_key5 - 2] = arguments[_key5];
      }

      return gameRulerModel[method].apply(null, R.append(input, args));
    };
  }
  userFilterFactory.$inject = ['user'];
  function userFilterFactory(userModel) {
    return function userFilter(input, method) {
      if (R.isNil(userModel[method])) {
        console.error('User Filter: method "' + method + '" does not exist');
        return null;
      }

      for (var _len6 = arguments.length, args = Array(_len6 > 2 ? _len6 - 2 : 0), _key6 = 2; _key6 < _len6; _key6++) {
        args[_key6 - 2] = arguments[_key6];
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

      for (var _len7 = arguments.length, args = Array(_len7 > 2 ? _len7 - 2 : 0), _key7 = 2; _key7 < _len7; _key7++) {
        args[_key7 - 2] = arguments[_key7];
      }

      return userConnectionModel[method].apply(null, R.append(input, args));
    };
  }
})();
//# sourceMappingURL=serviceFilters.js.map
