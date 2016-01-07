angular.module('clickApp.services')
  .factory('aoeTemplateMode', [
    'modes',
    'settings',
    'templateMode',
    'game',
    'gameTemplates',
    'gameTemplateSelection',
    'gameRuler',
    'prompt',
    function aoeTemplateModeServiceFactory(modesService,
                                           settingsService,
                                           templateModeService,
                                           gameService,
                                           gameTemplatesService,
                                           gameTemplateSelectionService,
                                           gameRulerService,
                                           promptService) {
      var template_actions = Object.create(templateModeService.actions);
      template_actions.aoeSize3 = (state) => {
        var stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return state.event('Game.command.execute',
                           'onTemplates', ['setSize', [3], stamps]);
      };
      template_actions.aoeSize4 = (state) => {
        var stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return state.event('Game.command.execute',
                           'onTemplates', ['setSize', [4], stamps]);
      };
      template_actions.aoeSize5 = (state) => {
        var stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return state.event('Game.command.execute',
                           'onTemplates', ['setSize', [5], stamps]);
      };
      template_actions.setTargetModel = (state, event) => {
        var stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return state.event('Game.command.execute',
                           'onTemplates',
                           ['setTarget', [state.factions, null, event['click#'].target],
                            stamps
                           ]);
      };
      template_actions.setMaxDeviation = (state) => {
        var stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return R.pipeP(
          gameTemplatesService.fromStamps$('maxDeviation', [], stamps),
          (maxes) => {
            var max = maxes[0];
            return promptService
              .prompt('prompt', 'Set AoE max deviation :', max)
              .catch((error) => {
                console.log(error);
                return null;
              });
          },
          (value) => {
            value = (value === 0) ? null : value;
            return state.event('Game.update', R.lensProp('templates'),
                               gameTemplatesService.onStamps$('setMaxDeviation', [value], stamps));
          }
        )(state.game.templates);
      };
      template_actions.deviate = (state) => {
        var stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return R.pipePromise(
          function() {
            return state.event('Game.command.execute',
                               'rollDeviation', []);
          },
          R.always(state),
          R.path(['game','dice']),
          R.last,
          function(deviation) {
            return state.event('Game.command.execute',
                               'onTemplates', [ 'deviate', [deviation.r, deviation.d],
                                                stamps
                                              ]);
          }
        )();
      };
      template_actions.setToRulerTarget = (state) => {
        if(!gameRulerService.isDisplayed(state.game.ruler)) return null;
        
        var stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return R.pipeP(
          gameRulerService.targetAoEPosition$(state.game.models),
          (position) => {
            return state.event('Game.command.execute',
                               'onTemplates', [ 'setToRuler', [position],
                                                stamps
                                              ]);
          }
        )(state.game.ruler);
      };

      var template_default_bindings = {
        setTargetModel: 'shift+clickModel',
        aoeSize3: '3',
        aoeSize4: '4',
        aoeSize5: '5',
        deviate: 'd',
        setMaxDeviation: 'shift+d',
        setToRulerTarget: 'shift+r'
      };
      var template_bindings = R.extend(Object.create(templateModeService.bindings),
                                       template_default_bindings);
      var template_buttons = R.concat([
        [ 'Size', 'toggle', 'size' ],
        [ 'Aoe3', 'aoeSize3', 'size' ],
        [ 'Aoe4', 'aoeSize4', 'size' ],
        [ 'Aoe5', 'aoeSize5', 'size' ],
        [ 'Deviate', 'deviate' ],
        [ 'Set to Ruler', 'setToRulerTarget' ],
      ], templateModeService.buttons);

      var template_mode = {
        onEnter: (/*state*/) => {},
        onLeave: (/*state*/) => {},
        name: 'aoe'+templateModeService.name,
        actions: template_actions,
        buttons: template_buttons,
        bindings: template_bindings
      };
      modesService.registerMode(template_mode);
      settingsService.register('Bindings',
                               template_mode.name,
                               template_default_bindings,
                               (bs) => {
                                 R.extend(template_mode.bindings, bs);
                               });
      return template_mode;
    }
  ]);
