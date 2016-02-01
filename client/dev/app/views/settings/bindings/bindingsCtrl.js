'use strict';

angular.module('clickApp.controllers').controller('settingsBindingsCtrl', ['$scope', function ($scope) {
  console.log('init settingsBindingsCtrl');

  $scope.getBindingsKeys = function (mode) {
    return R.keys($scope.state.settings.default['Bindings'][mode]).sort();
  };
  function updateModes() {
    $scope.modes = R.keys($scope.state.settings.default['Bindings']).sort();
    $scope.mode = R.defaultTo(R.head($scope.modes), $scope.mode);
  }
  $scope.state.data_ready.then(updateModes);

  $scope.doRecordBinding = function (action) {
    if ($scope.recording) return;
    $scope.recording = action;

    R.pipeP(function () {
      return new self.Promise(function (resolve) {
        Mousetrap.record(function (seq) {
          console.log('Mousetrap seq recorded', seq);
          resolve(seq);
        });
      });
    }, function (seq) {
      if (R.isNil(seq) || R.isEmpty(seq)) {
        return;
      }
      $scope.edit_settings.Bindings[$scope.mode][action] = seq.join(' ');
    }, function () {
      $scope.recording = null;
      $scope.$digest();
    })();
  };

  $scope.$on('$destroy', $scope.doUpdateSettings);
}]);
//# sourceMappingURL=bindingsCtrl.js.map
