'use strict';

angular.module('clickApp.services').factory('deleteTemplatesCommand', ['commands', 'template', 'gameTemplates', 'gameTemplateSelection', function deleteTemplatesCommandServiceFactory(commandsService, templateService, gameTemplatesService, gameTemplateSelectionService) {
  var deleteTemplatesCommandService = {
    execute: function deleteTemplatesExecute(stamps, scope, game) {
      return R.pipeP(gameTemplatesService.findAnyStamps$(stamps), R.reject(R.isNil), R.map(templateService.saveState), function (states) {
        var ctxt = {
          templates: states,
          desc: ''
        };

        return R.pipe(gameTemplatesService.removeStamps$(stamps), function (game_templates) {
          game.templates = game_templates;

          return gameTemplateSelectionService.removeFrom('local', stamps, scope, game.template_selection);
        }, gameTemplateSelectionService.removeFrom$('remote', stamps, scope), function (selection) {
          game.template_selection = selection;

          scope.gameEvent('createTemplate');
          return ctxt;
        })(game.templates);
      })(game.templates);
    },
    replay: function deleteTemplatesReplay(ctxt, scope, game) {
      return R.pipe(R.map(R.prop('stamp')), function (stamps) {
        return R.pipe(gameTemplatesService.removeStamps$(stamps), function (game_templates) {
          game.templates = game_templates;
          return gameTemplateSelectionService.removeFrom('local', stamps, scope, game.template_selection);
        }, gameTemplateSelectionService.removeFrom$('remote', stamps, scope), function (selection) {
          game.template_selection = selection;

          scope.gameEvent('createTemplate');
        })(game.templates);
      })(ctxt.templates);
    },
    undo: function deleteTemplatesUndo(ctxt, scope, game) {
      return R.pipeP(R.bind(self.Promise.resolve, self.Promise), R.map(templateService.create), R.bind(self.Promise.all, self.Promise), R.reject(R.isNil), function (templates) {
        if (R.isEmpty(templates)) {
          console.log('DeleteTemplates: No valid template definition');
          return self.Promise.reject('No valid template definition');
        }

        return R.pipe(gameTemplatesService.add$(templates), function (game_templates) {
          game.templates = game_templates;

          return gameTemplateSelectionService.set('remote', R.map(R.path(['state', 'stamp']), templates), scope, game.template_selection);
        }, function (selection) {
          game.template_selection = selection;

          scope.gameEvent('createTemplate');
        })(game.templates);
      })(ctxt.templates);
    }
  };
  commandsService.registerCommand('deleteTemplates', deleteTemplatesCommandService);
  return deleteTemplatesCommandService;
}]);
//# sourceMappingURL=deleteTemplates.js.map