'use strict';

angular.module('clickApp.controllers')
  .controller('gameCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$window',
    'userConnection',
    'game',
    'gameConnection',
    'games',
    'modes',
    'pubSub',
    'allModes',
    'allCommands',
    'allTemplates',
    function($scope,
             $state,
             $stateParams,
             $window,
             userConnectionService,
             gameService,
             gameConnectionService,
             gamesService,
             modesService,
             pubSubService) {
      console.log('init gameCtrl', $stateParams, $state.current.name);
      var is_online = ($stateParams.online === 'online');
      $scope.is_private = ($stateParams['private'] === 'private');
      $scope.ui_state = {};

      $scope.invite = { player: null };
      $scope.doInvitePlayer = function() {
        var to = [$scope.invite.player];
        var msg = [
          s.capitalize(R.pathOr('Unknown', ['user','state','name'], $scope)),
          'has invited you to join a game'
        ].join(' ');
        var link = $window.location.hash;
        console.log(to, msg, link);
        
        return userConnectionService
          .sendChat(to, msg, link, $scope.user)
          .then(function() {
            $scope.$digest();
          });
      };
      
      var game_event_channel = pubSubService.init();
      pubSubService.subscribe('#watch#', function() {
        console.log('gameEvent', arguments);
      }, game_event_channel);
      var game_is_loading = false;
      var event_loading_queue = [];
      $scope.gameEvent = function gameEvent(event) {
        if(event === 'gameLoading') game_is_loading = true;

        var args = Array.prototype.slice.apply(arguments);
        if(event === 'gameLoaded') {
          R.pipe(
            R.reverse,
            R.uniqBy(R.head),
            R.reverse,
            R.forEach(function(args) {
              pubSubService.publish.apply(null, R.append(game_event_channel, args));
            })
          )(event_loading_queue);
          event_loading_queue = [];
          game_is_loading = false;
        }
        if(game_is_loading) {
          event_loading_queue = R.append(args, event_loading_queue);
          return;
        }
        pubSubService.publish.apply(null, R.append(game_event_channel, args));
      };
      $scope.onGameEvent = function onGameEvent(event, listener, scope) {
        // console.log('subscribe onGameEvent', arguments);
        var unsubscribe = pubSubService.subscribe(event, listener, game_event_channel);
        scope.$on('$destroy', function unsubscribeOnGameEvent() {
          // console.log('unsubscribe onGameEvent', event, game_event_channel);
          unsubscribe();
        });
      };
      $scope.digestOnGameEvent = function digestOnGameEvent(event, scope) {
        // console.log('subscribe digestOnGameEvent', arguments);
        var unsubscribe = pubSubService.subscribe(event, function _digestOnGameEvent() {
          console.log('digestOnGameEvent', event);
          $scope.$digest(scope);
        }, game_event_channel);
        scope.$on('$destroy', function unsubscribeDigestOnGameEvent() {
          // console.log('unsubscribe digestOnGameEvent', event, game_event_channel);
          unsubscribe();
        });
      };
      $scope.digestOnGameEvent('diceRoll', $scope);
      $scope.digestOnGameEvent('changeBoard', $scope);
      $scope.digestOnGameEvent('changeLayers', $scope);
      $scope.digestOnGameEvent('changeScenario', $scope);
      $scope.digestOnGameEvent('createModel', $scope);
      $scope.digestOnGameEvent('createTemplate', $scope);
      $scope.digestOnGameEvent('switchMode', $scope);
      $scope.digestOnGameEvent('gameLoaded', $scope);
      
      $scope.saveGame = function saveGame(game) {
        return R.pipeP(
          function(game) {
            if(is_online) return self.Promise.resolve(game);
            
            return R.pipeP(
              gamesService.updateLocalGame$($scope.game_index, game),
              function(games) {
                $scope.local_games = games;
                return game;
              }
            )($scope.local_games);
          },
          function(game) {
            if(R.isNil(game)) return;

            $scope.game = game;
            $scope.gameEvent('saveGame', game);

            return game;
          }
        )(game);
      };

      $scope.currentModeName = function currentModeName() {
        if(!R.exists($scope.modes)) return '';
        return modesService.currentModeName($scope.modes);
      };
      $scope.currentModeIs = function currentModeIs(mode) {
        if(!R.exists($scope.modes)) return false;
        return modesService.currentModeName($scope.modes) === mode;
      };
      $scope.doSwitchToMode = function doSwitchToMode(mode) {
        return modesService.switchToMode(mode, $scope, $scope.modes)
          .catch(function(reason) {
            $scope.gameEvent('modeActionError', reason);
            return self.Promise.reject(reason);
          });
      };
      $scope.doModeAction = function doModeAction(action) {
        return modesService.currentModeAction(action, $scope, $scope.modes)
          .catch(function(reason) {
            $scope.gameEvent('modeActionError', reason);
            return self.Promise.reject(reason);
          });
      };
      $scope.doExecuteCommand = function doExecuteCommand() {
        var args = Array.prototype.slice.apply(arguments);
        args = R.concat(args, [$scope, $scope.game]);
        return gameService.executeCommand.apply(gameService, args)
          .catch(function(reason) {
            $scope.gameEvent('modeActionError', reason);
            return self.Promise.reject(reason);
          });
      };
      $scope.show_action_group = null;
      $scope.doActionButton = function doActionButton(action) {
        if(action[1] === 'toggle') {
          $scope.show_action_group = ($scope.show_action_group === action[2]) ? null : action[2];
          return;
        }
        $scope.doModeAction(action[1]);
      };

      var forward_events = [
        // 'clickModel',
        // 'rightClickModel',
        'dragStartModel',
        'dragModel',
        'dragEndModel',
        // 'clickTemplate',
        // 'rightClickTemplate',
        'dragStartTemplate',
        'dragTemplate',
        'dragEndTemplate',
        // 'clickMap',
        // 'rightClickMap',
        'moveMap',
        'dragStartMap',
        'dragMap',
        'dragEndMap',
      ];
      R.forEach(function(fwd) {
        $scope.$on(fwd, function onForwardEvent(e, target, event) {
          console.log('$on '+fwd, arguments);
          $scope.gameEvent('closeSelectionDetail');
          modesService.currentModeAction(fwd, $scope, target, event, $scope.modes)
            .catch(function(reason) {
              $scope.gameEvent('modeActionError', reason);
            });
        });
      }, forward_events);
      $scope.$on('$destroy', function onGameCtrlDestroy() {
        console.log('on gameCtrl $destroy');
        Mousetrap.reset();
      });

      $scope.onGameLoad = R.pipeP(
        R.always($scope.user_ready),
        // function() {
        //   return new self.Promise(function(resolve, reject) {
        //     self.setTimeout(resolve, 1000);
        //   });
        // },
        function() {
          if(is_online) {
            return gamesService
              .loadOnlineGame$($scope.is_private, $stateParams.id)
              .catch(R.pipe(
                R.spyError('Load online game: error'),
                R.always(null)
              ));
          }
          else {
            return R.pipeP(
              gamesService.loadLocalGames,
              function(local_games) {
                $scope.local_games = local_games;
                $scope.game_index = $stateParams.id >> 0;
                var game = R.nth($scope.game_index,
                                 $scope.local_games);
                console.log('load local game', game);
                return game;
              }
            )();
          }
        },
        function(game) {
          if(R.isNil(game)) {
            $scope.goToState('lounge');
            return self.Promise.reject('load game: unknown');
          }
          
          $scope.game = game;
          return modesService.init($scope);
        },
        function(modes) {
          $scope.modes = modes;
          
          if($state.current.name === 'game') {
            $scope.goToState('.main');
          }
          $scope.create = {};
          
          return $scope.data_ready;
        },
        function() {
          return gameService.load($scope, $scope.game);
        },
        function(game) {
          if(!is_online) return game;

          return gameConnectionService
            .open$(R.pathOr('', ['user','state','name'], $scope),
                   $scope, game);
        },
        function(game) {
          $scope.$on('$destroy', function gameCtrlOnDestroy() {
            gameConnectionService.close(game);
          });
          console.error('#### Game Loaded', $scope.game);
          $scope.$digest();
        }
      )();
    }
  ]);
