'use strict';

angular.module('clickApp.directives').controller('clickGameModelDamageCtrl', ['$scope', function ($scope) {
  console.log('init clickModelDamageCtrl', $scope.info, $scope.state);
  var state = $scope.$parent.state;

  $scope.range = function (n) {
    return R.range(0, n);
  };

  $scope.warriorBoxClass = function (i) {
    return $scope.state && $scope.state.dmg.n > i ? 'mark' : '';
  };
  $scope.fieldBoxClass = function (col, line) {
    return $scope.state && $scope.state.dmg.f > line * $scope.info.field / 2 + col ? 'mark' : '';
  };
  $scope.gridBoxClass = function (col, line) {
    return !$scope.info[col][line] ? 'none' : $scope.state && $scope.state.dmg[col][line] === 1 ? 'mark' : '';
  };
  $scope.doResetDamage = function () {
    if (R.isNil($scope.state)) return;

    $scope.stateEvent('Game.command.execute', 'onModels', ['resetDamage', [][$scope.state.stamp]]).then(function () {
      $scope.$digest();
    });
  };
  $scope.doWarriorDamage = function (i) {
    if (R.isNil($scope.state)) return;
    $scope.stateEvent('Game.command.execute', 'onModels', ['setWarriorDamage', [state.factions, i], [$scope.state.stamp]]).then(function () {
      $scope.$digest();
    });
  };
  $scope.doFieldDamage = function (i) {
    if (R.isNil($scope.state)) return;
    $scope.stateEvent('Game.command.execute', 'onModels', ['setFieldDamage', [state.factions, i], [$scope.state.stamp]]).then(function () {
      $scope.$digest();
    });
  };
  $scope.doGridDamage = function (line, col) {
    if (R.isNil($scope.state)) return;
    if (R.isNil($scope.info[col][line])) return;
    $scope.stateEvent('Game.command.execute', 'onModels', ['setGridDamage', [state.factions, line, col], [$scope.state.stamp]]).then(function () {
      $scope.$digest();
    });
  };
  $scope.doGridColDamage = function (col) {
    if (R.isNil($scope.state)) return;
    $scope.stateEvent('Game.command.execute', 'onModels', ['setGridColDamage', [state.factions, col], [$scope.state.stamp]]).then(function () {
      $scope.$digest();
    });
  };
}]).directive('clickGameModelDamage', [function () {
  return {
    restrict: 'E',
    scope: {
      info: '=',
      state: '=',
      onError: '&'
    },
    controller: 'clickGameModelDamageCtrl',
    templateUrl: 'partials/game/model_damage.html',
    link: function link(scope) {
      console.log('gameModelDamage', scope);
    }
  };
}]);
//# sourceMappingURL=modelDamage.js.map
