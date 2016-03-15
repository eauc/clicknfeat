'use strict';

(function () {
  angular.module('clickApp.services').factory('gameModels', gameModelsModelFactory);

  gameModelsModelFactory.$inject = ['gameElements', 'model'];
  function gameModelsModelFactory(gameElementsModel, modelModel) {
    var base = gameElementsModel('model', modelModel);
    var gameModelsModel = Object.create(base);
    R.deepExtend(gameModelsModel, {
      findStampsBetweenPointsP: modelsFindStampBetweenPointsP,
      modeForStampP: modelsModeForStampP
    });

    R.curryService(gameModelsModel);
    return gameModelsModel;

    function modelsFindStampBetweenPointsP(top_left, bottom_right, models) {
      return new self.Promise(function (resolve, reject) {
        var stamps = R.thread(models)(gameModelsModel.all, R.filter(modelModel.isBetweenPoints$(top_left, bottom_right)), R.map(R.path(['state', 'stamp'])));
        if (R.isEmpty(stamps)) reject('No model found between points');else resolve(stamps);
      });
    }
    function modelsModeForStampP(stamp, models) {
      return R.threadP(models)(gameModelsModel.findStampP$(stamp), modelModel.modeFor$);
    }
  }
})();
//# sourceMappingURL=models.js.map
