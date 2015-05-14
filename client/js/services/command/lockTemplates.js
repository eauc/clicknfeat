'use strict';

self.lockTemplatesCommandServiceFactory =
  function lockTemplatesCommandServiceFactory(commandsService,
                                              gameTemplatesService) {
    var lockTemplatesCommandService = {
      execute: function lockTemplatesExecute(stamps, lock, scope, game) {
        var filter = (lock ?
                      gameTemplatesService.isActive :
                      gameTemplatesService.isLocked
                     );
        stamps = R.filter(function(stamp) {
          return filter(stamp, game.templates);
        }, stamps);
        if(R.isEmpty(stamps)) return;
        var ctxt = {
          stamps: stamps,
          desc: lock ? 'lock' : 'unlock',
        };
        var action = (lock ?
                      gameTemplatesService.lockStamps :
                      gameTemplatesService.unlockStamps
                     );
        game.templates = action(stamps, game.templates);
        scope.gameEvent('createTemplate');
        return ctxt;
      },
      replay: function lockTemplatesReplay(ctxt, scope, game) {
        var action = (ctxt.desc === 'lock' ?
                      gameTemplatesService.lockStamps :
                      gameTemplatesService.unlockStamps
                     );
        game.templates = action(ctxt.stamps, game.templates);
        scope.gameEvent('createTemplate');
      },
      undo: function lockTemplatesUndo(ctxt, scope, game) {
        var action = (ctxt.desc === 'lock' ?
                      gameTemplatesService.unlockStamps :
                      gameTemplatesService.lockStamps
                     );
        game.templates = action(ctxt.stamps, game.templates);
        scope.gameEvent('createTemplate');
      }
    };
    commandsService.registerCommand('lockTemplates', lockTemplatesCommandService);
    return lockTemplatesCommandService;
  };
