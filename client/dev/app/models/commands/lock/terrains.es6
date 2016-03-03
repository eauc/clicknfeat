(function() {
  angular.module('clickApp.services')
    .factory('lockTerrainsCommand', lockTerrainsCommandModelFactory);

  lockTerrainsCommandModelFactory.$inject = [
    'lockElementsCommand',
    'commands',
    'gameTerrains',
  ];
  function lockTerrainsCommandModelFactory(lockElementsCommandModel,
                                           commandsModel,
                                           gameTerrainsModel) {
    const lockTerrainsCommandModel =
            lockElementsCommandModel('terrain',
                                     gameTerrainsModel);
    commandsModel.registerCommand('lockTerrains', lockTerrainsCommandModel);
    return lockTerrainsCommandModel;
  }
})();
