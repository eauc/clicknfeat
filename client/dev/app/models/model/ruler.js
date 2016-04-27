'use strict';

(function () {
  angular.module('clickApp.services').factory('modelRuler', modelRulerServiceFactory);

  modelRulerServiceFactory.$inject = [];
  function modelRulerServiceFactory() {
    var RULER_MAX_LENGTH_LENS = R.lensPath(['state', 'rml']);
    return function () {
      var modelRulerService = {
        rulerMaxLength: modelRulerMaxLength,
        setRulerMaxLength: modelSetRulerMaxLength
      };
      return modelRulerService;

      function modelRulerMaxLength(model) {
        return R.view(RULER_MAX_LENGTH_LENS, model);
      }
      function modelSetRulerMaxLength(value, model) {
        return R.set(RULER_MAX_LENGTH_LENS, value, model);
      }
    };
  }
})();
//# sourceMappingURL=ruler.js.map
