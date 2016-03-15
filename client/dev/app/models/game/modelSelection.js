'use strict';

(function () {
  angular.module('clickApp.services').factory('gameModelSelection', gameModelSelectionModelFactory);

  gameModelSelectionModelFactory.$inject = ['gameElementSelection', 'gameModels'];
  function gameModelSelectionModelFactory(gameElementSelectionModel, gameModelsModel) {
    var base = gameElementSelectionModel('model');
    var gameModelSelectionModel = Object.create(base);
    R.deepExtend(gameModelSelectionModel, {
      inSingle: modelSelectionInSingle,
      modeForP: modeForP,
      checkModeP: modelSelectionCheckModeP
    });
    R.curryService(gameModelSelectionModel);
    return gameModelSelectionModel;

    function modelSelectionInSingle(where, stamp, selection) {
      var stamps = R.prop(where, selection);
      return R.length(stamps) === 1 && stamps[0] === stamp;
    }
    function modeForP(models, selection) {
      var local = gameModelSelectionModel.get('local', selection);
      if (R.isEmpty(local)) {
        return self.Promise.reject('No model selection');
      }
      if (R.length(local) === 1) {
        return gameModelsModel.modeForStampP(local[0], models);
      }
      return 'Models';
    }
    function modelSelectionCheckModeP(state, selection) {
      return R.threadP(selection)(gameModelSelectionModel.modeForP$(state.game.models), function (mode) {
        state.queueEventP('Modes.switchTo', mode);
      });
    }
  }
})();
//# sourceMappingURL=modelSelection.js.map
