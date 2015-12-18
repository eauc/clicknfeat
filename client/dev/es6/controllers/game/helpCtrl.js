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
      $scope.updateExports = () => {
        fileExportService.cleanup($scope.debug.url);
        fileExportService.generate('json', {
          settings: $scope.settings.current,
          game: $scope.game
        }).then((url) => {
          $scope.debug.url = url;
          $scope.$digest();
        });
      };

      $scope.onGameLoad.then(() => {
        $scope.updateExports();
        $scope.bindings = modesService.currentModeBindingsPairs($scope.modes);
        $scope.$digest();
      });
      $scope.onGameEvent('saveGame', () => {
        $scope.updateExports();
        $scope.$digest();
      }, $scope);
      $scope.onGameEvent('switchMode', () => {
        $scope.bindings = modesService.currentModeBindingsPairs($scope.modes);
        $scope.$digest();
      }, $scope);
      $scope.$on('$destroy', () => {
        fileExportService.cleanup($scope.debug.url);
      });
    }
  ]);
