angular.module('clickApp.services')
  .factory('game', [
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
    function gameServiceFactory(jsonStringifierService,
                                commandsService,
                                gameConnectionService,
                                gameLayersService,
                                gameLosService,
                                gameModelsService,
                                gameModelSelectionService,
                                gameRulerService,
                                gameTemplatesService,
                                gameTemplateSelectionService,
                                gameTerrainsService,
                                gameTerrainSelectionService) {
      var gameService = {
        create: function gameCreate(player1) {
          var new_game = {
            players: {
              p1: { name: R.defaultTo('player1', player1.name) },
              p2: { name: null }
            },
          };
          return new_game;
        },
        load: function gameLoad(scope, data) {
          var game = Object.create({
            toJSON: function() { return gameService.pickForJson(this); }
          });
          game = R.deepExtend(game, {
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
            ruler: gameRulerService.create(),
            los: gameLosService.create(),
            models: gameModelsService.create(),
            model_selection: gameModelSelectionService.create(),
            templates: gameTemplatesService.create(),
            template_selection: gameTemplateSelectionService.create(),
            terrains: gameTerrainsService.create(),
            terrain_selection: gameTerrainSelectionService.create(),
            layers: gameLayersService.create()
          }, data);
          game = gameConnectionService.create(game);
          return gameReplayAll(scope, game)
            .then(R.always(game));
        },
        pickForJson: function gamePickForJson(game) {
          return R.pick([
            'players', 'commands', 'undo', 'chat'
          ], game);
        },
        toJson: function gameToJson(game) {
          var json_game = gameService.pickForJson(game);
          return jsonStringifierService.stringify(json_game);
        },
        playerName: function gamePlayerName(p, game) {
          return R.defaultTo('John Doe', R.path(['players',p,'name'], game));
        },
        description: function gameDescription(game) {
          if(R.exists(game.description)) return game.description;
          return ( s.capitalize(gameService.playerName('p1', game)) +
                   ' vs '+
                   s.capitalize(gameService.playerName('p2', game))
                 );
        },
        executeCommand: function gameExecuteCommand(...args /*, scope, game */) {
          var game = R.last(args);
          var scope = R.nth(-2, args);
          return R.pipeP(
            () => {
              return commandsService.execute.apply(null, args);
            },
            (command) => {
              command.user = R.pathOr('Unknown', ['user','state','name'], scope);
              command.stamp = R.guid();

              return command;
            },
            (command) => {
              return R.pipeP(
                () => {
                  if(gameConnectionService.active(game)) {
                    game.commands_log = R.append(command, game.commands_log);
                    return gameConnectionService.sendEvent({
                      type: 'replayCmd',
                      cmd: command,
                    }, game);
                  }
                  
                  if(!command.do_not_log) {
                    game.commands = R.append(command, game.commands);
                  }
                  scope.gameEvent('command', 'execute');
                  return scope.saveGame(game);
                },
                () => {
                  return R.clone(command);
                }
              )();
            }
          )();
        },
        undoLastCommand: function gameUndoLastCommand(scope, game) {
          if(R.isEmpty(game.commands)) {
            return self.Promise.reject('Command history empty');
          }
          
          var command = R.last(game.commands);
          return R.pipeP(
            () => {
              return commandsService.undo(command, scope, game);
            },
            () => {
              game.commands = R.init(game.commands);

              if(gameConnectionService.active(game)) {
                game.undo_log = R.append(command, game.undo_log);
                return gameConnectionService.sendEvent({
                  type: 'undoCmd',
                  cmd: command,
                }, game);
              }
          
              game.undo = R.append(command, game.undo);
              scope.gameEvent('command', 'undo');
              return null;
            },
            () => {
              return scope.saveGame(game);
            }
          )();
        },
        replayNextCommand: function gameReplayNextCommand(scope, game) {
          if(R.isEmpty(game.undo)) {
            return self.Promise.reject('Undo history empty');
          }
          
          var command = R.last(game.undo);
          return R.pipeP(
            () => {
              return commandsService.replay(command, scope, game);
            },
            () => {
              game.undo = R.init(game.undo);

              if(gameConnectionService.active(game)) {
                game.commands_log = R.append(command, game.commands_log);
                return gameConnectionService.sendEvent({
                  type: 'replayCmd',
                  cmd: command,
                }, game);
              }
          
              game.commands = R.append(command, game.commands);
              scope.gameEvent('command', 'replay');
              return null;
            },
            () => {
              return scope.saveGame(game);
            }
          )();
        },
        sendChat: function gameSendChat(from, msg, game) {
          return gameConnectionService
            .sendEvent({
              type: 'chat',
              chat: {
                from: from,
                msg: msg
              }
            }, game);
        },
      };
      function gameReplayBatchs(batchs, scope, game) {
        if(R.isEmpty(batchs)) return null;
        
        console.log('Game: ReplayBatchs:', batchs);
        return commandsService.replayBatch(batchs[0], scope, game)
          .then(() => {
            return new self.Promise((resolve/*, reject*/) => {
              self.requestAnimationFrame(function _gameReplayBatch() {
                resolve(gameReplayBatchs(R.tail(batchs), scope, game));
              });
            });
          });
      }
      function gameReplayAll(scope, game) {
        return new self.Promise((resolve/*, reject*/) => {
          if(R.isEmpty(game.commands)) {
            resolve();
          }

          var batchs = R.splitEvery(game.commands.length, game.commands);
          self.requestAnimationFrame(function _gameReplayAll() {
            scope.gameEvent('gameLoading');
            resolve(gameReplayBatchs(batchs, scope, game));
          });
        }).then(() => {
          console.error('Game: ReplayAll: end');
          scope.gameEvent('gameLoaded');
          return scope.saveGame(game);
        });
      }
      R.curryService(gameService);
      return gameService;
    }
  ]);
