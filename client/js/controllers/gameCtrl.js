'use strict';

angular.module('clickApp.controllers')
  .controller('gameCtrl', [
    '$scope',
    '$state',
    '$stateParams',
    '$window',
    'game',
    'games',
    'modes',
    'allModes',
    'allCommands',
    'allTemplates',
    function($scope,
             $state,
             $stateParams,
             $window,
             gameService,
             gamesService,
             modesService) {
      console.log('init gameCtrl', $stateParams, $state.current.name);
      var onLoad;
      if($stateParams.where === 'offline') {
        onLoad = gamesService.loadLocalGames()
            .then(function(local_games) {
              $scope.local_games = local_games;
              $scope.game_index = $stateParams.id >> 0;
              $scope.game = R.nth($scope.game_index,
                                  $scope.local_games);
              console.log('load game', $scope.game);
            });
      }
      
      $scope.gameEvent = function gameEvent() {
        var args = Array.prototype.slice.apply(arguments);
        console.log('gameEvent', args);
        $scope.$broadcast.apply($scope, args);
      };
      $scope.digestOnGameEvent = function digestOnGameEvent(scope, event) {
        scope.$on(event, function _digestOnGameEvent() {
          // console.log('digest on '+event);
          $scope.deferDigest(scope);
        });
      };

      $scope.saveGame = function saveGame(game) {
        $scope.game = game;
        console.log('save game', $scope.game);
        $scope.local_games[$scope.game_index] = $scope.game;
        gamesService.storeLocalGames($scope.local_games);
        $scope.gameEvent('saveGame');
      };

      $scope.modes = modesService.init($scope);
      $scope.doModeAction = function doModeAction(action) {
        modesService.currentModeAction(action, $scope, $scope.modes);
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
        'clickTemplate',
        'rightClickTemplate',
        'dragStartTemplate',
        'dragTemplate',
        'dragEndTemplate',
        'clickMap',
        'rightClickMap',
        'moveMap',
        'dragStartMap',
        'dragMap',
        'dragEndMap',
      ];
      R.forEach(function(fwd) {
        $scope.$on(fwd, function onForwardEvent(e, target, event) {
          console.log('$on '+fwd, arguments);
          $scope.gameEvent('closeSelectionDetail');
          modesService.currentModeAction(fwd, $scope, target, event, $scope.modes);
        });
      }, forward_events);
      $scope.$on('$destroy', function onGameCtrlDestroy() {
        console.log('on gameCtrl $destroy');
        Mousetrap.reset();
      });

      onLoad.then(function() {
        if(R.isNil($scope.game)) {
          $scope.goToState('lounge');
          return;
        }
        if($state.current.name === 'game') {
          $scope.goToState('.main');
        } 
        $scope.create = {};
        $scope.game = gameService.load($scope, $scope.game);
      });
    }
  ]);
