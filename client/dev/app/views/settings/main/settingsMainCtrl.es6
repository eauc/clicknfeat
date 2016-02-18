(function() {
  angular.module('clickApp.controllers')
    .controller('settingsMainCtrl', settingsMainCtrl);

  settingsMainCtrl.$inject = [
    '$scope',
  ];
  function settingsMainCtrl($scope) {
    const vm = this;
    console.log('init settingsMainCtrl');

    vm.doLoadSettingsFile = doLoadSettingsFile;
    vm.doResetSettings = doResetSettings;

    activate();

    function activate() {
      $scope.digestOnStateChangeEvent('Exports.settings', $scope);
      $scope.onStateChangeEvent('Settings.loadFile', updateLoadResult, $scope);
    }
    function updateLoadResult(event, result) {
      vm.load_settings_result = result;
      $scope.$digest();
    }
    function doLoadSettingsFile(files) {
      $scope.stateEvent('Settings.loadFile', files[0]);
    }
    function doResetSettings() {
      $scope.stateEvent('Settings.reset', {});
    }
  }
})();
