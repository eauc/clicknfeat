(function() {
  angular.module('clickApp.controllers')
    .controller('settingsModelsCtrl', settingsModelsCtrl);

  settingsModelsCtrl.$inject = [
    '$scope',
  ];
  function settingsModelsCtrl($scope) {
    const vm = this;
    console.log('init settingsModelsCtrl');

    vm.hasDesc = hasDesc;
    vm.doOpenFactionFile = doOpenFactionFile;
    vm.doClearFactionDesc = doClearFactionDesc;
    vm.doClearAllDesc = doClearAllDesc;

    activate();

    function activate() {
      self.requestAnimationFrame(updateFactions);
      $scope.onStateChangeEvent('Factions.change', updateFactions, $scope);
      $scope.onStateChangeEvent('Factions.loadDescFile', updateLoadResult, $scope);
    }
    function updateFactions() {
      vm.factions = R.path(['factions', 'base'], $scope.state);
      $scope.$digest();
    }
    function updateLoadResult(event, result) {
      $scope.result = result;
      $scope.$digest();
    }
    function hasDesc(faction) {
      return R.thread($scope.state)(
        R.path(['factions','desc',faction]),
        R.type,
        R.equals('Object')
      );
    }
    function doOpenFactionFile(faction, files) {
      $scope.stateEvent('Factions.loadDescFile', faction, files[0]);
    }
    function doClearFactionDesc(faction) {
      $scope.stateEvent('Factions.clearDesc', faction);
    }
    function doClearAllDesc() {
      $scope.stateEvent('Factions.clearAllDesc');
    }
  }
})();
