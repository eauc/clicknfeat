angular.module('clickApp.controllers')
  .controller('gameSaveCtrl', [
    '$scope',
    'fileExport',
    'game',
    'gameModels',
    'gameModelSelection',
    'gameTerrains',
    function($scope) {
      console.log('init gameSaveCtrl');

      function updateExports() {
        $scope.exports = R.path(['state','exports'], $scope);
        $scope.$digest();
      }
      $scope.onStateChangeEvent('Exports.game', updateExports, $scope);
      $scope.onStateChangeEvent('Exports.board', updateExports, $scope);
      $scope.onStateChangeEvent('Exports.models', updateExports, $scope);
      self.requestAnimationFrame(updateExports);
    }
  ]);
