'use strict';

(function () {
  angular.module('clickApp.controllers').controller('settingsMainCtrl', settingsMainCtrl);

  settingsMainCtrl.$inject = ['$scope', 'appData'];
  function settingsMainCtrl($scope, appDataService) {
    var vm = this;
    console.log('init settingsMainCtrl');

    vm.doLoadSettingsFile = doLoadSettingsFile;
    vm.doResetSettings = doResetSettings;

    activate();

    function activate() {
      $scope.bindCell(function (exp) {
        vm.export = exp;
      }, appDataService.export.settings, $scope);
    }
    function doLoadSettingsFile(files) {
      $scope.sendAction('Settings.loadFile', files[0]);
    }
    function doResetSettings() {
      $scope.sendAction('Settings.reset', {});
    }
  }
})();
//# sourceMappingURL=settingsMainCtrl.js.map
