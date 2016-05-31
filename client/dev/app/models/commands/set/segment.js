'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

(function () {
  angular.module('clickApp.services').factory('setSegmentCommand', setSegmentCommandModelFactory);

  setSegmentCommandModelFactory.$inject = [];
  function setSegmentCommandModelFactory() {
    return function buildSetSegmentCommandModel(type, gameSegmentModel) {
      var TYPE_LENS = R.lensProp(type);
      var setSegmentCommandModel = {
        executeP: setSegmentExecuteP,
        replayP: setSegmentReplayP,
        undoP: setSegmentUndoP
      };
      return setSegmentCommandModel;

      function setSegmentExecuteP(method, args, game) {
        var ctxt = {
          before: [],
          after: [],
          desc: method
        };
        return R.threadP(gameSegmentModel)(checkMethod, function () {
          return saveState('before', game);
        }, function () {
          return gameSegmentModel[method].apply(gameSegmentModel, _toConsumableArray(args).concat([R.view(TYPE_LENS, game)]));
        }, function (segment) {
          return R.set(TYPE_LENS, segment, game);
        }, function (game) {
          return saveState('after', game);
        }, function (game) {
          return [ctxt, game];
        });

        function checkMethod(gameSegmentModel) {
          return R.threadP(gameSegmentModel)(R.prop(method), R.type, R.rejectIfP(R.complement(R.equals('Function')), s.capitalize(type) + ' unknown method "' + method + '"'));
        }
        function saveState(when, game) {
          ctxt[when] = gameSegmentModel.saveRemoteState(R.view(TYPE_LENS, game));
          return game;
        }
      }
      function setSegmentReplayP(ctxt, game) {
        return R.over(TYPE_LENS, gameSegmentModel.resetRemote$(ctxt.after), game);
      }
      function setSegmentUndoP(ctxt, game) {
        return R.over(TYPE_LENS, gameSegmentModel.resetRemote$(ctxt.before), game);
      }
    };
  }
})();
//# sourceMappingURL=segment.js.map
