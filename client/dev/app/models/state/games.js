'use strict';

angular.module('clickApp.services').factory('stateGames', ['game', 'games', 'fileImport', function stateGamesServiceFactory(gameService, gamesService, fileImportService) {
  var stateGamesService = {
    init: function stateGamesInit(state) {
      state.local_games = {};
      state.games_ready = R.pipePromise(gamesService.loadLocalGames, setLocalGames$(state))();

      state.onEvent('Games.local.create', stateGamesService.onGamesLocalCreate$(state));
      state.onEvent('Games.local.load', stateGamesService.onGamesLocalLoad$(state));
      state.onEvent('Games.local.loadFile', stateGamesService.onGamesLocalLoadFile$(state));
      state.onEvent('Games.local.delete', stateGamesService.onGamesLocalDelete$(state));

      return state;
    },
    save: function stateGamesSave(state) {
      return state;
    },
    onGamesLocalCreate: function stateOnGamesLocalCreate(state, event) {
      event = event;
      return R.pipePromise(function () {
        return gameService.create(state.user.state);
      }, stateGamesService.loadNewLocalGame$(state))();
    },
    onGamesLocalLoad: function stateOnGamesLocalLoad(state, event, index) {
      state.changeEvent('Games.local.load', index);
    },
    onGamesLocalLoadFile: function stateOnGamesLocalLoadFile(state, event, file) {
      return R.pipePromise(fileImportService.read$('json'), stateGamesService.loadNewLocalGame$(state))(file);
    },
    onGamesLocalDelete: function stateOnGamesLocalDelete(state, event, id) {
      return R.pipePromise(gamesService.removeLocalGame$(id), setLocalGames$(state))(state.local_games);
    },
    loadNewLocalGame: function stateLoadNewLocalGame(state, game) {
      return R.pipePromise(gamesService.newLocalGame$(game), setLocalGames$(state), function () {
        state.changeEvent('Games.local.load', R.prop('local_stamp', R.last(state.local_games)));
      })(state.local_games);
    }
  };
  var setLocalGames$ = R.curry(function (state, games) {
    state.local_games = games;
    console.log('stateSetLocalGames', state.local_games);
    state.changeEvent('Games.local.change');
  });
  R.curryService(stateGamesService);
  return stateGamesService;
}]);
//# sourceMappingURL=games.js.map
