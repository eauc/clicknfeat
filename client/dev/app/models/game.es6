(function() {
  angular.module('clickApp.services')
    .factory('game', gameModelFactory);

  gameModelFactory.$inject = [
    'jsonStringifier',
    'commands',
    // 'gameConnection',
    // 'gameLayers',
    // 'gameLos',
    // 'gameModels',
    // 'gameModelSelection',
    // 'gameRuler',
    // 'gameTemplates',
    // 'gameTemplateSelection',
    // 'gameTerrains',
    // 'gameTerrainSelection',
  ];
  function gameModelFactory(jsonStringifierService,
                            commandsService) {
                              // gameConnectionService,
                              // gameLayersService,
                              // gameLosService,
                              // gameModelsService,
                              // gameModelSelectionService,
                              // gameRulerService,
                              // gameTemplatesService,
                              // gameTemplateSelectionService,
                              // gameTerrainsService,
                              // gameTerrainSelectionService
                             // ) {
    const gameModel = {
      create: gameCreate,
      loadP: gameLoadP,
      // pickForJson: gamePickForJson,
      toJson: gameToJson,
      description: gameDescription,
      // executeCommand: gameExecuteCommand,
      // undoCommand: gameUndoCommand,
      // undoLastCommand: gameUndoLastCommand,
      // replayCommand: gameReplayCommand,
      // replayCommandsBatch: gameReplayCommandsBatch,
      // replayNextCommand: gameReplayNextCommand,
      // sendChat: gameSendChat,
      actionError: gameActionError
    };

    const GAME_PROTO = {
      toJSON: function gameToJson() {
        return gamePickForJson(this);
      }
    };
    const gameReplayAllP$ = R.curry(gameReplayAllP);

    R.curryService(gameModel);
    return gameModel;

    function gameCreate(player1) {
      var new_game = {
        players: {
          p1: { name: R.propOr('player1', 'name', player1) },
          p2: { name: null }
        }
      };
      return new_game;
    }
    function gameLoadP(state, data) {
      return R.threadP(Object.create(GAME_PROTO))(
        extendGameDefaultWithData,
        // gameConnectionService.create,
        gameReplayAllP$(state)
      );

      function extendGameDefaultWithData(game) {
        return R.deepExtend(game, defaultGameState(), data);
      }
    }
    function defaultGameState() {
      return {
        players: {
          p1: { name: null },
          p2: { name: null }
        },
        board: {},
        scenario: {},
        chat: [],
        commands: [],
        commands_log: [],
        undo: [],
        undo_log: [],
        dice: [],
        // ruler: gameRulerService.create(),
        // los: gameLosService.create(),
        // models: gameModelsService.create(),
        // model_selection: gameModelSelectionService.create(),
        // templates: gameTemplatesService.create(),
        // template_selection: gameTemplateSelectionService.create(),
        // terrains: gameTerrainsService.create(),
        // terrain_selection: gameTerrainSelectionService.create(),
        // layers: gameLayersService.create()
      };
    }
    function gamePickForJson(game) {
      return R.pick([
        'players', 'commands', 'undo', 'chat',
        'local_stamp', 'private_stamp', 'public_stamp'
      ], game);
    }
    function gameToJson(game) {
      return R.thread(game)(
        gamePickForJson,
        jsonStringifierService.stringify
      );
    }
    function gamePlayerName(p, game) {
      return R.pathOr('John Doe', ['players',p,'name'], game);
    }
    function gameDescription(game) {
      return [ s.capitalize(gamePlayerName('p1', game)),
               'vs',
               s.capitalize(gamePlayerName('p2', game))
             ].join(' ');
    }
    // function gameExecuteCommand(cmd, args, state, game) {
    //   return R.pipeP(
    //     () => {
    //       return commandsService.execute
    //         .apply(null, [cmd, args, state, game]);
    //     },
    //     ([command, game]) => {
    //       return [ R.pipe(
    //         R.assoc('user', R.pathOr('Unknown', ['user','state','name'], state)),
    //         R.assoc('stamp', R.guid())
    //       )(command),
    //                game
    //              ];
    //     },
    //     ([command, game]) => {
    //       if(gameConnectionService.active(game)) {
    //         return gameConnectionService
    //           .sendReplayCommand(command, game);
    //       }
    //       if(!command.do_not_log) {
    //         game = R.over(R.lensProp('commands'),
    //                       R.append(command),
    //                       game);
    //       }
    //       if(command.type === 'rollDice' ||
    //          command.type === 'rollDeviation') {
    //         game = R.over(R.lensProp('dice'),
    //                       R.append(command),
    //                       game);
    //       }
    //       return game;
    //     },
    //     (game) => {
    //       state.changeEvent('Game.command.execute');
    //       return game;
    //     }
    //   )();
    // }
    // function gameUndoCommand(command, state, game) {
    //   return R.pipePromise(
    //     R.propOr([], 'undo_log'),
    //     R.find(R.propEq('stamp', command.stamp)),
    //     (log) => {
    //       if(R.exists(log)) {
    //         console.log('Game : undoCmd log', command);
    //         let log = R.propOr([], 'undo_log', game);
    //         return R.assoc('undo_log',
    //                        R.reject(R.propEq('stamp', command.stamp), log),
    //                        game);
    //       }
    //       return commandsService
    //         .undo(command, state, game);
    //     },
    //     (game) => {
    //       let commands = R.propOr([], 'commands', game);
    //       let undo = R.propOr([], 'undo', game);
    //       return R.pipe(
    //         R.assoc('commands', R.reject(R.propEq('stamp', command.stamp), commands)),
    //         R.assoc('undo', R.append(command, undo))
    //       )(game);
    //     },
    //     (game) => {
    //       state.changeEvent('Game.command.undo');
    //       return game;
    //     }
    //   )(game);
    // }
    // function gameUndoLastCommand(state, game) {
    //   return R.pipePromise(
    //     R.propOr([],'commands'),
    //     R.last,
    //     R.rejectIf(R.isNil, 'Command history empty'),
    //     (command) => {
    //       return R.pipeP(
    //         commandsService.undo$(command, state),
    //         (game) => { return [command, game]; }
    //       )(game);
    //     },
    //     ([command, game]) => {
    //       return R.pipePromise(
    //         R.assoc('commands', R.init(game.commands)),
    //         (game) => {
    //           if(gameConnectionService.active(game)) {
    //             return gameConnectionService
    //               .sendUndoCommand(command, game);
    //           }
    //           return R.over(R.lensProp('undo'),
    //                         R.append(command),
    //                         game);
    //         }
    //       )(game);
    //     },
    //     (game) => {
    //       state.changeEvent('Game.command.undo');
    //       return game;
    //     }
    //   )(game);
    // }
    // function gameReplayCommand(command, state, game) {
    //   return R.pipePromise(
    //     R.propOr([], 'commands_log'),
    //     R.find(R.propEq('stamp', command.stamp)),
    //     (log) => {
    //       if(R.exists(log)) {
    //         console.log('Game: replayCmd log', command);
    //         return R.over(R.lensProp('commands_log'),
    //                       R.reject(R.propEq('stamp', command.stamp)),
    //                       game);
    //       }
    //       return commandsService
    //         .replay(command, state, game);
    //     },
    //     (game) => {
    //       return R.pipe(
    //         R.over(R.lensProp('undo'),
    //                R.reject(R.propEq('stamp', command.stamp))),
    //         (game) => {
    //           if(command.do_not_log) return game;

    //           return R.over(R.lensProp('commands'),
    //                         R.append(command),
    //                         game);
    //         }
    //       )(game);
    //     },
    //     (game) => {
    //       state.changeEvent('Game.command.replay');
    //       return game;
    //     }
    //   )(game);
    // }
    // function gameReplayCommandsBatch(cmds, state, game) {
    //   return R.pipeP(
    //     commandsService.replayBatch$(cmds, state),
    //     R.over(R.lensProp('commands'),
    //            R.flip(R.concat)(cmds))
    //   )(game);
    // }
    // function gameReplayNextCommand(state, game) {
    //   return R.pipePromise(
    //     R.propOr([], 'undo'),
    //     R.last,
    //     (command) => {
    //       if(R.isNil(command)) {
    //         return self.Promise
    //           .reject('Undo history empty');
    //       }
    //       return R.pipeP(
    //         commandsService.replay$(command, state),
    //         (game) => { return [command, game]; }
    //       )(game);
    //     },
    //     ([command, game]) => {
    //       return R.pipePromise(
    //         R.assoc('undo', R.init(game.undo)),
    //         (game) => {
    //           if(gameConnectionService.active(game)) {
    //             return gameConnectionService
    //               .sendReplayCommand(command, game);
    //           }
    //           let commands = R.propOr([], 'commands', game);
    //           return R.assoc('commands', R.append(command, commands), game);
    //         }
    //       )(game);
    //     },
    //     (game) => {
    //       state.changeEvent('Game.command.replay');
    //       return game;
    //     }
    //   )(game);
    // }
    // function gameSendChat(from, msg, game) {
    //   return gameConnectionService
    //     .sendEvent({
    //       type: 'chat',
    //       chat: {
    //         from: from,
    //         msg: msg
    //       }
    //     }, game);
    // }
    function gameReplayBatchsP(batchs, state, game) {
      if(R.isEmpty(batchs)) {
        return self.Promise.resolve(game);
      }

      console.log('Game: ReplayBatchs:', batchs);
      return R.threadP(game)(
        commandsService.replayBatchP$(batchs[0], state),
        recurP
      );

      function recurP(game) {
        return new self.Promise((resolve) => {
          self.requestAnimationFrame(() => {
            resolve(gameReplayBatchsP(R.tail(batchs), state, game));
          });
        });
      }
    }
    function gameReplayAllP(state, game) {
      return new self.Promise((resolve) => {
        if(R.isEmpty(game.commands)) {
          resolve(game);
        }

        var batchs = R.splitEvery(game.commands.length, game.commands);
        self.requestAnimationFrame(() => {
          resolve(gameReplayBatchsP(batchs, state, game));
        });
      });
    }
    function gameActionError(state, error) {
      state.queueChangeEventP('Game.action.error', error);
      return null;
    }
  }
})();
