'use strict';

angular.module('clickApp.services')
  .factory('lockTemplatesCommand', [
    'commands',
    'gameTemplates',
    'gameTemplateSelection',
    function lockTemplatesCommandServiceFactory(commandsService,
                                                gameTemplatesService,
                                                gameTemplateSelectionService) {
      var lockTemplatesCommandService = {
        execute: function lockTemplatesExecute(lock, stamps, scope, game) {
          var ctxt = {
            stamps: stamps,
            desc: lock,
          };

          return R.pipeP(
            gameTemplatesService.lockStamps$(lock, stamps),
            function(game_templates) {
              game.templates = game_templates;

              scope.gameEvent('createTemplate');
              
              return ctxt;
            }
          )(game.templates);
        },
        replay: function lockTemplatesReplay(ctxt, scope, game) {
          return R.pipeP(
            gameTemplatesService.lockStamps$(ctxt.desc, ctxt.stamps),
            function(game_templates) {
              game.templates = game_templates;
              
              scope.gameEvent('createTemplate');
            }
          )(game.templates);
        },
        undo: function lockTemplatesUndo(ctxt, scope, game) {
          return R.pipeP(
            gameTemplatesService.lockStamps$(!ctxt.desc, ctxt.stamps),
            function(game_templates) {
              game.templates = game_templates;
              
              scope.gameEvent('createTemplate');
            }
          )(game.templates);
        }
      };
      commandsService.registerCommand('lockTemplates', lockTemplatesCommandService);
      return lockTemplatesCommandService;
    }
  ]);
