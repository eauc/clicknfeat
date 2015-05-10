'use strict';

self.commandsServiceFactory = function commandsServiceFactory() {
  var CMD_REGS = {};
  var commandsService = {
    registerCommand: function commandsRegister(name, command) {
      console.log('register command', name, command);
      CMD_REGS[name] = command;
    },
    execute: function commandsExecute(name /*, ...args... */) {
      if(R.isNil(CMD_REGS[name])) {
        console.log('execute unknown command '+name);
        return;
      }
      var args = R.tail(Array.prototype.slice.apply(arguments));
      var ctxt = CMD_REGS[name].execute.apply(null, args);
      ctxt.type = name;
      return ctxt;
    },
    undo: function commandsUndo(ctxt, scope, game) {
      if(R.isNil(CMD_REGS[ctxt.type])) {
        console.log('undo unknown command '+ctxt.type);
        return;
      }
      CMD_REGS[ctxt.type].undo(ctxt, scope, game);
    },
    replay: function commandsReplay(ctxt, scope, game) {
      if(R.isNil(CMD_REGS[ctxt.type])) {
        console.log('replay unknown command '+ctxt.type);
        return;
      }
      CMD_REGS[ctxt.type].replay(ctxt, scope, game);
    },
  };
  return commandsService;
};
