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
      args = R.slice(0, -3, args);
      R.forEach(function(stamp) {
        var template = gameTemplatesService.findStamp(stamp, game.templates);
        if(!templateService.respondTo(method, template)) return;

        ctxt.before.push(templateService.saveState(template));
        templateService.call.apply(null, R.append(template, args));
        ctxt.after.push(templateService.saveState(template));

        scope.gameEvent('changeTemplate-'+templateService.eventName(template));
      }, stamps);
      if(R.isEmpty(ctxt.after)) return;
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
        gameTemplateSelectionService.set('remote', R.last(ctxt.after).stamp,
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
        gameTemplateSelectionService.set('remote', R.last(ctxt.before).stamp,
                                         scope, game.template_selection);
    }
  };
  commandsService.registerCommand('onTemplates', onTemplatesCommandService);
  return onTemplatesCommandService;
};
