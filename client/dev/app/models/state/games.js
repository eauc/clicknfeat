'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('stateGames', stateGamesModelFactory);

  stateGamesModelFactory.$inject = ['game', 'games', 'fileImport', 'state', 'appState'];
  function stateGamesModelFactory(gameModel, gamesModel, fileImportService, stateModel, appStateService) {
    var LOCAL_GAMES_LENS = R.lensProp('local_games');
    var stateGamesModel = {
      create: stateGamesCreate,
      onLocalSet: stateGamesOnLocalSet,
      onLocalUpdate: stateGamesOnLocalUpdate,
      onLocalCreate: stateGamesOnLocalCreate,
      onLocalLoadFile: stateGamesOnLocalLoadFile,
      onLocalLoadNew: stateGamesOnLocalLoadNew,
      onLocalLoad: stateGamesOnLocalLoad,
      onLocalDelete: stateGamesOnLocalDelete,
      onOnlineCreate: stateGamesOnOnlineCreate,
      onOnlineLoadFile: stateGamesOnOnlineLoadFile,
      loadNewOnlineGameP: loadNewOnlineGameP,
      onOnlineLoad: stateGamesOnOnlineLoad
    };
    R.curryService(stateGamesModel);
    stateModel.register(stateGamesModel);
    return stateGamesModel;

    function stateGamesCreate(state) {
      appStateService.addReducer('Games.local.set', stateGamesModel.onLocalSet).addReducer('Games.local.update', stateGamesModel.onLocalUpdate).addReducer('Games.local.create', stateGamesModel.onLocalCreate).addReducer('Games.local.loadFile', stateGamesModel.onLocalLoadFile).addReducer('Games.local.loadNew', stateGamesModel.onLocalLoadNew).addReducer('Games.local.load', stateGamesModel.onLocalLoad).addReducer('Games.local.delete', stateGamesModel.onLocalDelete).addReducer('Games.online.create', stateGamesModel.onOnlineCreate).addReducer('Games.online.load', stateGamesModel.onOnlineLoad).addReducer('Games.online.loadFile', stateGamesModel.onOnlineLoadFile);

      appStateService.onChange('AppState.change', 'Games.local.change', R.view(LOCAL_GAMES_LENS));

      var local_games_ready = R.threadP()(gamesModel.loadLocalGamesP, function (games) {
        return appStateService.reduce('Games.local.set', games);
      });

      return R.thread(state)(R.set(LOCAL_GAMES_LENS, []), R.assoc('local_games_ready', local_games_ready));
    }
    function stateGamesOnLocalSet(state, _event_, _ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var games = _ref2[0];

      return R.set(LOCAL_GAMES_LENS, games, state);
    }
    function stateGamesOnLocalUpdate(state, _event_, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 1);

      var game = _ref4[0];

      return R.over(LOCAL_GAMES_LENS, gamesModel.updateLocalGame$(game), state);
    }
    function stateGamesOnLocalCreate(state, _event_) {
      return R.thread(state.user.state)(gameModel.create, function (game) {
        return stateGamesModel.onLocalLoadNew(state, _event_, [game]);
      });
    }
    function stateGamesOnLocalLoadFile(_state_, _event_, _ref5) {
      var _ref6 = _slicedToArray(_ref5, 1);

      var file = _ref6[0];

      return R.threadP(file)(fileImportService.readP$('json'), function (data) {
        return appStateService.reduce('Games.local.loadNew', data);
      });
    }
    function stateGamesOnLocalLoadNew(state, _event_, _ref7) {
      var _ref8 = _slicedToArray(_ref7, 1);

      var game = _ref8[0];

      return R.thread(state)(R.over(LOCAL_GAMES_LENS, gamesModel.newLocalGame$(game)), R.tap(function (state) {
        return R.thread(state)(R.view(LOCAL_GAMES_LENS), R.last, R.prop('local_stamp'), function (id) {
          return stateGamesModel.onLocalLoad(state, _event_, [id]);
        });
      }));
    }
    function stateGamesOnLocalLoad(_state_, _event_, _ref9) {
      var _ref10 = _slicedToArray(_ref9, 1);

      var index = _ref10[0];

      appStateService.emit('Games.local.load', index);
    }
    function stateGamesOnLocalDelete(state, _event_, _ref11) {
      var _ref12 = _slicedToArray(_ref11, 1);

      var id = _ref12[0];

      return R.over(LOCAL_GAMES_LENS, gamesModel.removeLocalGame$(id), state);
    }
    function stateGamesOnOnlineCreate(state) {
      return R.thread(state)(R.pathOr({}, ['user', 'state']), gameModel.create, stateGamesModel.loadNewOnlineGameP);
    }
    function stateGamesOnOnlineLoadFile(_state_, _event_, _ref13) {
      var _ref14 = _slicedToArray(_ref13, 1);

      var file = _ref14[0];

      return R.threadP(file)(fileImportService.readP$('json'), stateGamesModel.loadNewOnlineGameP).catch(R.spyAndDiscardError('Failed to open online game file'));
    }
    function loadNewOnlineGameP(game) {
      return R.threadP(game)(gamesModel.newOnlineGameP, R.prop('private_stamp'), function (id) {
        return appStateService.emit('Games.online.load', 'private', id);
      });
    }
    function stateGamesOnOnlineLoad(_state_, _event_, _ref15) {
      var _ref16 = _slicedToArray(_ref15, 1);

      var id = _ref16[0];

      appStateService.emit('Games.online.load', 'public', id);
    }
  }
})();
//# sourceMappingURL=games.js.map
