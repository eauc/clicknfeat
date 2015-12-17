angular.module('clickApp.controllers')
  .controller('gameCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$window',
    'userConnection',
    'game',
    'gameConnection',
    'gameLos',
    'gameRuler',
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
             gameLosService,
             gameRulerService,
             gamesService,
             modesService,
             pubSubService) {
      console.log('init gameCtrl', $stateParams, $state.current.name);
      var is_online = ($stateParams.online === 'online');
      $scope.is_private = ($stateParams['private'] === 'private');
      $scope.ui_state = {};

      $scope.hints = {};
      
      $scope.invite = { player: null };
      $scope.doInvitePlayer = () => {
        var to = [$scope.invite.player];
        var msg = [
          s.capitalize(R.pathOr('Unknown', ['user','state','name'], $scope)),
          'has invited you to join a game'
        ].join(' ');
        var link = $window.location.hash;
        console.log(to, msg, link);
        
        return userConnectionService
          .sendChat(to, msg, link, $scope.user)
          .then(() => {
            $scope.$digest();
          });
      };
      
      var game_event_channel = pubSubService.init();
      pubSubService.subscribe('#watch#', R.spy('gameEvent'),
                              game_event_channel);
      var game_is_loading = false;
      var event_loading_queue = [];
      $scope.gameEvent = function gameEvent(...args) {
        var [event] = args;
        if(event === 'gameLoading') game_is_loading = true;

        if(event === 'gameLoaded') {
          R.pipe(
            R.reverse,
            R.uniqBy(R.head),
            R.reverse,
            R.forEach((args) => {
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
        scope.$on('$destroy', () => {
          // console.log('unsubscribe onGameEvent', event, game_event_channel);
          unsubscribe();
        });
      };
      $scope.digestOnGameEvent = function digestOnGameEvent(event, scope) {
        // console.log('subscribe digestOnGameEvent', arguments);
        var unsubscribe = pubSubService.subscribe(event, () => {
          console.log('digestOnGameEvent', event);
          $scope.$digest(scope);
        }, game_event_channel);
        scope.$on('$destroy', () => {
          // console.log('unsubscribe digestOnGameEvent', event, game_event_channel);
          unsubscribe();
        });
      };
      $scope.onGameEvent('chat', () => {
        let msg = R.last($scope.game.chat);
        if(msg.from === $scope.user.state.name) return;
              
        $scope.hints.go_to_main = !$scope.stateIs('game.main');
        $scope.$digest();
      }, $scope);
      function updateGameLosOriginTarget(on) {
        let game_los = {
          stamp: null,
          unsubscribe: null
        };
        function cleanupLosListener(origin) {
          if(game_los.stamp === origin ||
             R.isNil(game_los.unsubscribe)) return;
          
          console.info('unsubscribe Los listener', on);
          game_los.unsubscribe();
          game_los.unsubscribe = null;
          game_los.stamp = null;
        }
        $scope.onGameEvent('changeRemoteLos', (event, los) => {
          let stamp = gameLosService[on](los);
          cleanupLosListener(stamp);
          
          let display = gameLosService.isDisplayed(los);
          if( !display ||
              R.isNil(stamp) ||
              game_los.stamp === stamp ) return;
          
          let event_name = 'changeModel-'+stamp;
          console.info('subscribe Los listener', on, event_name);
          game_los.unsubscribe = pubSubService.subscribe(event_name, () => {
            console.info('update LoS', on);
            gameLosService.updateOriginTarget($scope, $scope.game, los);
          }, game_event_channel);
        }, $scope);
        $scope.$on('$destroy', () => {
          cleanupLosListener();
        });
      }
      updateGameLosOriginTarget('origin');
      updateGameLosOriginTarget('target');
      
      function updateGameRulerOriginTarget(on) {
        let game_ruler = {
          stamp: null,
          unsubscribe: null
        };
        function cleanupRulerListener(origin) {
          if(game_ruler.stamp === origin ||
             R.isNil(game_ruler.unsubscribe)) return;
          
          console.info('unsubscribe Ruler listener', on);
          game_ruler.unsubscribe();
          game_ruler.unsubscribe = null;
          game_ruler.stamp = null;
        }
        $scope.onGameEvent('changeRemoteRuler', (event, ruler) => {
          let stamp = gameRulerService[on](ruler);
          cleanupRulerListener(stamp);
          
          let display = gameRulerService.isDisplayed(ruler);
          if( !display ||
              R.isNil(stamp) ||
              game_ruler.stamp === stamp ) return;
          
          let event_name = 'changeModel-'+stamp;
          console.info('subscribe Ruler listener', on, event_name);
          game_ruler.unsubscribe = pubSubService.subscribe(event_name, () => {
            console.info('update Ruler', on);
            gameRulerService.updateOriginTarget($scope, ruler);
          }, game_event_channel);
        }, $scope);
        $scope.$on('$destroy', () => {
          cleanupRulerListener();
        });
      }
      updateGameRulerOriginTarget('origin');
      updateGameRulerOriginTarget('target');
      
      $scope.digestOnGameEvent('diceRoll', $scope);
      $scope.digestOnGameEvent('changeBoard', $scope);
      $scope.digestOnGameEvent('changeLayers', $scope);
      $scope.digestOnGameEvent('changeScenario', $scope);
      $scope.digestOnGameEvent('createModel', $scope);
      $scope.digestOnGameEvent('createTemplate', $scope);
      $scope.digestOnGameEvent('switchMode', $scope);
      $scope.digestOnGameEvent('gameLoaded', $scope);
      
      $scope.saveGame = (game) => {
        return R.pipeP(
          (game) => {
            if(is_online) return self.Promise.resolve(game);
            
            return R.pipeP(
              gamesService.updateLocalGame$($scope.game_index, game),
              (games) => {
                $scope.local_games = games;
                return game;
              }
            )($scope.local_games);
          },
          (game) => {
            if(R.isNil(game)) return game;

            $scope.game = game;
            $scope.gameEvent('saveGame', game);

            return game;
          }
        )(game);
      };

      $scope.currentModeName = () => {
        if(!R.exists($scope.modes)) return '';
        return modesService.currentModeName($scope.modes);
      };
      $scope.currentModeIs = (mode) => {
        if(!R.exists($scope.modes)) return false;
        return modesService.currentModeName($scope.modes) === mode;
      };
      $scope.doSwitchToMode = (mode) => {
        return modesService.switchToMode(mode, $scope, $scope.modes)
          .catch((reason) => {
            $scope.gameEvent('modeActionError', reason);
            return self.Promise.reject(reason);
          });
      };
      $scope.doModeAction = (action) => {
        return modesService.currentModeAction(action, $scope, $scope.modes)
          .catch((reason) => {
            $scope.gameEvent('modeActionError', reason);
            return self.Promise.reject(reason);
          });
      };
      $scope.doExecuteCommand = function doExecuteCommand(...args) {
        args = R.concat(args, [$scope, $scope.game]);
        return gameService.executeCommand.apply(gameService, args)
          .catch((reason) => {
            $scope.gameEvent('modeActionError', reason);
            return self.Promise.reject(reason);
          });
      };
      $scope.show_action_group = null;
      $scope.doActionButton = function doActionButton([label, action, group]) {
        label = label;
        if(action === 'toggle') {
          $scope.show_action_group = ( ($scope.show_action_group === group) ?
                                       null :
                                       group
                                     );
          return;
        }
        $scope.doModeAction(action);
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
      R.forEach((fwd) => {
        $scope.$on(fwd, (e, target, event) => {
          console.log('$on '+fwd, arguments);
          $scope.gameEvent('closeSelectionDetail');
          modesService.currentModeAction(fwd, $scope, target, event, $scope.modes)
            .catch((reason) => {
              $scope.gameEvent('modeActionError', reason);
            });
        });
      }, forward_events);
      $scope.$on('$destroy', () => {
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
        () => {
          let unsub = pubSubService.subscribe('chat', (event, chats) => {
            let msg = R.last(chats);
            console.log('gameCtrl: userMailHint', event, chats, msg);
            if(msg.from === $scope.user.state.stamp) return;

            $scope.hints.go_to_online = !$scope.stateIs('game.online');
            $scope.$digest();
          }, $scope.user.connection.channel);
          $scope.$on('$destroy', () => { unsub(); });
        },
        () => {
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
              (local_games) => {
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
        (game) => {
          if(R.isNil(game)) {
            $scope.goToState('lounge');
            return self.Promise.reject('load game: unknown');
          }
          
          $scope.game = game;
          return modesService.init($scope);
        },
        (modes) => {
          $scope.modes = modes;
          
          if($state.current.name === 'game') {
            $scope.goToState('.main');
          }
          $scope.create = {};
          
          return $scope.data_ready;
        },
        () => {
          return gameService.load($scope, $scope.game);
        },
        (game) => {
          if(!is_online) return game;

          return gameConnectionService
            .open$(R.pathOr('', ['user','state','name'], $scope),
                   $scope, game);
        },
        (game) => {
          $scope.$on('$destroy', function gameCtrlOnDestroy() {
            gameConnectionService.close(game);
          });
          console.error('#### Game Loaded', $scope.game);
          $scope.$digest();
        }
      )();
    }
  ]);
