'use strict';

self.createTemplateCommandServiceFactory =
  function createTemplateCommandServiceFactory(commandsService,
                                               templateService,
                                               gameTemplatesService,
                                               gameTemplateSelectionService) {
    var createTemplateCommandService = {
      execute: function createTemplateExecute(temps, scope, game) {
        var templates = R.pipe(
          R.map(templateService.create),
          R.reject(R.isNil)
        )(temps);
        if(R.isEmpty(templates)) return;

        var ctxt = {
          templates: R.map(templateService.saveState, templates),
          desc: temps[0].type,
        };

        game.templates = gameTemplatesService.add(templates, game.templates);
        game.templates_selection =
          gameTemplateSelectionService.set('local', R.map(R.path(['state','stamp']), templates),
                                           scope, game.template_selection);

        scope.gameEvent('createTemplate');

        return ctxt;
      },
      replay: function createTemplateReplay(ctxt, scope, game) {
        var templates = R.pipe(
          R.map(templateService.create),
          R.reject(R.isNil)
        )(ctxt.templates);
        if(R.isEmpty(templates)) return;

        game.templates = gameTemplatesService.add(templates, game.templates);
        game.template_selection =
          gameTemplateSelectionService.set('remote', R.map(R.path(['state','stamp']), templates),
                                           scope, game.template_selection);

        scope.gameEvent('createTemplate');
      },
      undo: function createTemplateUndo(ctxt, scope, game) {
        var stamps = R.map(R.prop('stamp'), ctxt.templates);

        game.templates = gameTemplatesService.removeStamps(stamps, game.templates);
        game.template_selection =
          gameTemplateSelectionService.removeFrom('local', stamps,
                                               scope, game.template_selection);
        game.template_selection =
          gameTemplateSelectionService.removeFrom('remote', stamps,
                                                  scope, game.template_selection);
        
        scope.gameEvent('createTemplate');
      }
    };
    commandsService.registerCommand('createTemplate', createTemplateCommandService);
    return createTemplateCommandService;
  };
