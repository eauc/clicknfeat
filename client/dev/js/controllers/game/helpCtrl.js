'use strict';

angular.module('clickApp.controllers').controller('gameHelpCtrl', ['$scope', 'game', 'modes', 'fileExport', function ($scope, gameService, modesService, fileExportService) {
  console.log('init gameHelpCtrl');

  $scope.debug = {
    name: 'clicknfeat_debug.json',
    url: null
  };
  $scope.updateExports = function () {
    fileExportService.cleanup($scope.debug.url);
    fileExportService.generate('json', {
      settings: $scope.settings.current,
      game: $scope.game
    }).then(function (url) {
      $scope.debug.url = url;
      $scope.$digest();
    });
  };

  $scope.onGameLoad.then(function () {
    $scope.updateExports();
    $scope.bindings = modesService.currentModeBindingsPairs($scope.modes);
    $scope.$digest();
  });
  $scope.onGameEvent('saveGame', function () {
    $scope.updateExports();
    $scope.$digest();
  }, $scope);
  $scope.onGameEvent('switchMode', function () {
    $scope.bindings = modesService.currentModeBindingsPairs($scope.modes);
    $scope.$digest();
  }, $scope);
  $scope.$on('$destroy', function () {
    fileExportService.cleanup($scope.debug.url);
  });
}]);
//# sourceMappingURL=helpCtrl.js.map
