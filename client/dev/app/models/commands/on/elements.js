'use strict';

(function () {
  angular.module('clickApp.services').factory('onElementsCommand', onElementsCommandModelFactory);

  onElementsCommandModelFactory.$inject = [];
  function onElementsCommandModelFactory() {
    return function buildOnElementsCommandModel(type, elementModel, gameElementsModel, gameElementSelectionModel) {
      var options = arguments.length <= 4 || arguments[4] === undefined ? {} : arguments[4];
      var _options$checkIfModel = options.checkIfModelRespondToMethod;
      var checkIfModelRespondToMethod = _options$checkIfModel === undefined ? true : _options$checkIfModel;

      var onElementsCommandModel = {
        executeP: onElementsExecuteP,
        replayP: onElementsReplayP,
        undoP: onElementsUndoP
      };

      var applyMethodOnGameElementsP$ = R.curry(applyMethodOnGameElementsP);
      var setStates$ = R.curry(setStates);
      var saveStatesP$ = R.curry(saveStatesP);
      var setRemoteSelection$ = R.curry(setRemoteSelection);
      var emitChangeEvents$ = R.curry(emitChangeEvents);

      return onElementsCommandModel;

      function onElementsExecuteP(method, args, stamps, state, game) {
        return R.threadP(elementModel)(checkMethod, function () {
          var ctxt = {
            before: [],
            after: [],
            desc: method
          };

          return R.threadP(game)(saveStatesP$(ctxt, 'before', stamps), applyMethodOnGameElementsP$(method, args, stamps), saveStatesP$(ctxt, 'after', stamps), emitChangeEvents$(stamps, state), function (game) {
            return [ctxt, game];
          });
        });

        function checkMethod() {
          return checkIfModelRespondToMethod ? R.threadP(elementModel)(R.prop(method), R.type, R.rejectIfP(R.complement(R.equals('Function')), 'Unknown method "' + method + '" on ' + type)) : true;
        }
      }
      function onElementsReplayP(ctxt, state, game) {
        var stamps = R.pluck('stamp', ctxt.after);
        return R.threadP(game)(setStates$(ctxt.after, stamps), setRemoteSelection$(stamps, state), emitChangeEvents$(stamps, state));
      }
      function onElementsUndoP(ctxt, state, game) {
        var stamps = R.pluck('stamp', ctxt.before);
        return R.threadP(game)(setStates$(ctxt.before, stamps), setRemoteSelection$(stamps, state), emitChangeEvents$(stamps, state));
      }

      function applyMethodOnGameElementsP(method, args, stamps, game) {
        return R.threadP(game)(R.prop(type + 's'), gameElementsModel.onStampsP$(method, args, stamps), function (elements) {
          return R.assoc(type + 's', elements, game);
        });
      }
      function setStates(states, stamps, game) {
        return R.threadP(game)(R.prop(type + 's'), gameElementsModel.setStateStampsP$(states, stamps), function (elements) {
          return R.assoc(type + 's', elements, game);
        });
      }
      function saveStatesP(ctxt, prop, stamps, game) {
        return R.threadP(game)(R.prop(type + 's'), gameElementsModel.fromStampsP$('saveState', [], stamps), function (states) {
          ctxt[prop] = states;
          return game;
        });
      }
      function setRemoteSelection(stamps, state, game) {
        return R.thread(game)(R.prop(type + '_selection'), gameElementSelectionModel.set$('remote', stamps, state), function (selection) {
          return R.assoc(type + '_selection', selection, game);
        });
      }
      function emitChangeEvents(stamps, state, game) {
        R.forEach(function (stamp) {
          state.queueChangeEventP('Game.' + type + '.change.' + stamp);
        }, stamps);
        return game;
      }
    };
  }
})();
//# sourceMappingURL=elements.js.map
