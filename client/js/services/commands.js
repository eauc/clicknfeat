'use strict';

angular.module('clickApp.services')
  .factory('commands', [
    function commandsServiceFactory() {
      var CMD_REGS = {};
      var commandsService = {
        registerCommand: function commandsRegister(name, command) {
          console.log('register command', name, command);
          CMD_REGS[name] = command;
        },
        execute: function commandsExecute(name /*, ...args... */) {
          return R.pipeP(
            R.bind(self.Promise.resolve, self.Promise),
            function(args) {
              if(R.isNil(CMD_REGS[name])) {
                console.log('execute unknown command '+name);
                return self.Promise.reject('execute unknown command '+name);
              }
              return CMD_REGS[name].execute.apply(null, args);
            },
            function(ctxt) {
              ctxt.type = name;
              return ctxt;
            }
          )(R.tail(arguments));
        },
        undo: function commandsUndo(ctxt, scope, game) {
          return R.pipeP(
            R.bind(self.Promise.resolve, self.Promise),
            function() {
              if(R.isNil(CMD_REGS[ctxt.type])) {
                console.log('undo unknown command '+ctxt.type);
                return self.Promise.reject('undo unknown command '+ctxt.type);
              }
              return CMD_REGS[ctxt.type].undo(ctxt, scope, game);
            }
          )();
        },
        replay: function commandsReplay(ctxt, scope, game) {
          return R.pipeP(
            R.bind(self.Promise.resolve, self.Promise),
            function() {
              if(R.isNil(CMD_REGS[ctxt.type])) {
                console.log('replay unknown command '+ctxt.type);
                return self.Promise.reject('replay unknown command '+ctxt.type);
              }
              return CMD_REGS[ctxt.type].replay(ctxt, scope, game);
            }
          )();
        },
      };
      R.curryService(commandsService);
      return commandsService;
    }
  ])
  .factory('allCommands', [
    'createModelCommand',
    'deleteModelCommand',
    'setModelSelectionCommand',
    'lockModelsCommand',
    // 'onModelsCommand',
    'createTemplateCommand',
    'deleteTemplatesCommand',
    'lockTemplatesCommand',
    'onTemplatesCommand',
    'rollDiceCommand',
    'rollDeviationCommand',
    'setBoardCommand',
    'setLayersCommand',
    'setRulerCommand',
    'setScenarioCommand',
    function() { return {}; }
  ]);
