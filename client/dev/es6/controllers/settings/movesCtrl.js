angular.module('clickApp.controllers')
  .controller('settingsMovesCtrl', [
    '$scope',
    function($scope) {
      console.log('init settingsMovesCtrl');

      function updateModes() {
        $scope.modes = R.keys($scope.state.settings.default['Moves']).sort();
        $scope.mode = R.defaultTo(R.head($scope.modes), $scope.mode);
      }
      $scope.state.data_ready.then(updateModes);

      $scope.$on('$destroy', $scope.doUpdateSettings);
    }
  ]);
