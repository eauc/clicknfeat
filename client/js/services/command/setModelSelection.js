'use strict';

self.setModelSelectionCommandServiceFactory =
  function setModelSelectionCommandServiceFactory(commandsService,
                                                  gameModelSelectionService) {
    var setModelSelectionCommandService = {
      execute: function setModelSelectionExecute(method, stamps, scope, game) {
        if('Function' !== R.type(gameModelSelectionService[method])) {
          console.log('setModelSelection unknown method', method, stamps);
          return;
        }
        game.model_selection =
          gameModelSelectionService[method]('local', stamps,
                                            scope, game.model_selection);
        var ctxt = {
          after: R.clone(gameModelSelectionService.get('local', game.model_selection)),
          desc: '',
          do_not_log: true,
        };
        return ctxt;
      },
      replay: function setModelSelectionReplay(ctxt, scope, game) {
        game.model_selection =
          gameModelSelectionService.set('remote', ctxt.after,
                                        scope, game.model_selection);
      },
      undo: function setModelSelectionUndo(ctxt, scope, game) {
        console.log('!!! ERROR : WE SHOULD NOT BE HERE !!!');
      }
    };
    commandsService.registerCommand('setModelSelection', setModelSelectionCommandService);
    return setModelSelectionCommandService;
  };
