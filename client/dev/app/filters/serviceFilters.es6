(function() {
  angular.module('clickApp.filters')
    .filter('capitalize', capitalizeFilterFactory)
    .filter('game', gameFilterFactory)
    .filter('gameLayers', gameLayersFilterFactory)
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
      return gameModel[method].apply(null, R.append(input, args));
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
      return gameLayersModel[method].apply(null, R.append(input, args));
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
      return userConnectionModel[method].apply(null, R.append(input, args));
    };
  }
})();
