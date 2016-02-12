'use strict';

(function () {
  angular.module('clickApp.services').factory('gameLayers', gameLayersModelFactory);

  gameLayersModelFactory.$inject = [];
  function gameLayersModelFactory() {
    var gameLayersModel = {
      create: layersCreate,
      isDisplayed: layersIsDisplayed,
      set: layersSet,
      unset: layersUnset,
      toggle: layersToggle
    };
    R.curryService(gameLayersModel);
    return gameLayersModel;

    function layersCreate() {
      return ['b', 'd', 's', 'm', 't'];
    }
    function layersIsDisplayed(l) {
      var layers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      return R.find(R.equals(l), layers);
    }
    function layersSet(l) {
      var layers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      return R.uniq(R.append(l, layers));
    }
    function layersUnset(l) {
      var layers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      return R.reject(R.equals(l), layers);
    }
    function layersToggle(l, layers) {
      if (gameLayersModel.isDisplayed(l, layers)) {
        return gameLayersModel.unset(l, layers);
      } else {
        return gameLayersModel.set(l, layers);
      }
    }
  }
})();
//# sourceMappingURL=layers.js.map
