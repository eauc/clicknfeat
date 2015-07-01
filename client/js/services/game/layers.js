'use strict';

self.gameLayersServiceFactory = function gameLayersServiceFactory() {
  var gameLayersService = {
    create: function layersCreate() {
      return ['b','d','s','m','t'];
    },
    isDisplayed: function layerIsDisplayed(l, layers) {
      return R.find(R.eq(l), R.defaultTo([], layers));
    },
    set: function layersSet(l, layers) {
      return R.uniq(R.append(l, layers));
    },
    unset: function layersUnse(l, layers) {
      return R.reject(R.eq(l), layers);
    },
    toggle: function layersToggle(l, layers) {
      if(gameLayersService.isDisplayed(l, layers)) {
        return gameLayersService.unset(l, layers);
      }
      else {
        return gameLayersService.set(l, layers);
      }
    },
  };
  R.curryService(gameLayersService);
  return gameLayersService;
};
