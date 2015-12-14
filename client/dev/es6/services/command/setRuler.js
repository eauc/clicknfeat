angular.module('clickApp.services')
  .factory('setRulerCommand', [
    'commands',
    'gameRuler',
    function setRulerCommandServiceFactory(commandsService,
                                           gameRulerService) {
      var setRulerCommandService = {
        execute: function setRulerExecute(method, ...args /*, scope, game */) {
          if('Function' !== R.type(gameRulerService[method])) {
            return self.Promise.reject('Ruler unknown method '+method);
          }

          var game = R.last(args);
          var ctxt = {
            before: [],
            after: [],
            desc: method,
          };
          args = R.append(game.ruler, R.slice(0, -1, args));

          return R.pipePromise(
            () => {
              return gameRulerService.saveRemoteState(game.ruler);
            },
            (before) => {
              ctxt.before = before;
              
              return gameRulerService[method].apply(null, args);
            },
            (ruler) => {
              game.ruler = ruler;
              
              return gameRulerService.saveRemoteState(game.ruler);
            },
            (after) => {
              ctxt.after = after;
              return ctxt;
            }
          )();
        },
        replay: function setRulerRedo(ctxt, scope, game) {
          game.ruler = gameRulerService.resetRemote(ctxt.after, scope, game.ruler);
        },
        undo: function setRulerUndo(ctxt, scope, game) {
          game.ruler = gameRulerService.resetRemote(ctxt.before, scope, game.ruler);
        }
      };
      commandsService.registerCommand('setRuler', setRulerCommandService);
      return setRulerCommandService;
    }
  ]);
