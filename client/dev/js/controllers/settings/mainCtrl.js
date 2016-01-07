'use strict';

angular.module('clickApp.controllers').controller('settingsMainCtrl', ['$scope', function ($scope) {
  console.log('init settingsMainCtrl');

  $scope.digestOnStateChangeEvent('Exports.settings', $scope);
  $scope.onStateChangeEvent('Settings.loadFile', function (event, result) {
    $scope.load_settings_result = result;
    $scope.$digest();
  }, $scope);

  $scope.doLoadSettingsFile = function (files) {
    $scope.stateEvent('Settings.loadFile', files[0]);
  };
  $scope.doResetSettings = function () {
    $scope.stateEvent('Settings.reset', {});
  };
}]);
//# sourceMappingURL=mainCtrl.js.map
