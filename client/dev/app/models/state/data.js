'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('stateData', stateDataModelFactory);

  stateDataModelFactory.$inject = ['fileExport', 'fileImport', 'settings', 'gameBoard', 'gameTerrainInfo', 'gameFactions', 'gameScenario', 'appState', 'state'];
  function stateDataModelFactory(fileExportService, fileImportService, settingsModel, gameBoardModel, gameTerrainInfoModel, gameFactionsModel, gameScenarioModel, appStateService, stateModel) {
    var BOARDS_LENS = R.lensProp('boards');
    var FACTIONS_LENS = R.lensProp('factions');
    var SCENARIOS_LENS = R.lensProp('scenarios');
    var SETTINGS_LENS = R.lensProp('settings');
    var TERRAINS_LENS = R.lensProp('terrains');

    var stateDataModel = {
      create: stateDataCreate,
      onBoardsSet: stateDataOnBoardsSet,
      onFactionsSet: stateDataOnFactionsSet,
      onScenariosSet: stateDataOnScenariosSet,
      onSettingsSet: stateDataOnSettingsSet,
      onTerrainsSet: stateDataOnTerrainsSet,
      onSettingsLoadFile: stateDataOnSettingsLoadFile,
      onSettingsReset: stateDataOnSettingsReset,
      settingsStoreCurrent: stateDataSettingsStoreCurrent,
      settingsUpdateExport: stateDataSettingsUpdateExport,
      onFactionsLoadDescFile: stateDataOnFactionsLoadDescFile,
      onFactionsClearDesc: stateDataOnFactionsClearDesc,
      onFactionsClearAllDesc: stateDataOnFactionsClearAllDesc,
      onFactionsUpdateDesc: stateDataOnFactionsUpdateDesc,
      factionsStoreDesc: stateDataFactionsStoreDesc
    };
    R.curryService(stateDataModel);
    stateModel.register(stateDataModel);
    return stateDataModel;

    function stateDataCreate(state) {
      appStateService.addReducer('Boards.set', stateDataModel.onBoardsSet).addReducer('Terrains.set', stateDataModel.onTerrainsSet).addReducer('Factions.set', stateDataModel.onFactionsSet).addReducer('Scenarios.set', stateDataModel.onScenariosSet).addReducer('Settings.set', stateDataModel.onSettingsSet).addReducer('Settings.loadFile', stateDataModel.onSettingsLoadFile).addReducer('Settings.reset', stateDataModel.onSettingsReset).addReducer('Factions.loadDescFile', stateDataModel.onFactionsLoadDescFile).addReducer('Factions.updateDesc', stateDataModel.onFactionsUpdateDesc).addReducer('Factions.clearDesc', stateDataModel.onFactionsClearDesc).addReducer('Factions.clearAllDesc', stateDataModel.onFactionsClearAllDesc).addListener('Factions.desc.change', stateDataModel.factionsStoreDesc).addListener('Settings.current.change', stateDataModel.settingsStoreCurrent);

      var boards_ready = gameBoardModel.initP().then(function (boards) {
        return appStateService.reduce('Boards.set', boards);
      });
      var factions_ready = gameFactionsModel.initP().then(function (factions) {
        return appStateService.reduce('Factions.set', factions);
      });
      var terrains_ready = gameTerrainInfoModel.initP().then(function (terrains) {
        return appStateService.reduce('Terrains.set', terrains);
      });
      var scenarios_ready = gameScenarioModel.initP().then(function (scenarios) {
        return appStateService.reduce('Scenarios.set', scenarios);
      });
      var settings_ready = settingsModel.initP().then(function (settings) {
        return appStateService.reduce('Settings.set', settings);
      });

      appStateService.onChange('AppState.change', 'Factions.desc.change', R.compose(R.prop('desc'), R.view(FACTIONS_LENS)));
      appStateService.onChange('AppState.change', 'Settings.current.change', R.compose(R.prop('current'), R.view(SETTINGS_LENS)));
      var settings_export_cell = appStateService.cell('Settings.current.change', stateDataModel.settingsUpdateExport, {});

      return R.thread(state)(R.set(BOARDS_LENS, []), R.set(FACTIONS_LENS, {}), R.set(SCENARIOS_LENS, {}), R.set(SETTINGS_LENS, {}), R.set(TERRAINS_LENS, {}), R.assocPath(['exports', 'settings'], settings_export_cell), R.assoc('data_ready', R.allP([boards_ready, terrains_ready, factions_ready, scenarios_ready, settings_ready])));
    }
    function stateDataOnBoardsSet(state, _event_, _ref) {
      var _ref2 = _slicedToArray(_ref, 1);

      var boards = _ref2[0];

      return R.set(BOARDS_LENS, boards, state);
    }
    function stateDataOnFactionsSet(state, _event_, _ref3) {
      var _ref4 = _slicedToArray(_ref3, 1);

      var factions = _ref4[0];

      return R.set(FACTIONS_LENS, factions, state);
    }
    function stateDataOnScenariosSet(state, _event_, _ref5) {
      var _ref6 = _slicedToArray(_ref5, 1);

      var scenarios = _ref6[0];

      return R.set(SCENARIOS_LENS, scenarios, state);
    }
    function stateDataOnSettingsSet(state, _event_, _ref7) {
      var _ref8 = _slicedToArray(_ref7, 1);

      var settings = _ref8[0];

      return R.set(SETTINGS_LENS, settings, state);
    }
    function stateDataOnTerrainsSet(state, _event_, _ref9) {
      var _ref10 = _slicedToArray(_ref9, 1);

      var terrains = _ref10[0];

      return R.set(TERRAINS_LENS, terrains, state);
    }
    function stateDataOnSettingsLoadFile(_state_, _event_, _ref11) {
      var _ref12 = _slicedToArray(_ref11, 1);

      var file = _ref12[0];

      return R.threadP(file)(fileImportService.readP$('json'), settingsModel.bind, settingsModel.update, function (settings) {
        appStateService.reduce('Settings.set', settings);
        appStateService.emit('Settings.loadFile', 'Settings loaded');
      }).catch(function (error) {
        appStateService.emit('Settings.loadFile', error);
      });
    }
    function stateDataOnSettingsReset(state, _event_, _ref13) {
      var _ref14 = _slicedToArray(_ref13, 1);

      var data = _ref14[0];

      return R.thread(data)(settingsModel.bind, settingsModel.update, function (settings) {
        return R.set(SETTINGS_LENS, settings, state);
      });
    }
    function stateDataOnFactionsLoadDescFile(_state_, _event_, _ref15) {
      var _ref16 = _slicedToArray(_ref15, 2);

      var faction = _ref16[0];
      var file = _ref16[1];

      return R.threadP(file)(fileImportService.readP$('json'), function (desc) {
        appStateService.reduce('Factions.updateDesc', faction, desc);
        appStateService.emit('Factions.loadDescFile', 'File loaded');
      }).catch(function (error) {
        appStateService.emit('Factions.loadDescFile', error);
      });
    }
    function stateDataOnFactionsUpdateDesc(state, _event_, _ref17) {
      var _ref18 = _slicedToArray(_ref17, 2);

      var faction = _ref18[0];
      var desc = _ref18[1];

      return R.over(FACTIONS_LENS, function (factions) {
        return R.thread(factions)(R.assocPath(['desc', faction], desc), gameFactionsModel.updateDesc);
      }, state);
    }
    function stateDataOnFactionsClearDesc(state, _event_, _ref19) {
      var _ref20 = _slicedToArray(_ref19, 1);

      var faction = _ref20[0];

      return R.over(FACTIONS_LENS, function (factions) {
        return R.thread(factions)(R.dissocPath(['desc', faction]), gameFactionsModel.updateDesc);
      }, state);
    }
    function stateDataOnFactionsClearAllDesc(state) {
      return R.over(FACTIONS_LENS, function (factions) {
        return R.thread(factions)(R.assoc('desc', {}), gameFactionsModel.updateDesc);
      }, state);
    }
    function stateDataSettingsStoreCurrent() {
      var settings = R.view(SETTINGS_LENS, appStateService.current());
      return settingsModel.store(settings);
    }
    function stateDataFactionsStoreDesc(_state_) {
      var factions = R.view(FACTIONS_LENS, appStateService.current());
      return gameFactionsModel.storeDesc(factions);
    }
    function stateDataSettingsUpdateExport(exp, current_settings) {
      fileExportService.cleanup(exp.url);
      return {
        name: 'clicknfeat_settings.json',
        url: fileExportService.generate('json', current_settings)
      };
    }
  }
})();
//# sourceMappingURL=data.js.map
