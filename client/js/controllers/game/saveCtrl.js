'use strict';

angular.module('clickApp.controllers')
  .controller('gameSaveCtrl', [
    '$scope',
    'fileExport',
    function($scope,
             fileExportService) {
      console.log('init gameSaveCtrl');
      
      $scope.updateExports = function updateExports() {
        $scope.save = {
          name: 'clicknfeat_game.json',
          url: fileExportService.generate('json', $scope.game)
        };
        $scope.deferDigest($scope);
      };
      $scope.$on('$destroy', function onDestroy() {
        fileExportService.cleanup($scope.save.url);
      });
      $scope.updateExports();
      $scope.onGameEvent('saveGame', function onSaveGame() {
        fileExportService.cleanup($scope.save.url);
        $scope.updateExports();
      }, $scope);
    }
  ]);
