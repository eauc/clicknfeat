(function() {
  angular.module('clickApp.services')
    .factory('game', gameModelFactory);

  gameModelFactory.$inject = [
    'appState',
    'jsonStringifier',
    'commands',
    'gameConnection',
    'gameLayers',
    'gameLos',
    'gameModels',
    'gameModelSelection',
    'gameRuler',
    'gameTemplates',
    'gameTemplateSelection',
    'gameTerrains',
    'gameTerrainSelection',
    'allTemplates',
  ];
  function gameModelFactory(appStateService,
                            jsonStringifierService,
                            commandsModel,
                            gameConnectionModel,
                            gameLayersModel,
                            gameLosModel,
                            gameModelsModel,
                            gameModelSelectionModel,
                            gameRulerModel,
                            gameTemplatesModel,
                            gameTemplateSelectionModel,
                            gameTerrainsModel,
                            gameTerrainSelectionModel) {
    const gameModel = {
      create: gameCreate,
      isOnline: gameIsOnline,
      loadP: gameLoadP,
      pickForJson: gamePickForJson,
      toJson: gameToJson,
      description: gameDescription,
      executeCommandP: gameExecuteCommandP,
      undoCommandP: gameUndoCommandP,
      undoLastCommandP: gameUndoLastCommandP,
      replayCommandP: gameReplayCommandP,
      replayCommandsBatchP: gameReplayCommandsBatchP,
      replayNextCommandP: gameReplayNextCommandP,
      sendChat: gameSendChat
    };

    const GAME_PROTO = {
      toJSON: function gameToJson() {
        return gamePickForJson(this);
      }
    };

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
    function gameIsOnline(game) {
      return ( game.public_stamp || game.private_stamp );
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
        ruler: gameRulerModel.create(),
        los: gameLosModel.create(),
        models: gameModelsModel.create(),
        model_selection: gameModelSelectionModel.create(),
        templates: gameTemplatesModel.create(),
        template_selection: gameTemplateSelectionModel.create(),
        terrains: gameTerrainsModel.create(),
        terrain_selection: gameTerrainSelectionModel.create(),
        layers: gameLayersModel.create()
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
    function gameExecuteCommandP(cmd, args, game) {
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
          R.over(R.lensProp('dice'), R.append(command)),
          game
        ),
        R.tap(() => {
          appStateService.emit('Game.command.execute');
        })
      );

      function stampCommand([command, game]) {
        const state = appStateService.current();
        return [ R.thread(command)(
          R.assoc('user', R.pathOr('Unknown', ['user','state','name'], state)),
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
          R.over(R.lensProp('commands'), R.append(command)),
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
          R.propOr([], 'undo_log'),
          R.find(R.propEq('stamp', command.stamp))
        );
      }
      function removeFromUndoLog(game) {
        return R.over(
          R.lensProp('undo_log'),
          R.compose(R.reject(R.propEq('stamp', command.stamp)),
                    R.defaultTo([])),
          game
        );
      }
      function updateLogs(game) {
        return R.thread(game)(
          R.over(R.lensProp('commands'), R.reject(R.propEq('stamp', command.stamp))),
          R.over(R.lensProp('undo'), R.append(command))
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
          R.propOr([],'commands'),
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
          R.over(R.lensProp('commands'), R.init),
          R.ifElse(
            gameConnectionModel.active,
            gameConnectionModel.sendUndoCommand$(command),
            R.over(R.lensProp('undo'), R.append(command))
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
          R.propOr([], 'commands_log'),
          R.find(R.propEq('stamp', command.stamp))
        );
      }
      function removeFromCommandsLog(game) {
        return R.over(
          R.lensProp('commands_log'),
          R.reject(R.propEq('stamp', command.stamp)),
          game
        );
      }
      function updateLogs(game) {
        return R.thread(game)(
          R.over(
            R.lensProp('undo'),
            R.reject(R.propEq('stamp', command.stamp))
          ),
          R.unless(
            () => command.do_not_log,
            R.over(R.lensProp('commands'), R.append(command))
          )
        );
      }
    }
    function gameReplayCommandsBatchP(cmds, game) {
      return R.threadP(game)(
        commandsModel.replayBatchP$(cmds),
        R.over(
          R.lensProp('commands'),
          R.flip(R.concat)(cmds)
        )
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
          R.propOr([], 'undo'),
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
          R.over(R.lensProp('undo'), R.init),
          R.ifElse(
            gameConnectionModel.active,
            gameConnectionModel.sendReplayCommand$(command),
            R.over(R.lensProp('commands'), R.append(command))
          )
        );
      }
    }
    function gameSendChat(from, msg, game) {
      return gameConnectionModel
        .sendEvent({
          type: 'chat',
          chat: {
            from: from,
            msg: msg
          }
        }, game);
    }
    function gameReplayAllP(game) {
      return new self.Promise((resolve) => {
        if(R.isEmpty(game.commands)) {
          resolve(game);
        }

        const batchs = R.splitEvery(game.commands.length, game.commands);
        self.requestAnimationFrame(() => {
          resolve(gameReplayBatchsP(batchs, game));
        });
      });
    }
    function gameReplayBatchsP(batchs, game) {
      if(R.isEmpty(batchs)) {
        return self.Promise.resolve(game);
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
