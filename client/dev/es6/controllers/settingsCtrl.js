angular.module('clickApp.controllers')
  .controller('settingsCtrl', [
    '$scope',
    function($scope) {
      console.log('init settingsCtrl');

      function updateEditSettings() {
        $scope.edit_settings = JSON.parse(JSON.stringify($scope.state.settings.current));
        $scope.menu = R.concat(['Main', 'Models'],
                               R.keys($scope.state.settings.default));
        $scope.$digest();
      }
      $scope.state.data_ready.then(updateEditSettings);
      $scope.onStateChangeEvent('Settings.change', updateEditSettings, $scope);

      $scope.doUpdateSettings = () => {
        $scope.stateEvent('Settings.reset', $scope.edit_settings);
      };
    }
  ]);
