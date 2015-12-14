'use strict';

angular.module('clickApp.controllers').controller('settingsMainCtrl', ['$scope', 'fileImport', 'fileExport', function ($scope, fileImportService, fileExportService) {
  console.log('init settingsMainCtrl');

  $scope.save = {
    name: 'clicknfeat_settings.json',
    url: null
  };
  function cleanup() {
    fileExportService.cleanup($scope.save.url);
  }
  $scope.updateExports = function updateExports() {
    cleanup();

    R.pipeP(function () {
      return fileExportService.generate('json', $scope.settings.current);
    }, function (url) {
      $scope.save.url = url;
    })();
  };
  $scope.$on('$destroy', cleanup);
  $scope.data_ready.then(function () {
    $scope.updateExports();
  });

  $scope.doOpenSettingsFile = function (files) {
    console.log('openSettingsFile', files);

    $scope['open_result'] = '';
    R.pipe(function () {
      return fileImportService.read('json', files[0]).catch(function (error) {
        $scope['open_result'] = error;
      });
    }, function (data) {
      if (R.isNil(data)) return;

      $scope.doResetSettings(data);
      $scope['open_result'] = ['Settings loaded'];
    }, function () {
      $scope.$digest();
    })();
  };
}]);
//# sourceMappingURL=mainCtrl.js.map
