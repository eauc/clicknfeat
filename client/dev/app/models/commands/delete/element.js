'use strict';

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

(function () {
  angular.module('clickApp.models').factory('deleteElementCommand', deleteElementCommandModelFactory);

  deleteElementCommandModelFactory.$inject = [];
  function deleteElementCommandModelFactory() {
    return function buildDeleteElementCommandModel(type, elementModel, gameElementsModel, gameElementSelectionModel, createElementFn) {
      var deleteElementCommandModel = {
        executeP: deleteElementExecuteP,
        replayP: deleteElementReplayP,
        undoP: deleteElementUndoP
      };
      var onDeletedStates$ = R.curry(onDeletedStates);
      createElementFn = R.thread(createElementFn)(R.defaultTo(tryToCreateElement), R.curry);
      return deleteElementCommandModel;

      function deleteElementExecuteP(stamps, game) {
        return R.thread(game)(R.prop(type + 's'), gameElementsModel.findAnyStamps$(stamps), R.reject(R.isNil), R.map(elementModel.saveState), onNewDeletedStates);

        function onNewDeletedStates(states) {
          var _ctxt;

          var ctxt = (_ctxt = {}, _defineProperty(_ctxt, type + 's', states), _defineProperty(_ctxt, 'desc', ''), _ctxt);
          return R.thread(states)(onDeletedStates$(game), function (game) {
            return [ctxt, game];
          });
        }
      }
      function deleteElementReplayP(ctxt, game) {
        return onDeletedStates(game, ctxt[type + 's']);
      }
      function deleteElementUndoP(ctxt, game) {
        return R.threadP(ctxt)(R.prop(type + 's'), R.map(createElementFn), R.reject(R.isNil), R.rejectIfP(R.isEmpty, 'No valid ' + type + ' definition'), onNewCreatedElements);

        function onNewCreatedElements(elements) {
          var stamps = R.map(R.path(['state', 'stamp']), elements);
          return R.thread(game)(addToGameElements, addToGameElementSelection);

          function addToGameElements(game) {
            return R.thread(game)(R.prop(type + 's'), gameElementsModel.add$(elements), R.assoc(type + 's', R.__, game));
          }
          function addToGameElementSelection(game) {
            return R.thread(game)(R.prop(type + '_selection'), gameElementSelectionModel.set$('remote', stamps), R.assoc(type + '_selection', R.__, game));
          }
        }
      }
      function onDeletedStates(game, states) {
        var stamps = R.pluck('stamp', states);
        return R.thread(game)(removeFromGameElements, removeFromGameElementSelection);
        function removeFromGameElements(game) {
          return R.thread(game)(R.prop(type + 's'), gameElementsModel.removeStamps$(stamps), R.assoc(type + 's', R.__, game));
        }
        function removeFromGameElementSelection(game) {
          return R.thread(game)(R.prop(type + '_selection'), gameElementSelectionModel.removeFrom$('local', stamps), gameElementSelectionModel.removeFrom$('remote', stamps), R.assoc(type + '_selection', R.__, game));
        }
      }
      function tryToCreateElement(element) {
        return elementModel.create(element);
      }
    };
  }
})();
//# sourceMappingURL=element.js.map
