'use strict';

(function () {
  angular.module('clickApp.services').factory('appData', appDataServiceFactory);

  appDataServiceFactory.$inject = ['appAction', 'appError', 'appState', 'fileExport', 'fileImport', 'settings', 'gameBoard', 'gameFactions', 'gameScenario', 'gameTerrainInfo'];
  function appDataServiceFactory(appActionService, appErrorService, appStateService, fileExportService, fileImportService, settingsModel, gameBoardModel, gameFactionsModel, gameScenarioModel, gameTerrainInfoModel) {
    var BOARDS_LENS = R.lensProp('boards');
    var FACTIONS_LENS = R.lensProp('factions');
    var SCENARIOS_LENS = R.lensProp('scenarios');
    var SETTINGS_LENS = R.lensProp('settings');
    var TERRAINS_LENS = R.lensProp('terrains');

    var boards = appStateService.state.map(R.viewOr([], BOARDS_LENS));
    var factions = appStateService.state.map(R.viewOr({}, FACTIONS_LENS));
    var scenarios = appStateService.state.map(R.viewOr({}, SCENARIOS_LENS));
    var settings = appStateService.state.map(R.viewOr({}, SETTINGS_LENS));
    var terrains = appStateService.state.map(R.viewOr({}, TERRAINS_LENS));

    var export_settings = settings.map(R.prop('current')).changes().snapshot(dataSettingsExport, function () {
      return previous_export_settings;
    }).hold({});
    var previous_export_settings = export_settings.delay();

    settings.map(R.prop('current')).changes().listen(function (current) {
      return settingsModel.store({ current: current });
    });
    factions.map(R.prop('desc')).changes().listen(function (desc) {
      return gameFactionsModel.storeDesc({ desc: desc });
    });

    var appDataService = {
      boards: boards, factions: factions, scenarios: scenarios, settings: settings, terrains: terrains,
      export: { settings: export_settings },
      boardsSet: actionDataBoardsSet,
      factionsClearDesc: actionDataFactionsClearDesc,
      factionsClearAllDesc: actionDataFactionsClearAllDesc,
      factionsLoadDescFile: actionDataFactionsLoadDescFile,
      factionsSet: actionDataFactionsSet,
      factionsUpdateDesc: actionDataFactionsUpdateDesc,
      scenariosSet: actionDataScenariosSet,
      settingsLoadFile: actionDataSettingsLoadFile,
      settingsReset: actionDataSettingsReset,
      settingsSet: actionDataSettingsSet,
      settingsExport: dataSettingsExport,
      terrainsSet: actionDataTerrainsSet
    };
    R.curryService(appDataService);

    mount();

    return appDataService;

    function mount() {
      appActionService.register('Boards.set', actionDataBoardsSet).register('Factions.clearDesc', actionDataFactionsClearDesc).register('Factions.clearAllDesc', actionDataFactionsClearAllDesc).register('Factions.loadDescFile', actionDataFactionsLoadDescFile).register('Factions.set', actionDataFactionsSet).register('Factions.updateDesc', actionDataFactionsUpdateDesc).register('Settings.loadFile', actionDataSettingsLoadFile).register('Scenarios.set', actionDataScenariosSet).register('Settings.reset', actionDataSettingsReset).register('Settings.set', actionDataSettingsSet).register('Terrains.set', actionDataTerrainsSet);

      var boards_ready = gameBoardModel.initP().then(function (boards) {
        return appActionService.do('Boards.set', boards);
      });
      var factions_ready = gameFactionsModel.initP().then(function (factions) {
        return appActionService.do('Factions.set', factions);
      });
      var scenarios_ready = gameScenarioModel.initP().then(function (scenarios) {
        return appActionService.do('Scenarios.set', scenarios);
      });
      var terrains_ready = gameTerrainInfoModel.initP().then(function (terrains) {
        return appActionService.do('Terrains.set', terrains);
      });
      var settings_ready = settingsModel.initP().then(function (settings) {
        return appActionService.do('Settings.set', settings);
      });

      appDataService.ready = R.allP([boards_ready, factions_ready, scenarios_ready, settings_ready, terrains_ready]);
    }
    function actionDataBoardsSet(state, boards) {
      return R.set(BOARDS_LENS, boards, state);
    }
    function actionDataFactionsClearDesc(state, faction) {
      return R.over(FACTIONS_LENS, R.pipe(R.dissocPath(['desc', faction]), gameFactionsModel.updateDesc), state);
    }
    function actionDataFactionsClearAllDesc(state) {
      return R.over(FACTIONS_LENS, R.pipe(R.assoc('desc', {}), gameFactionsModel.updateDesc), state);
    }
    function actionDataFactionsLoadDescFile(_state_, faction, file) {
      return R.threadP(file)(fileImportService.readP$('json'), function (desc) {
        appActionService.do('Factions.updateDesc', faction, desc);
      }).catch(appErrorService.emit);
    }
    function actionDataFactionsSet(state, factions) {
      return R.set(FACTIONS_LENS, factions, state);
    }
    function actionDataFactionsUpdateDesc(state, faction, desc) {
      return R.over(FACTIONS_LENS, R.pipe(R.assocPath(['desc', faction], desc), gameFactionsModel.updateDesc), state);
    }
    function actionDataScenariosSet(state, scenarios) {
      return R.set(SCENARIOS_LENS, scenarios, state);
    }
    function actionDataSettingsLoadFile(_state_, file) {
      return R.threadP(file)(fileImportService.readP$('json'), settingsModel.bind, settingsModel.update, function (settings) {
        appActionService.do('Settings.set', settings);
      }).catch(appErrorService.emit);
    }
    function actionDataSettingsReset(state, data) {
      return R.thread(data)(settingsModel.bind, settingsModel.update, function (settings) {
        return R.set(SETTINGS_LENS, settings, state);
      });
    }
    function actionDataSettingsSet(state, settings) {
      return R.set(SETTINGS_LENS, settings, state);
    }
    function actionDataTerrainsSet(state, terrains) {
      return R.set(TERRAINS_LENS, terrains, state);
    }
    function dataSettingsExport(previous, current) {
      fileExportService.cleanup(previous.url);
      return {
        name: 'clicknfeat_settings.json',
        url: fileExportService.generate('json', current)
      };
    }
  }
})();
//# sourceMappingURL=data.js.map
