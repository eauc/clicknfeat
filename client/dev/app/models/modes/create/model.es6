(function() {
  angular.module('clickApp.services')
    .factory('createModelMode', createModelModeModelFactory);

  createModelModeModelFactory.$inject = [
    'createElementMode',
    'modes',
    'settings',
  ];
  function createModelModeModelFactory(createElementModeModel,
                                       modesModel,
                                       settingsModel) {
    const createModel_mode =
            createElementModeModel('model');

    modesModel.registerMode(createModel_mode);
    settingsModel.register('Bindings',
                           createModel_mode.name,
                           createModel_mode.bindings,
                           (bs) => {
                             R.extend(createModel_mode.bindings, bs);
                           });
    return createModel_mode;
  }
})();
