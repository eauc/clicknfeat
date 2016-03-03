'use strict';

(function () {
  angular.module('clickApp.services').factory('wallTemplateMode', wallTemplateModeModelFactory);

  wallTemplateModeModelFactory.$inject = ['modes', 'settings', 'templateMode'];
  function wallTemplateModeModelFactory(modesModel, settingsModel, templateModeModel) {
    var template_actions = Object.create(templateModeModel.actions);
    var template_default_bindings = {};
    var template_bindings = R.extend(Object.create(templateModeModel.bindings), template_default_bindings);
    var template_buttons = R.concat([], templateModeModel.buttons);
    var template_mode = {
      onEnter: function onEnter() {},
      onLeave: function onLeave() {},
      name: 'wall' + templateModeModel.name,
      actions: template_actions,
      buttons: template_buttons,
      bindings: template_bindings
    };
    modesModel.registerMode(template_mode);
    return template_mode;
  }
})();
//# sourceMappingURL=wall.js.map
