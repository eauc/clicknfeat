angular.module('clickApp.services')
  .factory('setLosCommand', [
    'commands',
    'gameLos',
    function setLosCommandServiceFactory(commandsService,
                                         gameLosService) {
      var setLosCommandService = {
        execute: function setLosExecute(method, ...args /*, game */) {
          if('Function' !== R.type(gameLosService[method])) {
            return self.Promise.reject('Los unknown method '+method);
          }

          var game = R.last(args);
          var ctxt = {
            before: [],
            after: [],
            desc: method,
          };
          args = [ ...R.slice(0, -1, args), game, game.los ];
          
          return R.pipePromise(
            () => {
              return gameLosService.saveRemoteState(game.los);
            },
            (before) => {
              ctxt.before = before;
              
              return gameLosService[method].apply(null, args);
            },
            (los) => {
              game.los = los;
              
              return gameLosService.saveRemoteState(game.los);
            },
            (after) => {
              ctxt.after = after;
              return ctxt;
            }
          )();
        },
        replay: function setLosRedo(ctxt, scope, game) {
          return R.pipeP(
            gameLosService.resetRemote$(ctxt.after, scope, game),
            (los) => {
              game.los = los;
            }
          )(game.los);
        },
        undo: function setLosUndo(ctxt, scope, game) {
          return R.pipeP(
            gameLosService.resetRemote$(ctxt.before, scope, game),
            (los) => {
              game.los = los;
            }
          )(game.los);
        }
      };
      commandsService.registerCommand('setLos', setLosCommandService);
      return setLosCommandService;
    }
  ]);
