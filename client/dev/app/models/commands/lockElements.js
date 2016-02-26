'use strict';

(function () {
  angular.module('clickApp.services').factory('lockElementsCommand', lockElementsCommandModelFactory);

  lockElementsCommandModelFactory.$inject = [];
  function lockElementsCommandModelFactory() {
    return function buildLockElementsCommandModel(type, gameElementsModel) {
      var lockElementsCommandModel = {
        executeP: lockElementsExecuteP,
        replayP: lockElementsRedoP,
        undoP: lockElementsUndoP
      };

      var lockStampsP$ = R.curry(lockStampsP);
      var emitChangeEvents$ = R.curry(emitChangeEvents);

      return lockElementsCommandModel;

      function lockElementsExecuteP(lock, stamps, state, game) {
        var ctxt = {
          desc: lock,
          stamps: stamps
        };

        return R.threadP(game)(lockStampsP$(lock, stamps), emitChangeEvents$(stamps, state), function (game) {
          return [ctxt, game];
        });
      }
      function lockElementsRedoP(ctxt, state, game) {
        return R.threadP(game)(lockStampsP$(ctxt.desc, ctxt.stamps), emitChangeEvents$(ctxt.stamps, state));
      }
      function lockElementsUndoP(ctxt, state, game) {
        return R.threadP(game)(lockStampsP$(!ctxt.desc, ctxt.stamps), emitChangeEvents$(ctxt.stamps, state));
      }
      function lockStampsP(lock, stamps, game) {
        return R.threadP(game)(R.prop(type + 's'), gameElementsModel.lockStampsP$(lock, stamps), function (game_elements) {
          return R.assoc(type + 's', game_elements, game);
        });
      }
      function emitChangeEvents(stamps, state, game) {
        R.forEach(function (stamp) {
          state.queueChangeEventP('Game.' + type + '.change.' + stamp);
        }, stamps);
        state.queueChangeEventP('Game.' + type + '.create');
        return game;
      }
    };
  }
})();
//# sourceMappingURL=lockElements.js.map
