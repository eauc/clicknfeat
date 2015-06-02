'use strict';

angular.module('clickApp.controllers')
  .controller('gameHelpCtrl', [
    '$scope',
    'modes',
    'fileExport',
    function($scope,
             modesService,
             fileExportService) {
      console.log('init gameHelpCtrl');
      $scope.current_bindings = modesService.currentModeBindingsPairs($scope.modes);
      $scope.onGameEvent('switchMode', function onSwitchMode() {
        $scope.current_bindings = modesService.currentModeBindingsPairs($scope.modes);
        $scope.deferDigest($scope);
      }, $scope);
      
      $scope.updateExports = function updateExports() {
        $scope.debug = {
          name: 'clicknfeat_debug.json',
          url: fileExportService.generate('json', {
            settings: $scope.settings.current,
            game: $scope.game
          })
        };
        $scope.deferDigest($scope);
      };
      $scope.$on('$destroy', function onDestroy() {
        fileExportService.cleanup($scope.debug.url);
      });
      $scope.updateExports();
      $scope.onGameEvent('saveGame', function onSaveGame() {
        fileExportService.cleanup($scope.debug.url);
        $scope.updateExports();
      }, $scope);
    }
  ]);
