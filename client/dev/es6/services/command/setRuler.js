angular.module('clickApp.services')
  .factory('setRulerCommand', [
    'commands',
    'gameRuler',
    function setRulerCommandServiceFactory(commandsService,
                                           gameRulerService) {
      var setRulerCommandService = {
        execute: function setRulerExecute(method, args, state, game) {
          if('Function' !== R.type(gameRulerService[method])) {
            return self.Promise.reject(`Ruler unknown method ${method}`);
          }

          var ctxt = {
            before: [],
            after: [],
            desc: method
          };

          return R.pipePromise(
            gameRulerService.saveRemoteState,
            (before) => {
              ctxt.before = before;
              
              return gameRulerService[method]
                .apply(null, [...args, state, game.ruler]);
            },
            (ruler) => {
              game = R.assoc('ruler', ruler, game);
              
              return gameRulerService.saveRemoteState(game.ruler);
            },
            (after) => {
              ctxt.after = after;

              state.changeEvent('Game.ruler.remote.change');
              
              return [ctxt, game];
            }
          )(game.ruler);
        },
        replay: function setRulerRedo(ctxt, state, game) {
          game = R.over(R.lensProp('ruler'),
                        gameRulerService.resetRemote$(ctxt.after, state),
                        game);
          state.changeEvent('Game.ruler.remote.change');
          return game;
        },
        undo: function setRulerUndo(ctxt, state, game) {
          game = R.over(R.lensProp('ruler'),
                        gameRulerService.resetRemote$(ctxt.before, state),
                        game);
          state.changeEvent('Game.ruler.remote.change');
          return game;
        }
      };
      commandsService.registerCommand('setRuler', setRulerCommandService);
      return setRulerCommandService;
    }
  ]);
