'use strict';

angular.module('clickApp.services')
  .factory('game', [
    'jsonStringifier',
    'commands',
    'gameRuler',
    'gameTemplates',
    'gameTemplateSelection',
    'gameModels',
    'gameModelSelection',
    'gameLayers',
    function gameServiceFactory(jsonStringifierService,
                                commandsService,
                                gameRulerService,
                                gameTemplatesService,
                                gameTemplateSelectionService,
                                gameModelsService,
                                gameModelSelectionService,
                                gameLayersService) {
      var gameService = {
        create: function gameCreate(player1) {
          var new_game = {
            players: {
              p1: { name: R.defaultTo('player1', player1.name) },
              p2: { name: null }
            }
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
            commands: [],
            undo: [],
            dice: [],
            ruler: gameRulerService.create(),
            models: gameModelsService.create(),
            model_selection: gameModelSelectionService.create(),
            templates: gameTemplatesService.create(),
            template_selection: gameTemplateSelectionService.create(),
            layers: gameLayersService.create(),
          }, data);
          return gameReplayAll(scope, game)
            .then(R.always(game));
        },
        pickForJson: function gamePickForJson(game) {
          return R.pick([
            'players', 'commands', 'undo'
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
          return ( gameService.playerName('p1', game) +
                   ' vs '+
                   gameService.playerName('p2', game)
                 );
        },
        executeCommand: function gameExecuteCommand(/* ...args..., scope, game */) {
          var args = Array.prototype.slice.apply(arguments);
          return commandsService.execute.apply(null, args)
            .then(function(command) {
              var game = R.last(args);
              var scope = R.nth(-2, args);
              command.user = scope.user.name;
              command.stamp = R.guid();
              if(!command.do_not_log) {
                game.commands = R.append(command, game.commands);
              }
              return scope.saveGame(game)
                .then(function() {
                  scope.gameEvent('command', 'execute');
                  return R.clone(command);
                });
            });
        },
        undoLastCommand: function gameUndoLastCommand(scope, game) {
          if(R.isEmpty(game.commands)) {
            return self.Promise.reject('Command history empty');
          }
          
          var command = R.last(game.commands);
          return commandsService.undo(command, scope, game)
            .then(function() {
              game.commands = R.init(game.commands);
              game.undo = R.append(command, game.undo);
              return scope.saveGame(game)
                .then(function() {
                  scope.gameEvent('command', 'undo');
                });
            });
        },
        replayNextCommand: function gameReplayNextCommand(scope, game) {
          if(R.isEmpty(game.undo)) {
            return self.Promise.reject('Undo history empty');
          }
          
          var command = R.last(game.undo);
          return commandsService.replay(command, scope, game)
            .then(function() {
              game.undo = R.init(game.undo);
              game.commands = R.append(command, game.commands);
              return scope.saveGame(game)
                .then(function() {
                  scope.gameEvent('command', 'replay');
                });
            });
        },
      };
      var batch_length = 5;
      function gameReplayOne(i, j, scope, game) {
        return commandsService.replay(game.commands[i], scope, game)
          .catch(R.always(null))
          .then(function() {
            i++;
            if(i >= R.length(game.commands)) {
              return i;
            }
            j++;
            if(j >= batch_length) {
              return self.Promise.reject(i);
            }
            
            return gameReplayOne(i, j, scope, game);
          });
      }
      function gameReplayBatch(i, scope, game) {
        return gameReplayOne(i, 0, scope, game)
          .then(function(i) {
            console.log('Game: ReplayAll: end', i);
            scope.$digest(scope);
            scope.gameEvent('gameLoaded');
            return;
          })
          .catch(function(i) {
            console.log('Game: ReplayAll: batch_end', i);
            return new self.Promise(function(resolve, reject) {
              self.requestAnimationFrame(function() {
                resolve(gameReplayBatch(i, scope, game));
              });
            });
          });
      }
      function gameReplayAll(scope, game) {
        return new self.Promise(function(resolve, reject) {
          if(R.isEmpty(game.commands)) {
            resolve();
          }
          
          self.requestAnimationFrame(function _gameReplayAll() {
            scope.gameEvent('gameLoading');
            resolve(gameReplayBatch(0, scope, game));
          });
        });
      }
      R.curryService(gameService);
      return gameService;
    }
  ]);
