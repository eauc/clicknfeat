'use strict';

angular.module('clickApp.controllers')
  .controller('gameSaveCtrl', [
    '$scope',
    'fileExport',
    'game',
    'gameModels',
    'gameModelSelection',
    'gameTerrains',
    function($scope,
             fileExportService,
             gameService,
             gameModelsService,
             gameModelSelectionService,
             gameTerrainsService) {
      console.log('init gameSaveCtrl');
      
      $scope.save = {
        name: 'clicknfeat_game.json',
        url: null
      };
      $scope.selection_save = {
        name: 'clicknfeat_models.json',
        url: null
      };
      $scope.board_save = {
        name: 'clicknfeat_board.json',
        url: null
      };
      function cleanup() {
        fileExportService.cleanup($scope.save.url);
        $scope.save.url = null;
        fileExportService.cleanup($scope.selection_save.url);
        $scope.selection_save.url = null;
        fileExportService.cleanup($scope.board_save.url);
        $scope.board_save.url = null;
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

        let board = {
          board: $scope.game.board,
          terrain: {
            base: { x: 0, y: 0, r: 0 },
            terrains: R.pipe(
              gameTerrainsService.all,
              R.pluck('state'),
              R.map(R.pick(['x','y','r','info','lk']))
            )($scope.game.terrains)
          }
        };
        R.pipeP(
          fileExportService.generate$('json'),
          function(url) {
            $scope.board_save.url = url;
            $scope.$digest();
          }
        )(board);
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
