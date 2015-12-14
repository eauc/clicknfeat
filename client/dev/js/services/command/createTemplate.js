'use strict';

angular.module('clickApp.services').factory('createTemplateCommand', ['commands', 'template', 'gameTemplates', 'gameTemplateSelection', function createTemplateCommandServiceFactory(commandsService, templateService, gameTemplatesService, gameTemplateSelectionService) {
  var createTemplateCommandService = {
    execute: function createTemplateExecute(temps, scope, game) {
      return R.pipeP(R.bind(self.Promise.resolve, self.Promise), R.map(function (temp) {
        return templateService.create(temp).catch(R.always(null));
      }), R.bind(self.Promise.all, self.Promise), R.reject(R.isNil), function (templates) {
        if (R.isEmpty(templates)) {
          console.log('Command CreateTemplate : no valid template definition');
          return self.Promise.reject('No valid template definition');
        }
        return templates;
      }, function (templates) {
        var ctxt = {
          templates: R.map(templateService.saveState, templates),
          desc: templates[0].type
        };

        return R.pipe(gameTemplatesService.add$(templates), function (game_templates) {
          game.templates = game_templates;

          return gameTemplateSelectionService.set('local', R.map(R.path(['state', 'stamp']), templates), scope, game.template_selection);
        }, function (selection) {
          game.template_selection = selection;

          scope.gameEvent('createTemplate');
          return ctxt;
        })(game.templates);
      })(temps);
    },
    replay: function createTemplateReplay(ctxt, scope, game) {
      return R.pipeP(R.bind(self.Promise.resolve, self.Promise), R.map(function (temp) {
        return templateService.create(temp).catch(R.always(null));
      }), R.bind(self.Promise.all, self.Promise), R.reject(R.isNil), function (templates) {
        if (R.isEmpty(templates)) {
          console.log('Command CreateTemplate : no valid template definition');
          return self.Promise.reject('No valid template definition');
        }
        return templates;
      }, function (templates) {
        return R.pipe(gameTemplatesService.add$(templates), function (game_templates) {
          game.templates = game_templates;

          return gameTemplateSelectionService.set('remote', R.map(R.path(['state', 'stamp']), templates), scope, game.template_selection);
        }, function (selection) {
          game.template_selection = selection;

          scope.gameEvent('createTemplate');
        })(game.templates);
      })(ctxt.templates);
    },
    undo: function createTemplateUndo(ctxt, scope, game) {
      return R.pipe(R.map(R.prop('stamp')), function (stamps) {
        return R.pipe(gameTemplatesService.removeStamps$(stamps), function (game_templates) {
          game.templates = game_templates;

          return gameTemplateSelectionService.removeFrom('local', stamps, scope, game.template_selection);
        }, function (selection) {
          game.template_selection = selection;

          return gameTemplateSelectionService.removeFrom('remote', stamps, scope, game.template_selection);
        }, function (selection) {
          game.template_selection = selection;

          scope.gameEvent('createTemplate');
        })(game.templates);
      })(ctxt.templates);
    }
  };
  commandsService.registerCommand('createTemplate', createTemplateCommandService);
  return createTemplateCommandService;
}]);
//# sourceMappingURL=createTemplate.js.map