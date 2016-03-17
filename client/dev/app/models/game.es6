(function() {
  angular.module('clickApp.services')
    .factory('game', gameModelFactory);

  gameModelFactory.$inject = [
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
  ];
  function gameModelFactory(jsonStringifierService,
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
      sendChatP: gameSendChatP,
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
        gameConnectionModel.create,
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
    function gameExecuteCommandP(cmd, args, state, game) {
      return R.threadP(commandsModel.executeP(cmd, args, state, game))(
        stampCommand,
        R.ifElse(
          ([_c_, game]) => gameConnectionModel.active(game),
          sendReplayCommandP,
          logLocalCommand
        ),
        ([ command, game ]) => R.when(
          () => (command.type === 'rollDice' ||
                 command.type === 'rollDeviation'),
          R.over(R.lensProp('dice'), R.append(command)),
          game
        ),
        R.tap(() => { state.queueChangeEventP('Game.command.execute'); })
      );

      function stampCommand([command, game]) {
        return [ R.thread(command)(
          R.assoc('user', R.pathOr('Unknown', ['user','state','name'], state)),
          R.assoc('stamp', R.guid())
        ), game ];
      }
      function sendReplayCommandP([command, game]) {
        return R.threadP(game)(
          gameConnectionModel.sendReplayCommandP$(command),
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
    function gameUndoCommandP(command, state, game) {
      return R.threadP(game)(
        R.ifElse(
          isInUndoLog,
          removeFromUndoLog,
          commandsModel.undoP$(command, state)
        ),
        updateLogs,
        R.tap(() => { state.queueChangeEventP('Game.command.undo'); })
      );

      function isInUndoLog(game) {
        return R.thread(game)(
          R.propOr([], 'undo_log'),
          R.find(R.propEq('stamp', command.stamp))
        );
      }
      function removeFromUndoLog(game) {
        return R.over(R.lensProp('undo_log'),
                      R.compose(R.reject(R.propEq('stamp', command.stamp)),
                                R.defaultTo([])),
                      game);
      }
      function updateLogs(game) {
        return R.thread(game)(
          R.over(R.lensProp('commands'), R.reject(R.propEq('stamp', command.stamp))),
          R.over(R.lensProp('undo'), R.append(command))
        );
      }
    }
    function gameUndoLastCommandP(state, game) {
      return R.threadP(game)(
        getLastCommand,
        undoCommand,
        updateLogs,
        R.tap(() => { state.queueChangeEventP('Game.command.undo'); })
      );

      function getLastCommand(game) {
        return R.threadP(game)(
          R.propOr([],'commands'),
          R.last,
          R.rejectIf(R.isNil, 'Command history empty')
        );
      }
      function undoCommand(command) {
        return R.threadP(game)(
          commandsModel.undoP$(command, state),
          (game) => [command, game]
        );
      }
      function updateLogs([command, game]) {
        return R.threadP(game)(
          R.over(R.lensProp('commands'), R.init),
          R.ifElse(
            gameConnectionModel.active,
            gameConnectionModel.sendUndoCommandP$(command),
            R.over(R.lensProp('undo'), R.append(command))
          )
        );
      }
    }
    function gameReplayCommandP(command, state, game) {
      return R.threadP(game)(
        R.ifElse(
          isInCommandsLog,
          removeFromCommandsLog,
          commandsModel.replayP$(command, state)
        ),
        updateLogs,
        R.tap(() => { state.queueChangeEventP('Game.command.replay'); })
      );

      function isInCommandsLog(game) {
        return R.thread(game)(
          R.propOr([], 'commands_log'),
          R.find(R.propEq('stamp', command.stamp))
        );
      }
      function removeFromCommandsLog(game) {
        return R.over(R.lensProp('commands_log'),
                      R.reject(R.propEq('stamp', command.stamp)),
                      game);
      }
      function updateLogs(game) {
        return R.thread(game)(
          R.over(R.lensProp('undo'), R.reject(R.propEq('stamp', command.stamp))),
          R.unless(
            () => command.do_not_log,
            R.over(R.lensProp('commands'), R.append(command))
          )
        );
      }
    }
    function gameReplayCommandsBatchP(cmds, state, game) {
      return R.threadP(game)(
        commandsModel.replayBatchP$(cmds, state),
        R.over(R.lensProp('commands'), R.flip(R.concat)(cmds))
      );
    }
    function gameReplayNextCommandP(state, game) {
      return R.threadP(game)(
        getNextUndo,
        replayCommand,
        updateLogs,
        R.tap(() => { state.queueChangeEventP('Game.command.replay'); })
      );

      function getNextUndo(game) {
        return R.threadP(game)(
          R.propOr([], 'undo'),
          R.last,
          R.rejectIf(R.isNil, 'Undo history empty')
        );
      }
      function replayCommand(command) {
        return R.threadP(game)(
          commandsModel.replayP$(command, state),
          (game) => [command, game]
        );
      }
      function updateLogs([command, game]) {
        return R.threadP(game)(
          R.over(R.lensProp('undo'), R.init),
          R.ifElse(
            gameConnectionModel.active,
            gameConnectionModel.sendReplayCommandP$(command),
            R.over(R.lensProp('commands'), R.append(command))
          )
        );
      }
    }
    function gameSendChatP(from, msg, game) {
      return gameConnectionModel
        .sendEventP({
          type: 'chat',
          chat: {
            from: from,
            msg: msg
          }
        }, game);
    }
    function gameReplayBatchsP(batchs, state, game) {
      if(R.isEmpty(batchs)) {
        return self.Promise.resolve(game);
      }

      console.log('Game: ReplayBatchs:', batchs);
      return R.threadP(game)(
        commandsModel.replayBatchP$(batchs[0], state),
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
