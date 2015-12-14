'use strict';

angular.module('clickApp.controllers').controller('settingsCtrl', ['$scope', '$state', 'settings', function ($scope, $state, settingsService) {
  console.log('init settingsCtrl', $scope.settings);
  if ($state.current.name === 'settings') {
    $scope.goToState('.Main');
  }

  $scope.data_ready.then(function () {
    $scope.menu = R.concat(['Main', 'Models'], R.keys($scope.settings.default));
  });
  $scope.doUpdateSettings = function doUpdateSettings() {
    settingsService.update($scope.settings);
  };
}]);
//# sourceMappingURL=settingsCtrl.js.map
