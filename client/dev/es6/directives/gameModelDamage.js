'use strict';

angular.module('clickApp.controllers')
  .controller('clickGameModelDamageCtrl', [
    '$scope',
    'game',
    function($scope,
             gameService) {
      console.log('init clickModelDamageCtrl', $scope.info, $scope.state);
      $scope.range = function(n) {
        return R.range(0, n);
      };

      $scope.warriorBoxClass = function warriorBoxClass(i) {
        return ($scope.state && $scope.state.dmg.n > i) ? 'mark' : '';
      };
      $scope.fieldBoxClass = function fieldBoxClass(col, line) {
        return ($scope.state &&
                $scope.state.dmg.f > line * $scope.info.field/2 + col) ? 'mark' : '';
      };
      $scope.gridBoxClass = function gridBoxClass(col, line) {
        return ( !$scope.info[col][line] ? 'none' :
                 ($scope.state && $scope.state.dmg[col][line] === 1) ? 'mark' :
                 ''
               );
      };
      $scope.doResetDamage = function doResetDamage() {
        if(R.isNil($scope.state)) return;
        gameService.executeCommand('onModels', 'resetDamage',
                                   [$scope.state.stamp],
                                   $scope.$parent, $scope.$parent.game)
          .then(function() { $scope.$digest(); })
          .catch(function(reason) {
            console.error('Damage: ', reason);
            $scope.onError({ reason: reason });
          });
      };
      $scope.doWarriorDamage = function doWarriorDamage(i) {
        if(R.isNil($scope.state)) return;
        gameService.executeCommand('onModels', 'setWarriorDamage', $scope.$parent.factions, i,
                                   [$scope.state.stamp],
                                   $scope.$parent, $scope.$parent.game)
          .then(function() { $scope.$digest(); })
          .catch(function(reason) {
            console.error('Damage: ', reason);
            $scope.onError({ reason: reason });
          });
      };
      $scope.doFieldDamage = function doFieldDamage(i) {
        if(R.isNil($scope.state)) return;
        gameService.executeCommand('onModels', 'setFieldDamage', $scope.$parent.factions, i,
                                   [$scope.state.stamp],
                                   $scope.$parent, $scope.$parent.game)
          .then(function() { $scope.$digest(); })
          .catch(function(reason) {
            console.error('Damage: ', reason);
            $scope.onError({ reason: reason });
          });
      };
      $scope.doGridDamage = function doGridDamage(line, col) {
        if(R.isNil($scope.state)) return;
        if(R.isNil($scope.info[col][line])) return;
        gameService.executeCommand('onModels', 'setGridDamage', $scope.$parent.factions, line, col,
                                   [$scope.state.stamp],
                                   $scope.$parent, $scope.$parent.game)
          .then(function() { $scope.$digest(); })
          .catch(function(reason) {
            console.error('Damage: ', reason);
            $scope.onError({ reason: reason });
          });
      };
      $scope.doGridColDamage = function doGridColDamage(col) {
        if(R.isNil($scope.state)) return;
        gameService.executeCommand('onModels', 'setGridColDamage', $scope.$parent.factions, col,
                                   [$scope.state.stamp],
                                   $scope.$parent, $scope.$parent.game)
          .then(function() { $scope.$digest(); })
          .catch(function(reason) {
            console.error('Damage: ', reason);
            $scope.onError({ reason: reason });
          });
      };
    }
  ]);

angular.module('clickApp.directives')
  .directive('clickGameModelDamage', [
    function() {
      return {
        restrict: 'E',
        scope: {
          info: '=',
          state: '=',
          onError: '&',
        },
        controller: 'clickGameModelDamageCtrl',
        templateUrl: 'partials/game/model_damage.html',
        link: function(scope/*, element, attrs*/) {
          console.log('gameModelDamage', scope);
        }
      };
    }
  ]);
