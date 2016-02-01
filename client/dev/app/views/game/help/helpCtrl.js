'use strict';

angular.module('clickApp.controllers').controller('gameHelpCtrl', ['$scope', 'modes', function ($scope, modesService) {
  console.log('init gameHelpCtrl');

  function updateDump() {
    $scope.dump = R.path(['state', 'exports', 'dump'], $scope);
    $scope.$digest();
  }
  $scope.onStateChangeEvent('Exports.dump', updateDump, $scope);
  self.requestAnimationFrame(updateDump);

  function updateBindings() {
    $scope.bindings = R.pipe(R.path(['state', 'modes']), modesService.currentModeBindingsPairs)($scope);
    $scope.$digest();
  }
  $scope.onStateChangeEvent('Modes.change', updateBindings, $scope);
  self.requestAnimationFrame(updateBindings);
}]);
//# sourceMappingURL=helpCtrl.js.map
