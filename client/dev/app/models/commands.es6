angular.module('clickApp.services')
  .factory('commands', [
    function commandsServiceFactory() {
      let CMD_REGS = {};
      let commandsService = {
        registerCommand: function commandsRegister(name, command) {
          console.log('register command', name, command);
          CMD_REGS[name] = command;
        },
        execute: function commandsExecute(name, args, state, game) {
          return R.pipePromise(
            R.prop(name),
            R.rejectIf(R.isNil, `execute unknown command "${name}"`),
            (cmd) => {
              return cmd.execute.apply(null, [...args, state, game]);
            },
            ([ctxt, game]) => {
              return [ R.assoc('type', name, ctxt),
                       game
                     ];
            }
          )(CMD_REGS);
        },
        undo: function commandsUndo(ctxt, state, game) {
          return R.pipePromise(
            R.prop(ctxt.type),
            R.rejectIf(R.isNil, `undo unknown command "${ctxt.type}"`),
            (cmd) => {
              return cmd.undo(ctxt, state, game);
            }
          )(CMD_REGS);
        },
        replay: function commandsReplay(ctxt, state, game) {
          return R.pipePromise(
            R.prop(ctxt.type),
            R.rejectIf(R.isNil, `replay unknown command ${ctxt.type}`),
            (cmd) => {
              return cmd.replay(ctxt, state, game);
            }
          )(CMD_REGS);
        },
        replayBatch: function commandsReplayBatch(commands, state, game) {
          return R.pipePromise(
            () => {
              if(R.isEmpty(commands)) return game;

              return R.pipeP(
                (game) => {
                  return commandsService.replay(commands[0], state, game)
                    .catch(R.always(game));
                },
                commandsService.replayBatch$(R.tail(commands), state)
              )(game);
            }
          )();
        }
      };
      R.curryService(commandsService);
      return commandsService;
    }
  ])
  .factory('allCommands', [
    'createModelCommand',
    'deleteModelCommand',
    'setModelSelectionCommand',
    'lockModelsCommand',
    'onModelsCommand',
    'createTemplateCommand',
    'deleteTemplatesCommand',
    'lockTemplatesCommand',
    'onTemplatesCommand',
    'createTerrainCommand',
    'deleteTerrainCommand',
    'lockTerrainsCommand',
    'onTerrainsCommand',
    'rollDiceCommand',
    'rollDeviationCommand',
    'setBoardCommand',
    'setLayersCommand',
    'setLosCommand',
    'setRulerCommand',
    'setScenarioCommand',
    () => ({ })
  ]);
