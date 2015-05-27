'use strict';

angular.module('clickApp.controllers')
  .controller('mainCtrl', [
    '$scope',
    '$state',
    '$window',
    'settings',
    'user',
    'gameBoard',
    'gameScenario',
    'allModes',
    function($scope,
             $state,
             $window,
             settingsService,
             userService,
             gameBoardService,
             gameScenarioService) {
      console.log('init mainCtrl');
      
      gameBoardService.init()
        .then(function(boards) {
          $scope.boards = boards;
          console.log('boards', boards);
        });
      gameScenarioService.init()
        .then(function(scenarios) {
          $scope.scenarios = scenarios;
          console.log('scenarios', scenarios);
        });
      $scope.settings = settingsService.init();

      $scope.user = userService.load();
      console.log('loaded user', $scope.user);
      $scope.checkUser = function checkUser() {
        if(R.isNil($scope.user.name)) {
          $state.go('user');
        }
      };
      $scope.setUser = function(new_user) {
        $scope.user = new_user;
        userService.store($scope.user);
        console.log('set user', $scope.user);
      };

      $scope.goToState = function() {
        var args = Array.prototype.slice.call(arguments);
        $state.go.apply($state, args);
      };
      $scope.stateIs = function(name) {
        return $state.is(name);
      };
      $scope.stateMatches = function(match) {
        return 0 <= $state.current.name.indexOf(match);
      };
      $scope.currentState = function() {
        return $state.current;
      };

      $scope.deferDigest = function deferDigest(scope) {
        // console.log('deferDigest');
        $window.requestAnimationFrame(function _deferDigest() {
          // console.log('_deferDigest');
          scope.$digest();
        });
      };
    }
  ]);
