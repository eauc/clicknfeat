(function() {
  angular.module('clickApp.services')
    .factory('state', stateModelFactory);

  stateModelFactory.$inject = [];
  function stateModelFactory() {
    let STATES = [];
    const stateModel = {
      register: stateRegister,
      create: stateCreate
    };
    R.curryService(stateModel);
    return stateModel;

    function stateRegister(state) {
      STATES = R.append(state, STATES);
    }
    function stateCreate() {
      return R.reduce((mem, state) => state.create(mem),
                      {}, STATES);
    }
  }
})();
