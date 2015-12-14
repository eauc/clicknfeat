angular.module('clickApp.services')
  .factory('onTemplatesCommand', [
    'commands',
    'template',
    'gameTemplates',
    'gameTemplateSelection',
    function onTemplatesCommandServiceFactory(commandsService,
                                              templateService,
                                              gameTemplatesService,
                                              gameTemplateSelectionService) {
      var onTemplatesCommandService = {
        execute: function onTemplatesExecute(method, ...args /*, stamps, scope, game */) {
          var game = R.last(args);
          var scope = R.nth(-2, args);
          var stamps = R.nth(-3, args);
          var ctxt = {
            before: [],
            after: [],
            desc: method,
          };

          args = R.pipe(
            R.slice(0, -2),
            R.append(game.templates),
            R.prepend(method)
          )(args);

          return R.pipeP(
            () => {
              return gameTemplatesService.onStamps('saveState', stamps, game.templates);
            },
            (before) => {
              ctxt.before = before;

              return gameTemplatesService.onStamps.apply(null, args);
            },
            () => {
              return gameTemplatesService.onStamps('saveState', stamps, game.templates);
            },
            (after) => {
              ctxt.after = after;

              R.forEach((stamp) => {
                scope.gameEvent('changeTemplate-'+stamp);
              }, stamps);
              
              return ctxt;
            }
          )();
        },
        replay: function onTemplatesRedo(ctxt, scope, game) {
          return R.pipe(
            R.map(R.prop('stamp')),
            (stamps) => {
              return R.pipeP(
                gameTemplatesService.findAnyStamps$(stamps),
                R.addIndex(R.forEach)((template, index) => {
                  if(R.isNil(template)) return;
                  
                  templateService.setState(ctxt.after[index], template);
                  scope.gameEvent('changeTemplate-'+templateService.eventName(template));
                }),
                () => {
                  game.template_selection =
                    gameTemplateSelectionService.set('remote', stamps,
                                                     scope, game.template_selection);
                }
              )(game.templates);
            }
          )(ctxt.after);
        },
        undo: function onTemplatesUndo(ctxt, scope, game) {
          return R.pipe(
            R.map(R.prop('stamp')),
            (stamps) => {
              return R.pipeP(
                gameTemplatesService.findAnyStamps$(stamps),
                R.addIndex(R.forEach)((template, index) => {
                  templateService.setState(ctxt.before[index],template);
                  scope.gameEvent('changeTemplate-'+templateService.eventName(template));
                }),
                () => {
                  game.template_selection =
                    gameTemplateSelectionService.set('remote', stamps,
                                                     scope, game.template_selection);
                }
              )(game.templates);
            }
          )(ctxt.before);
        }
      };
      commandsService.registerCommand('onTemplates', onTemplatesCommandService);
      return onTemplatesCommandService;
    }
  ]);
