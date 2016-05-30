'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('createObjectivesCommand', createObjectivesCommandModelFactory);

  createObjectivesCommandModelFactory.$inject = ['appError', 'commands', 'createModelCommand', 'deleteModelCommand', 'gameModels', 'gameScenario'];
  function createObjectivesCommandModelFactory(appErrorService, commandsModel, createModelCommandModel, deleteModelCommandModel, gameModelsModel, gameScenarioModel) {
    var MODELS_LENS = R.lensProp('models');
    var createObjectivesCommandModel = {
      executeP: createObjectivesExecuteP,
      replayP: createObjectivesReplayP,
      undoP: createObjectivesUndoP
    };
    commandsModel.registerCommand('createObjectives', createObjectivesCommandModel);
    return createObjectivesCommandModel;

    function createObjectivesExecuteP(game) {
      var ctxt = {
        desc: ''
      };
      return R.threadP(game)(R.view(MODELS_LENS), gameModelsModel.all, R.filter(R.pipe(R.path(['state', 'info']), R.head, R.equals('scenario'))), R.map(R.path(['state', 'stamp'])), function (stamps) {
        return deleteModelCommandModel.executeP(stamps, game);
      }, function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var delete_ctxt = _ref2[0];
        var game = _ref2[1];

        ctxt.del = delete_ctxt;
        return game;
      }, function (game) {
        return R.thread(game)(R.prop('scenario'), gameScenarioModel.createObjectives, function (objectives) {
          return createModelCommandModel.executeP(objectives, false, game);
        });
      }, function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2);

        var create_ctxt = _ref4[0];
        var game = _ref4[1];

        ctxt.create = create_ctxt;
        return [ctxt, game];
      });
    }
    function createObjectivesReplayP(ctxt, game) {
      return R.threadP(game)(function (game) {
        return deleteModelCommandModel.replayP(ctxt.del, game);
      }, function (game) {
        return createModelCommandModel.replayP(ctxt.create, game);
      });
    }
    function createObjectivesUndoP(ctxt, game) {
      return R.threadP(game)(function (game) {
        return createModelCommandModel.undoP(ctxt.create, game);
      }, function (game) {
        return deleteModelCommandModel.undoP(ctxt.del, game).catch(R.pipe(appErrorService.emit, function () {
          return game;
        }));
      });
    }
  }
})();
//# sourceMappingURL=objectives.js.map
