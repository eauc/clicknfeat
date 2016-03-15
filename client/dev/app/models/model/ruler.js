'use strict';

(function () {
  angular.module('clickApp.services').factory('modelRuler', modelRulerServiceFactory);

  modelRulerServiceFactory.$inject = [];
  function modelRulerServiceFactory() {
    return function () {
      var modelRulerService = {
        rulerMaxLength: modelRulerMaxLength,
        setRulerMaxLength: modelSetRulerMaxLength
      };
      return modelRulerService;

      function modelRulerMaxLength(model) {
        return R.path(['state', 'rml'], model);
      }
      function modelSetRulerMaxLength(value, model) {
        return R.assocPath(['state', 'rml'], value, model);
      }
    };
  }
})();
//# sourceMappingURL=ruler.js.map
