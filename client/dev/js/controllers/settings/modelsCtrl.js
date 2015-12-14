'use strict';

angular.module('clickApp.controllers').controller('settingsModelsCtrl', ['$scope', 'fileImport', 'gameFactions', function ($scope, fileImportService, gameFactionsService) {
  console.log('init settingsModelsCtrl');

  gameFactionsService.loadDesc().then(function (desc) {
    $scope.desc = desc;
  });
  $scope.hasDesc = function hasDesc(faction) {
    return R.exists($scope.desc) && R.type($scope.desc[faction]) === 'Object';
  };

  $scope.doOpenFactionFile = function (faction, files) {
    console.log('openFactionFile', faction, files);

    $scope.success = '';
    $scope.error = '';
    R.pipeP(function () {
      return fileImportService.read('json', files[0]).catch(function (error) {
        $scope.error = 'error loading file : ' + error;
      });
    }, function (data) {
      if (R.isNil(data)) return;

      console.log(data);
      $scope.success = 'file loaded';

      $scope.desc[faction] = data;
      gameFactionsService.storeDesc($scope.desc);
      return $scope.reloadFactions();
    }, function () {
      $scope.$digest();
    })();
  };
  $scope.doClearFactionDesc = function (faction) {
    $scope.desc = R.omit([faction], $scope.desc);
    gameFactionsService.storeDesc($scope.desc);
    $scope.reloadFactions();
  };
  $scope.doClearAllDesc = function () {
    $scope.desc = {};
    gameFactionsService.storeDesc($scope.desc);
    $scope.reloadFactions();
  };
}]);
//# sourceMappingURL=modelsCtrl.js.map
