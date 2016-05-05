(function() {
  angular.module('clickApp.filters')
    .filter('capitalize', capitalizeFilterFactory)
    .filter('game', gameFilterFactory)
    .filter('gameConnection', gameConnectionFilterFactory)
    .filter('gameLayers', gameLayersFilterFactory)
    .filter('gameLos', gameLosFilterFactory)
    .filter('gameRuler', gameRulerFilterFactory)
    .filter('user', userFilterFactory)
    .filter('userConnection', userConnectionFilterFactory);

  capitalizeFilterFactory.$inject = [];
  function capitalizeFilterFactory() {
    return function capitalizeFilter(input) {
      return s.capitalize(input);
    };
  }
  gameFilterFactory.$inject = [
    'game',
  ];
  function gameFilterFactory(gameModel) {
    return function gameFilter(input, method, ...args) {
      if(R.isNil(gameModel[method])) {
        console.error('Game Filter: method "'+method+'" does not exist');
        return null;
      }
      if(R.isNil(input)) return null;
      return gameModel[method].apply(null, R.append(input, args));
    };
  }
  gameConnectionFilterFactory.$inject = [
    'gameConnection',
  ];
  function gameConnectionFilterFactory(gameConnectionModel) {
    return function gameConnectionFilter(input, method, ...args) {
      if(R.isNil(gameConnectionModel[method])) {
        console.error('GameConnection Filter: method "'+method+'" does not exist');
        return null;
      }
      if(R.isNil(input)) return null;
      return gameConnectionModel[method].apply(null, R.append(input, args));
    };
  }
  gameLayersFilterFactory.$inject = [
    'gameLayers',
  ];
  function gameLayersFilterFactory(gameLayersModel) {
    return function gameLayersFilter(input, method, ...args) {
      if(R.isNil(gameLayersModel[method])) {
        console.error('GameLayers Filter: method "'+method+'" does not exist');
        return null;
      }
      if(R.isNil(input)) return null;
      return gameLayersModel[method].apply(null, R.append(input, args));
    };
  }
  gameLosFilterFactory.$inject = [
    'gameLos',
  ];
  function gameLosFilterFactory(gameLosModel) {
    return function gameLosFilter(input, method, ...args) {
      if(R.isNil(gameLosModel[method])) {
        console.error('GameLos Filter: method "'+method+'" does not exist');
        return null;
      }
      if(R.isNil(input)) return null;
      return gameLosModel[method].apply(null, R.append(input, args));
    };
  }
  gameRulerFilterFactory.$inject = [
    'gameRuler',
  ];
  function gameRulerFilterFactory(gameRulerModel) {
    return function gameRulerFilter(input, method, ...args) {
      if(R.isNil(gameRulerModel[method])) {
        console.error('GameRuler Filter: method "'+method+'" does not exist');
        return null;
      }
      if(R.isNil(input)) return null;
      return gameRulerModel[method].apply(null, R.append(input, args));
    };
  }
  userFilterFactory.$inject = [
    'user',
  ];
  function userFilterFactory(userModel) {
    return function userFilter(input, method, ...args) {
      if(R.isNil(userModel[method])) {
        console.error('User Filter: method "'+method+'" does not exist');
        return null;
      }
      if(R.isNil(input)) return null;
      return userModel[method].apply(null, R.append(input, args));
    };
  }
  userConnectionFilterFactory.$inject = [
    'userConnection',
  ];
  function userConnectionFilterFactory(userConnectionModel) {
    return function userConnectionFilter(input, method, ...args) {
      if(R.isNil(userConnectionModel[method])) {
        console.error('UserConnection Filter: method "'+method+'" does not exist');
        return null;
      }
      if(R.isNil(input)) return null;
      return userConnectionModel[method].apply(null, R.append(input, args));
    };
  }
})();
