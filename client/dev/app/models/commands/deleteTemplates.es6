angular.module('clickApp.services')
  .factory('deleteTemplatesCommand', [
    'commands',
    'template',
    'gameTemplates',
    'gameTemplateSelection',
    function deleteTemplatesCommandServiceFactory(commandsService,
                                                  templateService,
                                                  gameTemplatesService,
                                                  gameTemplateSelectionService) {
      var deleteTemplatesCommandService = {
        execute: function deleteTemplatesExecute(stamps, state, game) {
          return R.pipeP(
            gameTemplatesService.findAnyStamps$(stamps),
            R.reject(R.isNil),
            R.map(templateService.saveState),
            (states) => {
              var ctxt = {
                templates: states,
                desc: ''
              };

              return R.pipe(
                gameTemplatesService.removeStamps$(stamps),
                (game_templates) => {
                  game = R.assoc('templates', game_templates, game);
                  
                  return gameTemplateSelectionService
                    .removeFrom('local', stamps, state, game.template_selection);
                },
                gameTemplateSelectionService
                  .removeFrom$('remote', stamps, state),
                (selection) => {
                  game = R.assoc('template_selection', selection, game);

                  state.changeEvent('Game.template.create');

                  return [ctxt, game];
                }
              )(game.templates);
            }
          )(game.templates);
        },
        replay: function deleteTemplatesReplay(ctxt, state, game) {
          return R.pipe(
            R.pluck('stamp'),
            (stamps) => {
              return R.pipe(
                gameTemplatesService.removeStamps$(stamps),
                (game_templates) => {
                  game = R.assoc('templates', game_templates, game);
                  
                  return gameTemplateSelectionService
                    .removeFrom('local', stamps, state, game.template_selection);
                },
                gameTemplateSelectionService
                  .removeFrom$('remote', stamps, state),
                (selection) => {
                  game = R.assoc('template_selection', selection, game);
                  
                  state.changeEvent('Game.template.create');

                  return game;
                }
              )(game.templates);
            }
          )(ctxt.templates);
        },
        undo: function deleteTemplatesUndo(ctxt, state, game) {
          return R.pipePromise(
            R.map(templateService.create),
            R.promiseAll,
            R.reject(R.isNil),
            (templates) => {
              if(R.isEmpty(templates)) {
                return self.Promise.reject('No valid template definition');
              }

              return R.pipe(
                gameTemplatesService.add$(templates),
                (game_templates) => {
                  game = R.assoc('templates', game_templates, game);
          
                  return gameTemplateSelectionService
                    .set('remote', R.map(R.path(['state','stamp']), templates),
                         state, game.template_selection);
                },
                (selection) => {
                  game = R.assoc('template_selection', selection, game);

                  state.changeEvent('Game.template.create');

                  return game;
                }
              )(game.templates);
            }
          )(ctxt.templates);
        }
      };
      commandsService.registerCommand('deleteTemplates', deleteTemplatesCommandService);
      return deleteTemplatesCommandService;
    }
  ]);
