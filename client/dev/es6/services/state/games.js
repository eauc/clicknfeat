angular.module('clickApp.services')
  .factory('stateGames', [
    'game',
    'games',
    'fileImport',
    function stateGamesServiceFactory(gameService,
                                      gamesService,
                                      fileImportService) {
      var stateGamesService = {
        init: function stateGamesInit(state) {
          state.local_games = {};
          state.games_ready = R.pipeP(
            gamesService.loadLocalGames,
            setLocalGames$(state)
          )();

          state.onEvent('Games.local.create',
                        stateGamesService.onGamesLocalCreate$(state));
          state.onEvent('Games.local.load',
                        stateGamesService.onGamesLocalLoad$(state));
          state.onEvent('Games.local.loadFile',
                        stateGamesService.onGamesLocalLoadFile$(state));
          state.onEvent('Games.local.delete',
                        stateGamesService.onGamesLocalDelete$(state));

          return state;
        },
        save: function stateGamesSave(state) {
          return R.pipePromise(
            (games) => {
              let current_game_local_id = parseInt(R.path(['game','local_id'], state));
              if(R.isNil(current_game_local_id) ||
                 isNaN(current_game_local_id)) return games;
              return R.pipe(
                gamesService.updateLocalGame$(current_game_local_id, state.game),
                (games) => {
                  state.local_games = games;
                  return games;
                }
              )(games);
            },
            gamesService.storeLocalGames
          )(state.local_games);
        },
        onGamesLocalCreate: function stateOnGamesLocalCreate(state, event) {
          event = event;
          return R.pipePromise(
            () => {
              return gameService.create(state.user.state);
            },
            stateGamesService.loadNewLocalGame$(state)
          )();
        },
        onGamesLocalLoad: function stateOnGamesLocalLoad(state, event, index) {
          state.changeEvent('Games.local.load', index);
        },
        onGamesLocalLoadFile: function stateOnGamesLocalLoadFile(state, event, file) {
          return R.pipePromise(
            fileImportService.read$('json'),
            stateGamesService.loadNewLocalGame$(state)
          )(file);
        },
        onGamesLocalDelete: function stateOnGamesLocalDelete(state, event, index) {
          return R.pipePromise(
            gamesService.removeLocalGame$(index),
            setLocalGames$(state)
          )(state.local_games);
        },
        loadNewLocalGame: function stateLoadNewLocalGame(state, game) {
          return R.pipe(
            gamesService.newLocalGame$(game),
            setLocalGames$(state),
            () => {
              state.changeEvent('Games.local.load',
                                R.length(state.local_games) - 1);
            }
          )(state.local_games);
        }
      };
      var setLocalGames$ = R.curry((state, games) => {
        state.local_games = games;
        console.log('stateSetLocalGames', state.local_games);
        state.changeEvent('Games.local.change');
      });
      R.curryService(stateGamesService);
      return stateGamesService;
    }
  ]);
