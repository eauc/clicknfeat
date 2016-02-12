'use strict';

angular.module('clickApp.services').factory('createTemplateCommand', ['commands', 'point', 'template', 'gameTemplates', 'gameTemplateSelection', function createTemplateCommandServiceFactory(commandsService, pointService, templateService, gameTemplatesService, gameTemplateSelectionService) {
  var createTemplateCommandService = {
    execute: function createTemplateExecute(create, is_flipped, state, game) {
      var add$ = pointService.addToWithFlip$(is_flipped);
      return R.pipePromise(R.prop('templates'), R.map(function (temp) {
        return R.pipe(add$(create.base), R.omit(['stamp']), function (temp) {
          return templateService.create(temp).catch(R.always(null));
        })(temp);
      }), R.promiseAll, R.reject(R.isNil), function (templates) {
        if (R.isEmpty(templates)) {
          return self.Promise.reject('No valid template definition');
        }

        var ctxt = {
          templates: R.map(templateService.saveState, templates),
          desc: templates[0].type
        };
        return R.pipe(gameTemplatesService.add$(templates), function (game_templates) {
          game = R.assoc('templates', game_templates, game);

          return gameTemplateSelectionService.set('local', R.map(R.path(['state', 'stamp']), templates), state, game.template_selection);
        }, function (selection) {
          game = R.assoc('template_selection', selection, game);

          state.changeEvent('Game.template.create');

          return [ctxt, game];
        })(game.templates);
      })(create);
    },
    replay: function createTemplateReplay(ctxt, state, game) {
      return R.pipePromise(R.map(function (temp) {
        return templateService.create(temp).catch(R.always(null));
      }), R.promiseAll, R.reject(R.isNil), function (templates) {
        if (R.isEmpty(templates)) {
          return self.Promise.reject('No valid template definition');
        }
        return templates;
      }, function (templates) {
        return R.pipe(gameTemplatesService.add$(templates), function (game_templates) {
          game = R.assoc('templates', game_templates, game);

          return gameTemplateSelectionService.set('remote', R.map(R.path(['state', 'stamp']), templates), state, game.template_selection);
        }, function (selection) {
          game = R.assoc('template_selection', selection, game);

          state.changeEvent('Game.template.create');

          return game;
        })(game.templates);
      })(ctxt.templates);
    },
    undo: function createTemplateUndo(ctxt, state, game) {
      return R.pipe(R.pluck('stamp'), function (stamps) {
        return R.pipe(gameTemplatesService.removeStamps$(stamps), function (game_templates) {
          game = R.assoc('templates', game_templates, game);

          return gameTemplateSelectionService.removeFrom('local', stamps, state, game.template_selection);
        }, function (selection) {
          game = R.assoc('template_selection', selection, game);

          return gameTemplateSelectionService.removeFrom('remote', stamps, state, game.template_selection);
        }, function (selection) {
          game = R.assoc('template_selection', selection, game);

          state.changeEvent('Game.template.create');

          return game;
        })(game.templates);
      })(ctxt.templates);
    }
  };
  commandsService.registerCommand('createTemplate', createTemplateCommandService);
  return createTemplateCommandService;
}]);
//# sourceMappingURL=createTemplate.js.map