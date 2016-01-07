angular.module('clickApp.services')
  .factory('sprayTemplateMode', [
    'modes',
    'settings',
    'templateMode',
    'sprayTemplate',
    'game',
    'gameTemplates',
    'gameTemplateSelection',
    'gameModels',
    function sprayTemplateModeServiceFactory(modesService,
                                             settingsService,
                                             templateModeService,
                                             sprayTemplateService,
                                             gameService,
                                             gameTemplatesService,
                                             gameTemplateSelectionService,
                                             gameModelsService) {
      let template_actions = Object.create(templateModeService.actions);
      template_actions.spraySize6 = (state) => {
        let stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return state.event('Game.command.execute',
                           'onTemplates', ['setSize', [6], stamps]);
      };
      template_actions.spraySize8 = (state) => {
        let stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return state.event('Game.command.execute',
                           'onTemplates', ['setSize', [8], stamps]);
      };
      template_actions.spraySize10 = (state) => {
        let stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return state.event('Game.command.execute',
                           'onTemplates', ['setSize', [10], stamps]);
      };
      template_actions.setOriginModel = (state, event) => {
        let stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return state.event('Game.command.execute',
                           'onTemplates', [ 'setOrigin',
                                            [state.factions, event['click#'].target],
                                            stamps
                                          ]);
      };
      template_actions.setTargetModel = (state, event) => {
        let stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return R.pipeP(
          gameTemplatesService.findStamp$(stamps[0]),
          sprayTemplateService.origin,
          (origin) => {
            if(R.isNil(origin)) return null;

            return gameModelsService
              .findStamp(origin, state.game.models);
          },
          (origin_model) => {
            if(R.isNil(origin_model)) return null;
          
            return state.event('Game.command.execute',
                               'onTemplates', [ 'setTarget',
                                                [state.factions, origin_model, event['click#'].target],
                                                stamps
                                              ]);
          }
        )(state.game.templates);
      };
      let moves = [
        ['rotateLeft', 'left'],
        ['rotateRight', 'right'],
      ];
      let buildTemplateMove$ = R.curry((move, small, state) => {
        let stamps = gameTemplateSelectionService
              .get('local', state.game.template_selection);
        return R.pipeP(
          function() {
            return gameTemplatesService
              .findStamp(stamps[0], state.game.templates);
          },
          sprayTemplateService.origin,
          (origin) => {
            if(R.isNil(origin)) return null;
              
            return gameModelsService
              .findStamp(origin, state.game.models);
          },
          (origin_model) => {
            return state.event('Game.command.execute',
                               'onTemplates', [ move,
                                                [state.factions, origin_model, small],
                                                stamps
                                              ]);
          }
        )();
      });
      R.forEach(([move]) => {
        template_actions[move] = buildTemplateMove$(move, false);
        template_actions[move+'Small'] = buildTemplateMove$(move, true);
      }, moves);
      let template_default_bindings = {
        setOriginModel: 'ctrl+clickModel',
        setTargetModel: 'shift+clickModel',
        spraySize6: '6',
        spraySize8: '8',
        spraySize10: '0'
      };
      let template_bindings = R.extend(Object.create(templateModeService.bindings),
                                       template_default_bindings);

      let template_buttons = R.concat([
        [ 'Size', 'toggle', 'size' ],
        [ 'Spray6', 'spraySize6', 'size' ],
        [ 'Spray8', 'spraySize8', 'size' ],
        [ 'Spray10', 'spraySize10', 'size' ],
      ], templateModeService.buttons);

      let template_mode = {
        onEnter: () => { },
        onLeave: () => { },
        name: 'spray'+templateModeService.name,
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
