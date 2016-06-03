(function() {
  angular.module('clickApp.controllers')
    .controller('settingsCtrl', settingsCtrl);

  settingsCtrl.$inject = [
    '$scope',
    'appData',
    'allModes',
  ];
  function settingsCtrl($scope,
                        appDataService) {
    const vm = this;
    console.log('init settingsCtrl');

    vm.doUpdateSettings = doUpdateSettings;

    activate();

    function activate() {
      vm.edit = {};
      $scope.bindCell(updateEditSettings, appDataService.settings, $scope);
    }
    function updateEditSettings(settings) {
      vm.edit = R.thread(settings)(
        R.propOr({}, 'current'),
        JSON.stringify,
        JSON.parse
      );
      vm.menu = R.thread(settings)(
        R.propOr({}, 'default'),
        R.keys,
        R.concat(['Main', 'Models'])
      );
    }

    function doUpdateSettings() {
      $scope.sendAction('Settings.reset', vm.edit);
    }
  }
})();
