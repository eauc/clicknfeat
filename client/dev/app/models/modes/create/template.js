'use strict';

(function () {
  angular.module('clickApp.services').factory('createTemplateMode', createTemplateModeModelFactory);

  createTemplateModeModelFactory.$inject = ['createElementMode', 'modes', 'settings'];
  function createTemplateModeModelFactory(createElementModeModel, modesModel, settingsModel) {
    var createTemplate_mode = createElementModeModel('template');

    modesModel.registerMode(createTemplate_mode);
    settingsModel.register('Bindings', createTemplate_mode.name, createTemplate_mode.bindings, function (bs) {
      R.extend(createTemplate_mode.bindings, bs);
    });
    return createTemplate_mode;
  }
})();
//# sourceMappingURL=template.js.map
