'use strict';

self.deleteTemplatesCommandServiceFactory =
  function deleteTemplatesCommandServiceFactory(commandsService,
                                                templateService,
                                                gameTemplatesService,
                                                gameTemplateSelectionService) {
    var deleteTemplatesCommandService = {
      execute: function deleteTemplatesExecute(stamps, scope, game) {
        var states = R.pipe(
          R.map(function(stamp) {
            return gameTemplatesService.findStamp(stamp, game.templates);
          }),
          R.reject(R.isNil),
          R.map(templateService.saveState)
        )(stamps);

        var ctxt = {
          templates: states,
          desc: '',
        };

        game.templates = gameTemplatesService.removeStamps(stamps, game.templates);
        game.template_selection =
          gameTemplateSelectionService.removeFrom('local', stamps,
                                                  scope, game.template_selection);
        game.template_selection =
          gameTemplateSelectionService.removeFrom('remote', stamps,
                                                  scope, game.template_selection);

        scope.gameEvent('createTemplate');
        return ctxt;
      },
      replay: function deleteTemplatesReplay(ctxt, scope, game) {
        var stamps = R.map(R.prop('stamp'), ctxt.templates);
        game.templates = gameTemplatesService.removeStamps(stamps, game.templates);
        game.template_selection =
          gameTemplateSelectionService.removeFrom('local', stamps,
                                                  scope, game.template_selection);
        game.template_selection =
          gameTemplateSelectionService.removeFrom('remote', stamps,
                                                  scope, game.template_selection);
        scope.gameEvent('createTemplate');
      },
      undo: function deleteTemplatesUndo(ctxt, scope, game) {
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
      }
    };
    commandsService.registerCommand('deleteTemplates', deleteTemplatesCommandService);
    return deleteTemplatesCommandService;
  };
