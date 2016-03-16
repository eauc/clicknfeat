(function() {
  angular.module('clickApp.services')
    .factory('wallTemplateMode', wallTemplateModeModelFactory);

  wallTemplateModeModelFactory.$inject = [
    'modes',
    'templateMode',
  ];
  function wallTemplateModeModelFactory(modesModel,
                                        templateModeModel) {
    const template_actions = Object.create(templateModeModel.actions);
    const template_default_bindings = { };
    const template_bindings = R.extend(Object.create(templateModeModel.bindings),
                                     template_default_bindings);
    const template_buttons = R.concat([ ], templateModeModel.buttons);
    const template_mode = {
      onEnter: () => { },
      onLeave: () => { },
      name: 'wall'+templateModeModel.name,
      actions: template_actions,
      buttons: template_buttons,
      bindings: template_bindings
    };
    modesModel.registerMode(template_mode);
    return template_mode;
  }
})();
