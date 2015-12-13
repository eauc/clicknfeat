'use strict';

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
        execute: function onTemplatesExecute(method /* ...args..., stamps, scope, game */) {
          var args = Array.prototype.slice.call(arguments);
          var game = R.last(args);
          var scope = R.nth(-2, args);
          var stamps = R.nth(-3, args);
          var ctxt = {
            before: [],
            after: [],
            desc: method,
          };

          args = R.append(game.templates, R.slice(0, -2, args));

          return R.pipeP(
            function() {
              return gameTemplatesService.onStamps('saveState', stamps, game.templates);
            },
            function(before) {
              ctxt.before = before;

              return gameTemplatesService.onStamps.apply(null, args);
            },
            function() {
              return gameTemplatesService.onStamps('saveState', stamps, game.templates);
            },
            function(after) {
              ctxt.after = after;

              R.forEach(function(stamp) {
                scope.gameEvent('changeTemplate-'+stamp);
              }, stamps);
              
              return ctxt;
            }
          )();
        },
        replay: function onTemplatesRedo(ctxt, scope, game) {
          return R.pipe(
            R.map(R.prop('stamp')),
            function(stamps) {
              return R.pipeP(
                gameTemplatesService.findAnyStamps$(stamps),
                R.addIndex(R.forEach)(function(template, index) {
                  if(R.isNil(template)) return;
                  
                  templateService.setState(ctxt.after[index], template);
                  scope.gameEvent('changeTemplate-'+templateService.eventName(template));
                }),
                function() {
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
            function(stamps) {
              return R.pipeP(
                gameTemplatesService.findAnyStamps$(stamps),
                R.addIndex(R.forEach)(function(template, index) {
                  templateService.setState(ctxt.before[index],template);
                  scope.gameEvent('changeTemplate-'+templateService.eventName(template));
                }),
                function() {
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
