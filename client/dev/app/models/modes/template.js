'use strict';

(function () {
  angular.module('clickApp.services').factory('templateMode', templateModeModelFactory);

  templateModeModelFactory.$inject = ['elementMode', 'modes', 'settings', 'template', 'gameTemplates', 'gameTemplateSelection'];
  function templateModeModelFactory(elementModeModel, modesModel, settingsModel, templateModel, gameTemplatesModel, gameTemplateSelectionModel) {
    var template_mode = elementModeModel('template', templateModel, gameTemplatesModel, gameTemplateSelectionModel);
    template_mode.actions.openEditLabel = templateOpenEditLabel;
    template_mode.bindings.openEditLabel = 'shift+l';

    modesModel.registerMode(template_mode);
    settingsModel.register('Bindings', template_mode.name, template_mode.bindings, function (bs) {
      R.extend(template_mode.bindings, bs);
    });
    return template_mode;

    function templateOpenEditLabel(state) {
      var stamps = gameTemplateSelectionModel.get('local', state.game.template_selection);
      return R.threadP(state.game)(R.prop('templates'), gameTemplatesModel.findStampP$(stamps[0]), function (template) {
        state.queueChangeEventP('Game.editLabel.open', 'onTemplates', template);
      });
    }
  }
})();
//# sourceMappingURL=template.js.map
