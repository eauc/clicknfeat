'use strict';

self.createTemplateCommandServiceFactory =
  function createTemplateCommandServiceFactory(commandsService,
                                               templateService,
                                               gameTemplatesService,
                                               gameTemplateSelectionService) {
    var createTemplateCommandService = {
      execute: function createTemplateExecute(temp, scope, game) {
        var template = templateService.create(temp);
        if(R.isNil(template)) return;

        var ctxt = {
          template: templateService.saveState(template),
          desc: temp.type,
        };
        game.templates = gameTemplatesService.add(template, game.templates);
        gameTemplateSelectionService.setLocal(template.state.stamp,
                                              scope,
                                              game.template_selection);
        scope.gameEvent('createTemplate');
        return ctxt;
      },
      replay: function createTemplateReplay(ctxt, scope, game) {
        var template = templateService.create(ctxt.template);
        if(R.isNil(template)) return;

        game.templates = gameTemplatesService.add(template, game.templates);
        scope.gameEvent('createTemplate');
      },
      undo: function createTemplateUndo(ctxt, scope, game) {
        game.templates = gameTemplatesService.removeStamp(ctxt.template.stamp, game.templates);
        gameTemplateSelectionService.removeFromLocal(ctxt.template.stamp,
                                                     scope,
                                                     game.template_selection);
        scope.gameEvent('createTemplate');
      }
    };
    commandsService.registerCommand('createTemplate', createTemplateCommandService);
    return createTemplateCommandService;
  };
