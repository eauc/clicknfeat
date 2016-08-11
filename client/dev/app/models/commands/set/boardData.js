'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('setBoardDataCommand', setBoardCommandModelFactory);

  setBoardCommandModelFactory.$inject = ['appError', 'commands', 'gameTerrains', 'setBoardCommand', 'createTerrainCommand', 'deleteTerrainCommand'];
  function setBoardCommandModelFactory(appErrorService, commandsService, gameTerrainsModel, setBoardCommandModel, createTerrainCommandModel, deleteTerrainCommandModel) {
    var setBoardDataCommandModel = {
      executeP: setBoardDataExecuteP,
      replayP: setBoardDataReplayP,
      undoP: setBoardDataUndoP
    };
    commandsService.registerCommand('setBoardData', setBoardDataCommandModel);
    return setBoardDataCommandModel;

    function setBoardDataExecuteP(data, game) {
      var ctxt = {};
      return R.threadP(game)(function (game) {
        return R.thread(game)(R.prop('terrains'), gameTerrainsModel.all, R.pluck('state'), R.pluck('stamp'), function (stamps) {
          return deleteTerrainCommandModel.executeP(stamps, game);
        });
      }, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var delete_ctxt = _ref2[0];
        var game = _ref2[1];

        ctxt.delete_ctxt = delete_ctxt;
        return createTerrainCommandModel.executeP(data.terrain, false, game).catch(R.pipe(appErrorService.emit, R.defaultTo([{}, game])));
      }, function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        var create_ctxt = _ref4[0];
        var game = _ref4[1];

        ctxt.create_ctxt = create_ctxt;
        return setBoardCommandModel.executeP(data.board, game);
      }, function (_ref5) {
        var _ref6 = _slicedToArray(_ref5, 2);

        var set_ctxt = _ref6[0];
        var game = _ref6[1];

        ctxt.set_ctxt = set_ctxt;
        return [ctxt, game];
      });
    }
    function setBoardDataReplayP(ctxt, game) {
      return R.threadP(game)(function (game) {
        return deleteTerrainCommandModel.replayP(ctxt.delete_ctxt, game);
      }, function (game) {
        return createTerrainCommandModel.replayP(ctxt.create_ctxt, game).catch(R.pipe(appErrorService.emit, R.defaultTo(game)));
      }, function (game) {
        return setBoardCommandModel.replayP(ctxt.set_ctxt, game);
      });
    }
    function setBoardDataUndoP(ctxt, game) {
      return R.threadP(game)(function (game) {
        return deleteTerrainCommandModel.undoP(ctxt.delete_ctxt, game).catch(R.pipe(appErrorService.emit, R.defaultTo(game)));
      }, function (game) {
        return createTerrainCommandModel.undoP(ctxt.create_ctxt, game);
      }, function (game) {
        return setBoardCommandModel.undoP(ctxt.set_ctxt, game);
      });
    }
  }
})();
//# sourceMappingURL=boardData.js.map
