'use strict';

angular.module('clickApp.services')
  .factory('modelRuler', [
    function modelRulerServiceFactory() {
      return function(/*modelService*/) {
        var modelRulerService = {
          rulerMaxLength: function modelRulerMaxLength(model) {
            return R.path(['state', 'rml'], model);
          },
          setRulerMaxLength: function modelSetRulerMaxLength(value, model) {
            model.state = R.assoc('rml', value, model.state);
          },
        };
        return modelRulerService;
      };
    }
  ]);
