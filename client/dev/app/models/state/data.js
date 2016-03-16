'use strict';

(function () {
  angular.module('clickApp.services').factory('stateData', stateDataModelFactory);

  stateDataModelFactory.$inject = ['stateExports', 'fileImport', 'settings', 'gameBoard', 'gameTerrainInfo', 'gameFactions', 'gameScenario'];
  function stateDataModelFactory(stateExportsService, fileImportService, settingsModel, gameBoardModel, gameTerrainInfoModel, gameFactionsModel, gameScenarioModel) {
    var stateDataModel = {
      create: stateDataCreate,
      save: stateDataSave,
      onStateInit: stateDataOnInit,
      onSettingsLoadFile: stateDataOnSettingsLoadFile,
      onSettingsReset: stateDataOnSettingsReset,
      onFactionsLoadDescFile: stateDataOnFactionsLoadDescFile,
      onFactionsClearDesc: stateDataOnFactionsClearDesc,
      onFactionsClearAllDesc: stateDataOnFactionsClearAllDesc
    };
    var setSettings$ = R.curry(setSettings);
    var setFactions$ = R.curry(setFactions);
    var exportCurrentSettings = stateExportsService.exportP$('settings', R.path(['settings', 'current']));

    R.curryService(stateDataModel);
    return stateDataModel;

    function stateDataCreate(state) {
      state.data_ready = new self.Promise(function (resolve) {
        state.onEvent('State.init', stateDataModel.onStateInit$(state, resolve));
      });

      state.onEvent('Settings.loadFile', stateDataModel.onSettingsLoadFile$(state));
      state.onEvent('Settings.reset', stateDataModel.onSettingsReset$(state));
      state.onEvent('Factions.loadDescFile', stateDataModel.onFactionsLoadDescFile$(state));
      state.onEvent('Factions.clearDesc', stateDataModel.onFactionsClearDesc$(state));
      state.onEvent('Factions.clearAllDesc', stateDataModel.onFactionsClearAllDesc$(state));
      // state.onEvent('Factions.reload',
      //               stateDataModel.onReloadFactions$(state));

      return state;
    }
    function stateDataOnInit(state, resolve, _event_) {
      var boards_ready = gameBoardModel.initP().then(function (boards) {
        state.boards = boards;
        console.info('board', boards);
      });
      var terrains_ready = gameTerrainInfoModel.initP().then(function (terrains) {
        state.terrains = terrains;
        console.log('terrains', terrains);
      });
      var factions_ready = gameFactionsModel.initP().then(function (factions) {
        state.factions = factions;
      });
      var scenario_ready = gameScenarioModel.initP().then(function (scenarios) {
        state.scenarios = scenarios;
        console.log('scenarios', scenarios);
      });
      var settings_ready = settingsModel.initP().then(function (settings) {
        state.settings = settings;
      });
      self.Promise.all([boards_ready, terrains_ready, factions_ready, scenario_ready, settings_ready]).then(function () {
        console.log('data ready');
        resolve();
      });
    }
    function stateDataSave(state) {
      return R.threadP()(function () {
        return exportCurrentSettings(state);
      }, function () {
        return storeCurrentSettings(state);
      }, function () {
        return storeCurrentFactions(state);
      });
    }
    function stateDataOnSettingsLoadFile(state, _event_, file) {
      return R.threadP(file)(fileImportService.readP$('json'), settingsModel.bind, settingsModel.update, setSettings$(state), function () {
        state.queueChangeEventP('Settings.loadFile', 'Settings loaded');
      }).catch(function (error) {
        state.queueChangeEventP('Settings.loadFile', error);
      });
    }
    function stateDataOnSettingsReset(state, _event_, data) {
      return R.threadP(data)(settingsModel.bind, settingsModel.update, setSettings$(state));
    }
    function stateDataOnFactionsLoadDescFile(state, _event_, faction, file) {
      return R.threadP(file)(fileImportService.readP$('json'), function (faction_desc) {
        return R.assocPath(['desc', faction], faction_desc, state.factions);
      }, gameFactionsModel.updateDesc, setFactions$(state), function () {
        return state.queueChangeEventP('Factions.loadDescFile', 'File loaded');
      }).catch(function (error) {
        state.queueChangeEventP('Factions.loadDescFile', error);
      });
    }
    function stateDataOnFactionsClearDesc(state, _event_, faction) {
      return R.threadP(state.factions)(R.dissocPath(['desc', faction]), gameFactionsModel.updateDesc, setFactions$(state));
    }
    function stateDataOnFactionsClearAllDesc(state, _event_) {
      return R.threadP(state.factions)(R.assoc('desc', {}), gameFactionsModel.updateDesc, setFactions$(state));
    }
    function setSettings(state, settings) {
      state.settings = settings;
      state.queueChangeEventP('Settings.change');
    }
    function setFactions(state, factions) {
      state.factions = factions;
      state.queueChangeEventP('Factions.change');
    }
    function storeCurrentSettings(state) {
      if (state._settings === state.settings) return null;
      state._settings = state.settings;
      return settingsModel.store(state.settings);
    }
    function storeCurrentFactions(state) {
      if (state._factions === state.factions) return null;
      state._factions = state.factions;
      return gameFactionsModel.storeDesc(state.factions);
    }
  }
})();
//# sourceMappingURL=data.js.map
