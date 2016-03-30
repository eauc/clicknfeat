'use strict';

(function () {
  angular.module('clickApp.services').factory('state', stateModelFactory);

  stateModelFactory.$inject = [];
  function stateModelFactory() {
    var STATES = [];
    var stateModel = {
      register: stateRegister,
      create: stateCreate
    };
    R.curryService(stateModel);
    return stateModel;

    function stateRegister(state) {
      STATES = R.append(state, STATES);
    }
    function stateCreate() {
      return R.reduce(function (mem, state) {
        return state.create(mem);
      }, {}, STATES);
    }
  }
})();
//# sourceMappingURL=state.js.map
