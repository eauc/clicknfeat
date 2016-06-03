(function() {
  angular.module('clickApp.controllers')
    .controller('settingsModelsCtrl', settingsModelsCtrl);

  settingsModelsCtrl.$inject = [
    '$scope',
    'appData',
  ];
  function settingsModelsCtrl($scope,
                              appDataService) {
    const vm = this;
    console.log('init settingsModelsCtrl');

    vm.hasDesc = hasDesc;
    vm.doOpenFactionFile = doOpenFactionFile;
    vm.doClearFactionDesc = doClearFactionDesc;
    vm.doClearAllDesc = doClearAllDesc;

    activate();

    function activate() {
      appDataService.ready.then(updateFactions);
    }
    function updateFactions() {
      vm.factions = R.path(['factions', 'base'], $scope.state);
    }
    function hasDesc(faction) {
      return R.thread($scope.state)(
        R.path(['factions','desc',faction]),
        R.type,
        R.equals('Object')
      );
    }
    function doOpenFactionFile(faction, files) {
      $scope.sendAction('Factions.loadDescFile', faction, files[0]);
    }
    function doClearFactionDesc(faction) {
      $scope.sendAction('Factions.clearDesc', faction);
    }
    function doClearAllDesc() {
      $scope.sendAction('Factions.clearAllDesc');
    }
  }
})();
