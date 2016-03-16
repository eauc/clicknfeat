'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('setSegmentCommand', setSegmentCommandModelFactory);

  setSegmentCommandModelFactory.$inject = [];
  function setSegmentCommandModelFactory() {
    return function buildSetSegmentCommandModel(type, gameSegmentModel) {
      var setSegmentCommandModel = {
        executeP: setSegmentExecuteP,
        replayP: setSegmentReplayP,
        undoP: setSegmentUndoP
      };
      return setSegmentCommandModel;

      function setSegmentExecuteP(method, args, state, game) {
        var ctxt = {
          before: [],
          after: [],
          desc: method
        };
        return R.threadP(gameSegmentModel)(checkMethod, R.always(game), saveState('before'), function () {
          return gameSegmentModel[method].apply(null, [].concat(_toConsumableArray(args), [state, game, R.prop(type, game)]));
        }, function (segment) {
          return R.assoc(type, segment, game);
        }, saveState('after'), function (game) {
          state.queueChangeEventP('Game.' + type + '.remote.change');
          return [ctxt, game];
        });

        function checkMethod(gameSegmentModel) {
          return R.threadP(gameSegmentModel)(R.prop(method), R.type, R.rejectIf(R.complement(R.equals('Function')), s.capitalize(type) + ' unknown method "' + method + '"'));
        }
        function saveState(when) {
          return function (game) {
            ctxt[when] = gameSegmentModel.saveRemoteState(R.prop(type, game));
            return game;
          };
        }
      }
      function setSegmentReplayP(ctxt, state, game) {
        return R.over(R.lensProp(type), R.pipe(gameSegmentModel.resetRemote$(ctxt.after, state, game), function (segment) {
          state.queueChangeEventP('Game.' + type + '.remote.change');
          return segment;
        }), game);
      }
      function setSegmentUndoP(ctxt, state, game) {
        return R.over(R.lensProp(type), R.pipe(gameSegmentModel.resetRemote$(ctxt.before, state, game), function (segment) {
          state.queueChangeEventP('Game.' + type + '.remote.change');
          return segment;
        }), game);
      }
    };
  }
})();
//# sourceMappingURL=segment.js.map
