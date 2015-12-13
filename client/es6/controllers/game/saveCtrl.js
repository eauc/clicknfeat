'use strict';

angular.module('clickApp.controllers')
  .controller('gameSaveCtrl', [
    '$scope',
    'fileExport',
    'game',
    'gameModels',
    'gameModelSelection',
    function($scope,
             fileExportService,
             gameService,
             gameModelsService,
             gameModelSelectionService) {
      console.log('init gameSaveCtrl');
      
      $scope.save = {
        name: 'clicknfeat_game.json',
        url: null
      };
      $scope.selection_save = {
        name: 'models.json',
        url: null
      };
      function cleanup() {
        fileExportService.cleanup($scope.save.url);
        $scope.save.url = null;
        fileExportService.cleanup($scope.selection_save.url);
        $scope.selection_save.url = null;
      }
      $scope.updateExports = function updateExports() {
        cleanup();
        
        fileExportService.generate('json', $scope.game)
          .then(function(url) {
            $scope.save.url = url;
            $scope.$digest();
          });

        var stamps = gameModelSelectionService.get('local', $scope.game.model_selection);
        R.pipeP(
          gameModelsService.copyStamps$(stamps),
          fileExportService.generate$('json'),
          function(url) {
            $scope.selection_save.url = url;
            $scope.$digest();
          }
        )($scope.game.models);
      };
      $scope.$on('$destroy', cleanup);
      $scope.onGameLoad.then(function onGameLoad() {
        $scope.updateExports();
      });

      $scope.onGameEvent('saveGame', function onSaveGame() {
        $scope.updateExports();
      }, $scope);
    }
  ]);
