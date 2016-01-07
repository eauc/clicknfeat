'use strict';

angular.module('clickApp.services').factory('gameLayers', [function gameLayersServiceFactory() {
  var gameLayersService = {
    create: function layersCreate() {
      return ['b', 'd', 's', 'm', 't'];
    },
    isDisplayed: function layerIsDisplayed(l) {
      var layers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      return R.find(R.equals(l), layers);
    },
    set: function layersSet(l) {
      var layers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      return R.uniq(R.append(l, layers));
    },
    unset: function layersUnset(l) {
      var layers = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];

      return R.reject(R.equals(l), layers);
    },
    toggle: function layersToggle(l, layers) {
      if (gameLayersService.isDisplayed(l, layers)) {
        return gameLayersService.unset(l, layers);
      } else {
        return gameLayersService.set(l, layers);
      }
    }
  };
  R.curryService(gameLayersService);
  return gameLayersService;
}]);
//# sourceMappingURL=layers.js.map
