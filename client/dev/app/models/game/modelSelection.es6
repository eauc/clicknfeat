(function() {
  angular.module('clickApp.services')
    .factory('gameModelSelection', gameModelSelectionModelFactory);

  gameModelSelectionModelFactory.$inject = [
    'gameElementSelection',
    'gameModels',
  ];
  function gameModelSelectionModelFactory(gameElementSelectionModel,
                                          gameModelsModel) {
    const base = gameElementSelectionModel('model');
    const gameModelSelectionModel = Object.create(base);
    R.deepExtend(gameModelSelectionModel, {
      inSingle: modelSelectionInSingle,
      checkMode: modelCheckMode
    });
    R.curryService(gameModelSelectionModel);
    return gameModelSelectionModel;

    function modelSelectionInSingle(where, stamp, selection) {
      const stamps = R.prop(where, selection);
      return ( R.length(stamps) === 1 &&
               stamps[0] === stamp );
    }
    function modelCheckMode(models, selection) {
      const local = gameModelSelectionModel.get('local', selection);
      if(R.isEmpty(local)) return null;
      if(R.length(local) === 1) {
        return gameModelsModel.modeForStamp(local[0], models);
      }
      return 'Models';
    }
  }
})();
