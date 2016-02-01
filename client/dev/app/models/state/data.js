'use strict';

angular.module('clickApp.services').factory('stateData', ['pubSub', 'stateExports', 'fileImport', 'settings', 'gameBoard', 'gameTerrainInfo', 'gameFactions', 'gameScenario', function stateDataServiceFactory(pubSubService, stateExportsService, fileImportService, settingsService, gameBoardService, gameTerrainInfoService, gameFactionsService, gameScenarioService) {
  var stateDataService = {
    init: function stateDataInit(state) {
      var boards_ready = gameBoardService.init().then(function (boards) {
        state.boards = boards;
        console.log('board', boards);
      });
      var terrains_ready = gameTerrainInfoService.init().then(function (terrains) {
        state.terrains = terrains;
        console.log('terrains', terrains);
      });
      var factions_ready = gameFactionsService.init().then(function (factions) {
        state.factions = factions;
      });
      var scenario_ready = gameScenarioService.init().then(function (scenarios) {
        state.scenarios = scenarios;
        console.log('scenarios', scenarios);
      });
      var settings_ready = settingsService.init().then(function (settings) {
        state.settings = settings;
        exportCurrentSettings(state);
      });
      state.data_ready = self.Promise.all([boards_ready, terrains_ready, factions_ready, scenario_ready, settings_ready]).then(function () {
        console.log('data ready');
      });

      state.onEvent('Settings.loadFile', stateDataService.onSettingsLoadFile$(state));
      state.onEvent('Settings.reset', stateDataService.onSettingsReset$(state));
      state.onEvent('Factions.loadDescFile', stateDataService.onFactionsLoadDescFile$(state));
      state.onEvent('Factions.clearDesc', stateDataService.onFactionsClearDesc$(state));
      state.onEvent('Factions.clearAllDesc', stateDataService.onFactionsClearAllDesc$(state));
      // state.onEvent('Factions.reload',
      //               stateDataService.onReloadFactions$(state));

      return state;
    },
    save: function stateDataSave(state) {
      return R.pipeP(R.always(exportCurrentSettings(state)), R.always(storeCurrentSettings(state)), R.always(storeCurrentFactions(state)))();
    },
    onSettingsLoadFile: function stateOnSettingsLoadFile(state, event, file) {
      return R.pipeP(fileImportService.read$('json'), settingsService.bind, settingsService.update, setSettings$(state), function () {
        state.changeEvent('Settings.loadFile', 'Settings loaded');
      })(file).catch(function (error) {
        state.changeEvent('Settings.loadFile', error);
      });
    },
    onSettingsReset: function stateOnSettingsReset(state, event, data) {
      return R.pipePromise(settingsService.bind, settingsService.update, setSettings$(state))(data);
    },
    onFactionsLoadDescFile: function stateOnFactionsLoadDescFile(state, event, faction, file) {
      return R.pipeP(fileImportService.read$('json'), function (faction_desc) {
        return R.assocPath(['desc', faction], faction_desc, state.factions);
      }, gameFactionsService.updateDesc, setFactions$(state), function () {
        state.changeEvent('Factions.loadDescFile', 'File loaded');
      })(file).catch(function (error) {
        state.changeEvent('Factions.loadDescFile', error);
      });
    },
    onFactionsClearDesc: function stateOnFactionsClearDesc(state, event, faction) {
      return R.pipePromise(R.dissocPath(['desc', faction]), gameFactionsService.updateDesc, setFactions$(state))(state.factions);
    },
    onFactionsClearAllDesc: function stateOnFactionsClearAllDesc(state, event) {
      event = event;
      return R.pipePromise(R.assoc('desc', {}), gameFactionsService.updateDesc, setFactions$(state))(state.factions);
    }
  };
  var setSettings$ = R.curry(function (state, settings) {
    state.settings = settings;
    state.changeEvent('Settings.change');
  });
  var setFactions$ = R.curry(function (state, factions) {
    state.factions = factions;
    state.changeEvent('Factions.change');
  });
  var exportCurrentSettings = stateExportsService.export$('settings', R.path(['settings', 'current']));
  var storeCurrentSettings = function storeCurrentSettings(state) {
    if (state._settings === state.settings) return null;
    state._settings = state.settings;
    return settingsService.store(state.settings);
  };
  var storeCurrentFactions = function storeCurrentFactions(state) {
    if (state._factions === state.factions) return null;
    state._factions = state.factions;
    return gameFactionsService.storeDesc(state.factions);
  };

  R.curryService(stateDataService);
  return stateDataService;
}]);
//# sourceMappingURL=data.js.map
