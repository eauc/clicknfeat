'use strict';

angular.module('clickApp.controllers')
  .controller('gameSaveCtrl', [
    '$scope',
    'fileExport',
    'game',
    function($scope,
             fileExportService,
             gameService) {
      console.log('init gameSaveCtrl');
      
      $scope.save = {
        name: 'clicknfeat_game.json',
        url: null
      };
      $scope.updateExports = function updateExports() {
        fileExportService.cleanup($scope.save.url);
        fileExportService.generate('json', $scope.game)
          .then(function(url) {
            $scope.save.url = url;
            $scope.$digest();
          });
      };
      $scope.$on('$destroy', function onDestroy() {
        fileExportService.cleanup($scope.save.url);
      });
      $scope.onGameLoad.then(function onGameLoad() {
        $scope.updateExports();
      });

      $scope.onGameEvent('saveGame', function onSaveGame() {
        $scope.updateExports();
      }, $scope);
    }
  ]);
