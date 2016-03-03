'use strict';

(function () {
  angular.module('clickApp.services').factory('createTerrainMode', createTerrainModeModelFactory);

  createTerrainModeModelFactory.$inject = ['createElementMode', 'modes', 'settings'];
  function createTerrainModeModelFactory(createElementModeModel, modesModel, settingsModel) {
    var createTerrain_mode = createElementModeModel('terrain');

    modesModel.registerMode(createTerrain_mode);
    settingsModel.register('Bindings', createTerrain_mode.name, createTerrain_mode.bindings, function (bs) {
      R.extend(createTerrain_mode.bindings, bs);
    });
    return createTerrain_mode;
  }
})();
//# sourceMappingURL=terrain.js.map
