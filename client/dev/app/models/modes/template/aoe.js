'use strict';

(function () {
  angular.module('clickApp.services').factory('aoeTemplateMode', aoeTemplateModeModelFactory);

  aoeTemplateModeModelFactory.$inject = ['appAction', 'appError', 'appState', 'modes', 'settings', 'templateMode', 'gameTemplates', 'gameTemplateSelection',
  // 'gameRuler',
  'prompt'];
  function aoeTemplateModeModelFactory(appActionService, appErrorService, appStateService, modesModel, settingsModel, templateModeModel, gameTemplatesModel, gameTemplateSelectionModel,
  // gameRulerModel,
  promptService) {
    var template_actions = Object.create(templateModeModel.actions);
    template_actions.aoeSize3 = aoeSize3;
    template_actions.aoeSize4 = aoeSize4;
    template_actions.aoeSize5 = aoeSize5;
    template_actions.setTargetModel = setTargetModel;
    template_actions.setMaxDeviation = setMaxDeviation;
    template_actions.deviate = deviate;
    template_actions.setToRulerTarget = setToRulerTarget;

    var template_default_bindings = {
      setTargetModel: 'shift+clickModel',
      aoeSize3: '3',
      aoeSize4: '4',
      aoeSize5: '5',
      deviate: 'd',
      setMaxDeviation: 'shift+d',
      setToRulerTarget: 'shift+r'
    };
    var template_bindings = R.extend(Object.create(templateModeModel.bindings), template_default_bindings);
    var template_buttons = R.concat([['Size', 'toggle', 'size'], ['Aoe3', 'aoeSize3', 'size'], ['Aoe4', 'aoeSize4', 'size'], ['Aoe5', 'aoeSize5', 'size'], ['Deviate', 'deviate'], ['Set Max Dev.', 'setMaxDeviation'], ['Set to Ruler', 'setToRulerTarget']], templateModeModel.buttons);

    var template_mode = {
      onEnter: function onEnter() {},
      onLeave: function onLeave() {},
      name: 'aoe' + templateModeModel.name,
      actions: template_actions,
      buttons: template_buttons,
      bindings: template_bindings
    };
    modesModel.registerMode(template_mode);
    settingsModel.register('Bindings', template_mode.name, template_default_bindings, function (bs) {
      R.extend(template_mode.bindings, bs);
    });
    return template_mode;

    function aoeSize3(state) {
      var stamps = gameTemplateSelectionModel.get('local', state.game.template_selection);
      return appStateService.onAction(state, ['Game.command.execute', 'onTemplates', ['setSizeP', [3], stamps]]);
    }
    function aoeSize4(state) {
      var stamps = gameTemplateSelectionModel.get('local', state.game.template_selection);
      return appStateService.onAction(state, ['Game.command.execute', 'onTemplates', ['setSizeP', [4], stamps]]);
    }
    function aoeSize5(state) {
      var stamps = gameTemplateSelectionModel.get('local', state.game.template_selection);
      return appStateService.onAction(state, ['Game.command.execute', 'onTemplates', ['setSizeP', [5], stamps]]);
    }
    function setTargetModel(state, event) {
      var stamps = gameTemplateSelectionModel.get('local', state.game.template_selection);
      return appStateService.onAction(state, ['Game.command.execute', 'onTemplates', ['setTargetP', [state.factions, null, event['click#'].target], stamps]]);
    }
    function setMaxDeviation(state) {
      var stamps = gameTemplateSelectionModel.get('local', state.game.template_selection);
      return R.threadP(state.game)(R.prop('templates'), gameTemplatesModel.fromStampsP$('maxDeviation', [], stamps), askForMaxP, function (value) {
        return value === 0 ? null : value;
      }, R.defaultTo(null), function (max) {
        return appActionService.do('Game.templates.setDeviationMax', stamps, max);
      });

      function askForMaxP(maxes) {
        var max = maxes[0];
        return promptService.promptP('prompt', 'Set AoE max deviation :', max).catch(appErrorService.emit);
      }
    }
    function deviate(state) {
      var stamps = gameTemplateSelectionModel.get('local', state.game.template_selection);
      return appStateService.onAction(state, ['Game.command.execute', 'rollDeviation', [stamps]]);
    }
    function setToRulerTarget(_state_) {
      // if(!gameRulerModel.isDisplayed(state.game.ruler)) return;

      // const stamps = gameTemplateSelectionModel
      //       .get('local', state.game.template_selection);
      // R.thread(state.game)(
      //   R.prop('ruler'),
      //   gameRulerModel.targetAoEPosition$(state.game.models),
      //   (position) => {
      // return appStateService.onAction(state, [ 'Game.command.execute',
      //                    'onTemplates',
      //                    [ 'setToRulerP',
      //                      [position],
      //                      stamps
      //                    ]);
      //   }
      // );
    }
  }
})();
//# sourceMappingURL=aoe.js.map
