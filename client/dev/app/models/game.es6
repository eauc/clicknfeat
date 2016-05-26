(function() {
  angular.module('clickApp.services')
    .factory('game', gameModelFactory);

  gameModelFactory.$inject = [
    'jsonStringifier',
    'commands',
    'gameConnection',
    'gameLayers',
    // 'gameLos',
    // 'gameModels',
    // 'gameModelSelection',
    // 'gameRuler',
    'gameTemplates',
    'gameTemplateSelection',
    // 'gameTerrains',
    // 'gameTerrainSelection',
  ];
  function gameModelFactory(jsonStringifierService,
                            commandsModel,
                            gameConnectionModel,
                            gameLayersModel,
                            // gameLosModel,
                            // gameModelsModel,
                            // gameModelSelectionModel,
                            // gameRulerModel,
                            gameTemplatesModel,
                            gameTemplateSelectionModel
                            // gameTerrainsModel,
                            // gameTerrainSelectionModel
                           ) {
    const DICE_LENS = R.lensProp('dice');
    const COMMANDS_LENS = R.lensProp('commands');
    const COMMANDS_LOG_LENS = R.lensProp('commands_log');
    const UNDO_LENS = R.lensProp('undo');
    const UNDO_LOG_LENS = R.lensProp('undo_log');
    const gameModel = {
      isOnline: gameIsOnline,
      description: gameDescription,
      pickForJson: gamePickForJson,
      toJson: gameToJson,
      create: gameCreate,
      loadP: gameLoadP,
      executeCommandP: gameExecuteCommandP,
      undoCommandP: gameUndoCommandP,
      undoLastCommandP: gameUndoLastCommandP,
      replayCommandP: gameReplayCommandP,
      replayCommandsBatchP: gameReplayCommandsBatchP,
      replayNextCommandP: gameReplayNextCommandP,
      // sendChat: gameSendChat
    };

    const GAME_PROTO = {
      toJSON: function gameToJson() {
        return gamePickForJson(this);
      }
    };

    R.curryService(gameModel);
    return gameModel;

    function gameIsOnline(game) {
      return ( game.public_stamp || game.private_stamp );
    }
    function gameDescription(game) {
      return [ s.capitalize(gamePlayerName('p1', game)),
               'vs',
               s.capitalize(gamePlayerName('p2', game))
             ].join(' ');
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
    function gameCreate(player1) {
      var new_game = {
        players: {
          p1: { name: R.propOr('player1', 'name', player1) },
          p2: { name: null }
        }
      };
      return new_game;
    }
    function gameLoadP(data) {
      return R.threadP(Object.create(GAME_PROTO))(
        extendGameDefaultWithData,
        gameConnectionModel.create,
        gameReplayAllP
      );

      function extendGameDefaultWithData(game) {
        return R.deepExtend(game, defaultGameState(), data);
      }
    }
    function gameExecuteCommandP(cmd, args, user_name, game) {
      return R.threadP(commandsModel.executeP(cmd, args, game))(
        stampCommand,
        R.ifElse(
          ([_c_, game]) => gameConnectionModel.active(game),
          sendReplayCommand,
          logLocalCommand
        ),
        ([ command, game ]) => R.when(
          () => (command.type === 'rollDice' ||
                 command.type === 'rollDeviation'),
          R.over(DICE_LENS, R.append(command)),
          game
        )
      );

      function stampCommand([command, game]) {
        return [ R.thread(command)(
          R.assoc('user', user_name),
          R.assoc('stamp', R.guid())
        ), game ];
      }
      function sendReplayCommand([command, game]) {
        return R.thread(game)(
          gameConnectionModel.sendReplayCommand$(command),
          (game) => [ command, game ]
        );
      }
      function logLocalCommand([command, game]) {
        return [ command, R.unless(
          () => command.do_not_log,
          R.over(COMMANDS_LENS, R.append(command)),
          game
        ) ];
      }
    }
    function gameUndoCommandP(command, game) {
      return R.threadP(game)(
        R.ifElse(
          isInUndoLog,
          removeFromUndoLog,
          commandsModel.undoP$(command)
        ),
        updateLogs
      );

      function isInUndoLog(game) {
        return R.thread(game)(
          R.viewOr([], UNDO_LOG_LENS),
          R.find(R.propEq('stamp', command.stamp))
        );
      }
      function removeFromUndoLog(game) {
        return R.over(
          UNDO_LOG_LENS,
          R.compose(R.reject(R.propEq('stamp', command.stamp)),
                    R.defaultTo([])),
          game
        );
      }
      function updateLogs(game) {
        return R.thread(game)(
          R.over(COMMANDS_LENS, R.reject(R.propEq('stamp', command.stamp))),
          R.over(UNDO_LENS, R.append(command))
        );
      }
    }
    function gameUndoLastCommandP(game) {
      return R.threadP(game)(
        getLastCommandP,
        undoCommandP,
        updateLogs
      );

      function getLastCommandP(game) {
        return R.threadP(game)(
          R.viewOr([], COMMANDS_LENS),
          R.last,
          R.rejectIfP(R.isNil, 'Command history empty')
        );
      }
      function undoCommandP(command) {
        return R.threadP(game)(
          commandsModel.undoP$(command),
          (game) => [command, game]
        );
      }
      function updateLogs([command, game]) {
        return R.thread(game)(
          R.over(COMMANDS_LENS, R.init),
          R.ifElse(
            gameConnectionModel.active,
            gameConnectionModel.sendUndoCommand$(command),
            R.over(UNDO_LENS, R.append(command))
          )
        );
      }
    }
    function gameReplayCommandP(command, game) {
      return R.threadP(game)(
        R.ifElse(
          isInCommandsLog,
          removeFromCommandsLog,
          commandsModel.replayP$(command)
        ),
        updateLogs
      );

      function isInCommandsLog(game) {
        return R.thread(game)(
          R.viewOr([], COMMANDS_LOG_LENS),
          R.find(R.propEq('stamp', command.stamp))
        );
      }
      function removeFromCommandsLog(game) {
        return R.over(
          COMMANDS_LOG_LENS,
          R.reject(R.propEq('stamp', command.stamp)),
          game
        );
      }
      function updateLogs(game) {
        return R.thread(game)(
          R.over(UNDO_LENS, R.reject(R.propEq('stamp', command.stamp))),
          R.unless(
            () => command.do_not_log,
            R.over(COMMANDS_LENS, R.append(command))
          )
        );
      }
    }
    function gameReplayCommandsBatchP(cmds, game) {
      return R.threadP(game)(
        commandsModel.replayBatchP$(cmds),
        R.over(COMMANDS_LENS, R.concat(R.__, cmds))
      );
    }
    function gameReplayNextCommandP(game) {
      return R.threadP(game)(
        getNextUndoP,
        replayCommandP,
        updateLogs
      );

      function getNextUndoP(game) {
        return R.threadP(game)(
          R.viewOr([], UNDO_LENS),
          R.last,
          R.rejectIfP(R.isNil, 'Undo history empty')
        );
      }
      function replayCommandP(command) {
        return R.threadP(game)(
          commandsModel.replayP$(command),
          (game) => [command, game]
        );
      }
      function updateLogs([command, game]) {
        return R.threadP(game)(
          R.over(UNDO_LENS, R.init),
          R.ifElse(
            gameConnectionModel.active,
            gameConnectionModel.sendReplayCommand$(command),
            R.over(COMMANDS_LENS, R.append(command))
          )
        );
      }
    }
    // function gameSendChat(from, msg, game) {
    //   return gameConnectionModel
    //     .sendEvent({
    //       type: 'chat',
    //       chat: {
    //         from: from,
    //         msg: msg
    //       }
    //     }, game);
    // }
    function gamePlayerName(p, game) {
      return R.pathOr('John Doe', ['players',p,'name'], game);
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
        layers: gameLayersModel.create(),
        // ruler: gameRulerModel.create(),
        // los: gameLosModel.create(),
        // models: gameModelsModel.create(),
        // model_selection: gameModelSelectionModel.create(),
        templates: gameTemplatesModel.create(),
        template_selection: gameTemplateSelectionModel.create(),
        // terrains: gameTerrainsModel.create(),
        // terrain_selection: gameTerrainSelectionModel.create(),
      };
    }
    function gameReplayAllP(game) {
      return new self.Promise((resolve) => {
        if(R.isEmpty(game.commands)) {
          resolve(game);
        }

        const batchs = R.splitEvery(Math.max(game.commands.length, 1), game.commands);
        self.requestAnimationFrame(() => {
          resolve(gameReplayBatchsP(batchs, game));
        });
      });
    }
    function gameReplayBatchsP(batchs, game) {
      if(R.isEmpty(batchs)) {
        return R.resolveP(game);
      }

      console.log('Game: ReplayBatchs:', batchs);
      return R.threadP(game)(
        commandsModel.replayBatchP$(batchs[0]),
        recurP
      );

      function recurP(game) {
        return new self.Promise((resolve) => {
          self.requestAnimationFrame(() => {
            resolve(gameReplayBatchsP(R.tail(batchs), game));
          });
        });
      }
    }
  }
})();
