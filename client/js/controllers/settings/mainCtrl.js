'use strict';

angular.module('clickApp.controllers')
  .controller('settingsMainCtrl', [
    '$scope',
    'fileImport',
    'fileExport',
    function($scope,
             fileImportService,
             fileExportService) {
      console.log('init settingsMainCtrl');
      
      $scope.updateExports = function updateExports() {
        $scope.save = {
          name: 'clicknfeat_settings.json',
          url: fileExportService.generate('json', $scope.settings.current)
        };
      };
      $scope.$on('$destroy', function onDestroy() {
        fileExportService.cleanup($scope.save.url);
      });
      $scope.updateExports();

      $scope.doOpenSettingsFile = function(files) {
        console.log('openSettingsFile', files);
        fileImportService.read('json', files[0])
          .then(function(data) {
            $scope.doResetSettings(data);
            $scope['open_result'] = [ 'Settings loaded' ];
          })
          .catch(function(error) {
            $scope['open_result'] = error;
          })
          .then(function() {
            $scope.deferDigest($scope);
          });
      };
    }
  ]);
