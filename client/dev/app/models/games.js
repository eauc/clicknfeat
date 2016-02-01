'use strict';

angular.module('clickApp.services').factory('games', ['localStorage', 'http', 'game', function gamesServiceFactory(localStorageService, httpService, gameService) {
  var LOCAL_GAME_STORAGE_KEY = 'clickApp.game.';
  var gamesService = {
    loadLocalGames: function gamesLoadLocalGames() {
      return R.pipePromise(R.always(localStorageService.keys()), R.filter(function (k) {
        return k.startsWith(LOCAL_GAME_STORAGE_KEY);
      }), R.map(function (k) {
        return localStorageService.load(k).catch(R.spy('games: Failed to load local game', k));
      }), R.promiseAll, R.reject(R.isNil), R.defaultTo([]), R.spyWarn('Games local load'))();
    },
    saveLocalGame: function gamesSaveLocalGame(game) {
      var key = LOCAL_GAME_STORAGE_KEY + game.local_stamp;
      console.warn('Game save', key, game);
      return localStorageService.save(key, game);
    },
    loadLocalGame: function gamesLoadLocalGame(id) {
      var key = LOCAL_GAME_STORAGE_KEY + id;
      console.warn('Game load', key);
      return localStorageService.load(key);
    },
    newLocalGame: function gamesNewLocalGame(game, games) {
      return R.pipePromise(R.always(game), R.assoc('local_stamp', R.guid()), gamesService.saveLocalGame, R.flip(R.append)(games))();
    },
    removeLocalGame: function gamesRemoveLocalGame(id, games) {
      return R.pipePromise(R.always(LOCAL_GAME_STORAGE_KEY + id), localStorageService.removeItem, R.always(games), R.reject(R.propEq('local_stamp', id)))();
    },
    updateLocalGame: function gamesUpdateLocalGame(game, games) {
      return R.pipePromise(R.always(game), gamesService.saveLocalGame, R.always(games), R.update(R.findIndex(R.propEq('local_stamp', game.local_stamp), games), game))();
    },
    newOnlineGame: function gamesNewOnlineGame(game) {
      return R.pipePromise(gameService.pickForJson, R.spyWarn('upload game'), httpService.post$('/api/games'), R.spyWarn('upload game response'))(game);
    },
    loadOnlineGame: function gamesLoadOnlineGame(is_private, id) {
      var url = ['/api/games', is_private ? 'private' : 'public', id].join('/');
      return R.pipeP(httpService.get, R.spyError('Games: load online game'))(url);
    }
  };
  R.curryService(gamesService);
  return gamesService;
}]);
//# sourceMappingURL=games.js.map
