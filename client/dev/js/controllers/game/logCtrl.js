'use strict';

angular.module('clickApp.controllers').controller('gameLogCtrl', ['$scope', function ($scope) {
  console.log('init gameLogCtrl');

  $scope.digestOnGameEvent('command', $scope);
}]);
//# sourceMappingURL=logCtrl.js.map