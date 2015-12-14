'use strict';

angular.module('clickApp.filters').filter('capitalize', [function () {
  return function (input) {
    return s.capitalize(input);
  };
}]).filter('game', ['game', function (gameService) {
  return function (input, method) {
    if (!R.exists(gameService[method])) {
      console.error('Game Filter: method "' + method + '" does not exist');
      return null;
    }

    for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
      args[_key - 2] = arguments[_key];
    }

    return gameService[method].apply(null, R.append(input, args));
  };
}]).filter('gameConnection', ['gameConnection', function (gameConnectionService) {
  return function (input, method) {
    if (!R.exists(gameConnectionService[method])) {
      console.error('gameConnection Filter: method "' + method + '" does not exist');
      return null;
    }

    for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      args[_key2 - 2] = arguments[_key2];
    }

    return gameConnectionService[method].apply(null, R.append(input, args));
  };
}]).filter('gameLayers', ['gameLayers', function (gameLayersService) {
  return function (input, method) {
    if (!R.exists(gameLayersService[method])) {
      console.error('gameLayers Filter: method "' + method + '" does not exist');
      return null;
    }

    for (var _len3 = arguments.length, args = Array(_len3 > 2 ? _len3 - 2 : 0), _key3 = 2; _key3 < _len3; _key3++) {
      args[_key3 - 2] = arguments[_key3];
    }

    return gameLayersService[method].apply(null, R.append(input, args));
  };
}]).filter('gameRuler', ['gameRuler', function (gameRulerService) {
  return function (input, method) {
    if (!R.exists(gameRulerService[method])) {
      console.error('gameRuler Filter: method "' + method + '" does not exist');
      return null;
    }

    for (var _len4 = arguments.length, args = Array(_len4 > 2 ? _len4 - 2 : 0), _key4 = 2; _key4 < _len4; _key4++) {
      args[_key4 - 2] = arguments[_key4];
    }

    return gameRulerService[method].apply(null, R.append(input, args));
  };
}]).filter('gameLos', ['gameLos', function (gameLosService) {
  return function (input, method) {
    if (!R.exists(gameLosService[method])) {
      console.error('gameLos Filter: method "' + method + '" does not exist');
      return null;
    }

    for (var _len5 = arguments.length, args = Array(_len5 > 2 ? _len5 - 2 : 0), _key5 = 2; _key5 < _len5; _key5++) {
      args[_key5 - 2] = arguments[_key5];
    }

    return gameLosService[method].apply(null, R.append(input, args));
  };
}]).filter('modes', ['modes', function (modesService) {
  return function (input, method) {
    if (!R.exists(modesService[method])) {
      console.error('Modes Filter: method "' + method + '" does not exist');
      return null;
    }

    for (var _len6 = arguments.length, args = Array(_len6 > 2 ? _len6 - 2 : 0), _key6 = 2; _key6 < _len6; _key6++) {
      args[_key6 - 2] = arguments[_key6];
    }

    return modesService[method].apply(null, R.append(input, args));
  };
}]).filter('user', ['user', function (userService) {
  return function (input, method) {
    if (!R.exists(userService[method])) {
      console.error('User Filter: method "' + method + '" does not exist');
      return null;
    }

    for (var _len7 = arguments.length, args = Array(_len7 > 2 ? _len7 - 2 : 0), _key7 = 2; _key7 < _len7; _key7++) {
      args[_key7 - 2] = arguments[_key7];
    }

    return userService[method].apply(null, R.append(input, args));
  };
}]).filter('userConnection', ['userConnection', function (userConnectionService) {
  return function (input, method) {
    if (!R.exists(userConnectionService[method])) {
      console.error('UserConnection Filter: method "' + method + '" does not exist');
      return null;
    }

    for (var _len8 = arguments.length, args = Array(_len8 > 2 ? _len8 - 2 : 0), _key8 = 2; _key8 < _len8; _key8++) {
      args[_key8 - 2] = arguments[_key8];
    }

    return userConnectionService[method].apply(null, R.append(input, args));
  };
}]);
//# sourceMappingURL=serviceFilters.js.map
