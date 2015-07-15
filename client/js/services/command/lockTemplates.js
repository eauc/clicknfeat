'use strict';

self.lockTemplatesCommandServiceFactory =
  function lockTemplatesCommandServiceFactory(commandsService,
                                              gameTemplatesService,
                                              gameTemplateSelectionService) {
    var lockTemplatesCommandService = {
      execute: function lockTemplatesExecute(lock, stamps, scope, game) {
        var ctxt = {
          stamps: stamps,
          desc: lock,
        };

        game.templates = gameTemplatesService.lockStamps(lock, stamps, game.templates);

        scope.gameEvent('createTemplate');

        return ctxt;
      },
      replay: function lockTemplatesReplay(ctxt, scope, game) {
        game.templates = gameTemplatesService.lockStamps(ctxt.desc, ctxt.stamps, game.templates);
        scope.gameEvent('createTemplate');
      },
      undo: function lockTemplatesUndo(ctxt, scope, game) {
        game.templates = gameTemplatesService.lockStamps(!ctxt.desc, ctxt.stamps, game.templates);
        scope.gameEvent('createTemplate');
      }
    };
    commandsService.registerCommand('lockTemplates', lockTemplatesCommandService);
    return lockTemplatesCommandService;
  };
