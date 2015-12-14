'use strict';

angular.module('clickApp.services').factory('wallTemplateMode', ['modes', 'settings', 'templateMode', function wallTemplateModeServiceFactory(modesService, settingsService, templateModeService) {
  var template_actions = Object.create(templateModeService.actions);
  var template_default_bindings = {};
  var template_bindings = R.extend(Object.create(templateModeService.bindings), template_default_bindings);
  var template_buttons = R.concat([], templateModeService.buttons);
  var template_mode = {
    onEnter: function templateOnEnter() /*scope*/{},
    onLeave: function templateOnLeave() /*scope*/{},
    name: 'wall' + templateModeService.name,
    actions: template_actions,
    buttons: template_buttons,
    bindings: template_bindings
  };
  modesService.registerMode(template_mode);
  // settingsService.register('Bindings',
  //                          template_mode.name,
  //                          template_default_bindings,
  //                          function(bs) {
  //                            R.extend(template_mode.bindings, bs);
  //                          });
  return template_mode;
}]);
//# sourceMappingURL=wallTemplate.js.map