'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
  angular.module('clickApp.models').factory('deleteElementCommand', deleteElementCommandModelFactory);

  deleteElementCommandModelFactory.$inject = [];
  function deleteElementCommandModelFactory() {
    return function buildDeleteElementCommandModel(type, elementModel, gameElementsModel, gameElementSelectionModel, createElementFnP) {
      var deleteElementCommandModel = {
        executeP: deleteElementExecuteP,
        replayP: deleteElementReplayP,
        undoP: deleteElementUndoP
      };

      var onDeletedStates$ = R.curry(onDeletedStates);
      var emitCreateEvent$ = R.curry(emitCreateEvent);
      var emitDeleteEvent$ = R.curry(emitDeleteEvent);
      createElementFnP = R.thread(createElementFnP)(R.defaultTo(tryToCreateElementP), R.curry);

      return deleteElementCommandModel;

      function deleteElementExecuteP(stamps, state, game) {
        return R.threadP(game)(R.prop(type + 's'), gameElementsModel.findAnyStampsP$(stamps), R.reject(R.isNil), R.map(elementModel.saveState), onNewDeletedStates);

        function onNewDeletedStates(states) {
          var _ctxt;

          var ctxt = (_ctxt = {}, _defineProperty(_ctxt, type + 's', states), _defineProperty(_ctxt, 'desc', ''), _ctxt);
          return R.thread(states)(onDeletedStates$(state, game), function (game) {
            return [ctxt, game];
          });
        }
      }
      function deleteElementReplayP(ctxt, state, game) {
        return onDeletedStates(state, game, ctxt[type + 's']);
      }
      function deleteElementUndoP(ctxt, state, game) {
        return R.threadP(ctxt)(R.prop(type + 's'), R.map(createElementFnP(state)), R.promiseAll, R.reject(R.isNil), R.rejectIf(R.isEmpty, 'No valid ' + type + ' definition'), onNewCreatedElements);

        function onNewCreatedElements(elements) {
          var stamps = R.map(R.path(['state', 'stamp']), elements);
          return R.thread(game)(addToGameElements, addToGameElementSelection, emitCreateEvent$(state));

          function addToGameElements(game) {
            return R.thread(game)(R.prop(type + 's'), gameElementsModel.add$(elements), function (game_elements) {
              return R.assoc(type + 's', game_elements, game);
            });
          }
          function addToGameElementSelection(game) {
            return R.thread(game)(R.prop(type + '_selection'), gameElementSelectionModel.set$('remote', stamps, state), function (selection) {
              return R.assoc(type + '_selection', selection, game);
            });
          }
        }
      }
      function onDeletedStates(state, game, states) {
        var stamps = R.pluck('stamp', states);
        return R.thread(game)(removeFromGameElements, removeFromGameElementSelection, function (game) {
          R.forEach(emitDeleteEvent$(state), stamps);
          return game;
        }, emitCreateEvent$(state));
        function removeFromGameElements(game) {
          return R.thread(game)(R.prop(type + 's'), gameElementsModel.removeStamps$(stamps), function (game_elements) {
            return R.assoc(type + 's', game_elements, game);
          });
        }
        function removeFromGameElementSelection(game) {
          return R.thread(game)(R.prop(type + '_selection'), gameElementSelectionModel.removeFrom$('local', stamps, state), gameElementSelectionModel.removeFrom$('remote', stamps, state), function (selection) {
            return R.assoc(type + '_selection', selection, game);
          });
        }
      }
      function tryToCreateElementP(_state_, element) {
        return elementModel.createP(element).catch(R.always(null));
      }
      function emitDeleteEvent(state, stamp) {
        state.queueChangeEventP('Game.model.delete.' + stamp);
      }
      function emitCreateEvent(state, game) {
        state.queueChangeEventP('Game.' + type + '.create');
        return game;
      }
    };
  }
})();
//# sourceMappingURL=element.js.map
