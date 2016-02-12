angular.module('clickApp.services')
  .factory('onTemplatesCommand', [
    'commands',
    'template',
    'gameTemplates',
    'gameTemplateSelection',
    function onTemplatesCommandServiceFactory(commandsService,
                                              templateService,
                                              gameTemplatesService,
                                              gameTemplateSelectionService) {
      var onTemplatesCommandService = {
        execute: function onTemplatesExecute(method, args, stamps, state, game) {
          var ctxt = {
            before: [],
            after: [],
            desc: method
          };

          return R.pipePromise(
            gameTemplatesService.fromStamps$('saveState', [], stamps),
            (before) => {
              ctxt.before = before;

              return gameTemplatesService
                .onStamps(method, args, stamps, game.templates);
            },
            (templates) => {
              game = R.assoc('templates', templates, game);
              
              return gameTemplatesService
                .fromStamps('saveState', [], stamps, game.templates);
            },
            (after) => {
              ctxt.after = after;

              R.forEach((stamp) => {
                state.changeEvent(`Game.template.change.${stamp}`);
              }, stamps);
              
              return [ctxt, game];
            }
          )(game.templates);
        },
        replay: function onTemplatesRedo(ctxt, state, game) {
          let stamps = R.pluck('stamp', ctxt.after);
          return R.pipePromise(
            gameTemplatesService.setStateStamps$(ctxt.after, stamps),
            (templates) => {
              game = R.assoc('templates', templates, game);
              
              return gameTemplateSelectionService
                .set('remote', stamps, state, game.template_selection);
            },
            (selection) => {
              game = R.assoc('template_selection', selection, game);

              R.forEach((stamp) => {
                state.changeEvent(`Game.template.change.${stamp}`);
              }, stamps);
              
              return game;
            }
          )(game.templates);
        },
        undo: function onTemplatesUndo(ctxt, state, game) {
          let stamps = R.pluck('stamp', ctxt.before);
          return R.pipePromise(
            gameTemplatesService.setStateStamps$(ctxt.before, stamps),
            (templates) => {
              game = R.assoc('templates', templates, game);
              
              return gameTemplateSelectionService
                .set('remote', stamps, state, game.template_selection);
            },
            (selection) => {
              game = R.assoc('template_selection', selection, game);

              R.forEach((stamp) => {
                state.changeEvent(`Game.template.change.${stamp}`);
              }, stamps);
              
              return game;
            }
          )(game.templates);
        }
      };
      commandsService.registerCommand('onTemplates', onTemplatesCommandService);
      return onTemplatesCommandService;
    }
  ]);
