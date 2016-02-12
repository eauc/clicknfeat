(function() {
  angular.module('clickApp.services')
    .factory('gameLayers', gameLayersModelFactory);

  gameLayersModelFactory.$inject = [];
  function gameLayersModelFactory() {
    const gameLayersModel = {
      create: layersCreate,
      isDisplayed: layersIsDisplayed,
      set: layersSet,
      unset: layersUnset,
      toggle: layersToggle
    };
    R.curryService(gameLayersModel);
    return gameLayersModel;

    function layersCreate() {
      return ['b','d','s','m','t'];
    }
    function layersIsDisplayed(l, layers = []) {
      return R.find(R.equals(l), layers);
    }
    function layersSet(l, layers = []) {
      return R.uniq(R.append(l, layers));
    }
    function layersUnset(l, layers = []) {
      return R.reject(R.equals(l), layers);
    }
    function layersToggle(l, layers) {
      if(gameLayersModel.isDisplayed(l, layers)) {
        return gameLayersModel.unset(l, layers);
      }
      else {
        return gameLayersModel.set(l, layers);
      }
    }
  }
})();
