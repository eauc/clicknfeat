angular.module('clickApp.controllers')
  .controller('settingsMainCtrl', [
    '$scope',
    function($scope) {
      console.log('init settingsMainCtrl');
      
      $scope.digestOnStateChangeEvent('Exports.settings', $scope);
      $scope.onStateChangeEvent('Settings.loadFile', (event, result) => {
        $scope.load_settings_result = result;
        $scope.$digest();
      }, $scope);

      $scope.doLoadSettingsFile = (files) => {
        $scope.stateEvent('Settings.loadFile', files[0]);
      };
      $scope.doResetSettings = () => {
        $scope.stateEvent('Settings.reset', {});
      };
    }
  ]);
