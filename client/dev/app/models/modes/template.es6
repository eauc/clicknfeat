(function() {
  angular.module('clickApp.services')
    .factory('templateMode', templateModeModelFactory);

  templateModeModelFactory.$inject = [
    'elementMode',
    'modes',
    'settings',
    'template',
    'gameTemplates',
    'gameTemplateSelection',
  ];
  function templateModeModelFactory(elementModeModel,
                                    modesModel,
                                    settingsModel,
                                    templateModel,
                                    gameTemplatesModel,
                                    gameTemplateSelectionModel) {
    const template_mode = elementModeModel('template',
                                           templateModel,
                                           gameTemplatesModel,
                                           gameTemplateSelectionModel);
    modesModel.registerMode(template_mode);
    settingsModel.register('Bindings',
                           template_mode.name,
                           template_mode.bindings,
                           (bs) => {
                             R.extend(template_mode.bindings, bs);
                           });
    return template_mode;
  }
})();
