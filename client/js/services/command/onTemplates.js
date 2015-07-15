'use strict';

self.onTemplatesCommandServiceFactory = function onTemplatesCommandServiceFactory(commandsService,
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

      ctxt.before = gameTemplatesService.onStamps('saveState', stamps, game.templates);
      gameTemplatesService.onStamps.apply(null, args);
      ctxt.after = gameTemplatesService.onStamps('saveState', stamps, game.templates);

      R.forEach(function(stamp) {
        scope.gameEvent('changeTemplate-'+stamp);
      }, stamps);
      return ctxt;
    },
    replay: function onTemplatesRedo(ctxt, scope, game) {
      R.pipe(
        R.map(function(after) {
          return gameTemplatesService.findStamp(R.prop('stamp', after), game.templates);
        }),
        R.forEachIndexed(function(template, index) {
          templateService.setState(ctxt.after[index],template);
          scope.gameEvent('changeTemplate-'+templateService.eventName(template));
        })
      )(ctxt.after);
      game.template_selection =
        gameTemplateSelectionService.set('remote', R.map(R.prop('stamp'), ctxt.after),
                                         scope, game.template_selection);
    },
    undo: function onTemplatesUndo(ctxt, scope, game) {
      R.pipe(
        R.map(function(before) {
          return gameTemplatesService.findStamp(R.prop('stamp', before), game.templates);
        }),
        R.forEachIndexed(function(template, index) {
          templateService.setState(ctxt.before[index],template);
          scope.gameEvent('changeTemplate-'+templateService.eventName(template));
        })
      )(ctxt.before);
      game.template_selection =
        gameTemplateSelectionService.set('remote', R.map(R.prop('stamp'), ctxt.before),
                                         scope, game.template_selection);
    }
  };
  commandsService.registerCommand('onTemplates', onTemplatesCommandService);
  return onTemplatesCommandService;
};
