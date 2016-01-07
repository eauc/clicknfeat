angular.module('clickApp.services')
  .factory('setLosCommand', [
    'commands',
    'gameLos',
    function setLosCommandServiceFactory(commandsService,
                                         gameLosService) {
      var setLosCommandService = {
        execute: function setLosExecute(method, args, state, game) {
          if('Function' !== R.type(gameLosService[method])) {
            return self.Promise.reject(`Los unknown method ${method}`);
          }

          var ctxt = {
            before: [],
            after: [],
            desc: method
          };
          
          return R.pipePromise(
            gameLosService.saveRemoteState,
            (before) => {
              ctxt.before = before;
              
              return gameLosService[method]
                .apply(null, [...args, state, game, game.los]);
            },
            (los) => {
              game = R.assoc('los', los, game);
              
              return gameLosService.saveRemoteState(game.los);
            },
            (after) => {
              ctxt.after = after;

              state.changeEvent('Game.los.remote.change');
              
              return [ctxt, game];
            }
          )(game.los);
        },
        replay: function setLosRedo(ctxt, state, game) {
          return R.pipeP(
            gameLosService.resetRemote$(ctxt.after, state, game),
            (los) => {
              state.changeEvent('Game.los.remote.change');

              return R.assoc('los', los, game);
            }
          )(game.los);
        },
        undo: function setLosUndo(ctxt, state, game) {
          return R.pipeP(
            gameLosService.resetRemote$(ctxt.before, state, game),
            (los) => {
              state.changeEvent('Game.los.remote.change');

              return R.assoc('los', los, game);
            }
          )(game.los);
        }
      };
      commandsService.registerCommand('setLos', setLosCommandService);
      return setLosCommandService;
    }
  ]);
