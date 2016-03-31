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
      $scope.onStateChangeEvent('Settings.loadFile', updateLoadResult, $scope);
      $scope.bindCell($scope.state.exports.settings, (exp) => {
        vm.export = exp;
      }, $scope);
    }
    function updateLoadResult(_event_, [result]) {
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
