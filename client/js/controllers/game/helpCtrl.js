'use strict';

angular.module('clickApp.controllers')
  .controller('gameHelpCtrl', [
    '$scope',
    'game',
    'modes',
    'fileExport',
    function($scope,
             gameService,
             modesService,
             fileExportService) {
      console.log('init gameHelpCtrl');

      $scope.debug = {
        name: 'clicknfeat_debug.json',
        url: null
      };
      $scope.updateExports = function updateExports() {
        fileExportService.cleanup($scope.debug.url);
        fileExportService.generate('json', {
          settings: $scope.settings.current,
          game: $scope.game
        }).then(function(url) {
          $scope.debug.url = url;
          $scope.$digest();
        });
      };
      $scope.$on('$destroy', function onDestroy() {
        fileExportService.cleanup($scope.debug.url);
      });
      $scope.onGameEvent('saveGame', function onSaveGame() {
        $scope.updateExports();
      }, $scope);

      $scope.onGameEvent('switchMode', function onSwitchMode() {
        $scope.bindings = modesService.currentModeBindingsPairs($scope.modes);
      }, $scope);

      $scope.onGameLoad.then(function() {
        $scope.updateExports();
        $scope.bindings = modesService.currentModeBindingsPairs($scope.modes);
      });
    }
  ]);
