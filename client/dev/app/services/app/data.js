'use strict';

(function () {
  angular.module('clickApp.services').factory('appData', appDataServiceFactory);

  appDataServiceFactory.$inject = ['appAction', 'appState',
  // 'fileExport',
  // 'fileImport',
  // 'settings',
  'gameBoard', 'gameFactions', 'gameScenario', 'gameTerrainInfo'];

  // 'appState',
  // 'state',
  function appDataServiceFactory(appActionService, appStateService,
  // fileExportService,
  // fileImportService,
  // settingsModel,
  gameBoardModel, gameFactionsModel, gameScenarioModel, gameTerrainInfoModel) {
    // appStateService,
    // stateModel
    // ) {
    var BOARDS_LENS = R.lensProp('boards');
    var FACTIONS_LENS = R.lensProp('factions');
    var SCENARIOS_LENS = R.lensProp('scenarios');
    // const SETTINGS_LENS = R.lensProp('settings');
    var TERRAINS_LENS = R.lensProp('terrains');

    var boards = appStateService.state.map(R.viewOr([], BOARDS_LENS));
    var factions = appStateService.state.map(R.viewOr({}, FACTIONS_LENS));
    var scenarios = appStateService.state.map(R.viewOr({}, SCENARIOS_LENS));
    var terrains = appStateService.state.map(R.viewOr({}, TERRAINS_LENS));

    var appDataService = {
      boards: boards, factions: factions, scenarios: scenarios, terrains: terrains,
      boardsSet: actionDataBoardsSet,
      factionsSet: actionDataFactionsSet,
      scenariosSet: actionDataScenariosSet,
      // onSettingsSet: actionDataSettingsSet,
      terrainsSet: actionDataTerrainsSet
    };
    // onSettingsLoadFile: actionDataSettingsLoadFile,
    // onSettingsReset: actionDataSettingsReset,
    // settingsStoreCurrent: stateDataSettingsStoreCurrent,
    // settingsUpdateExport: stateDataSettingsUpdateExport,
    // onFactionsLoadDescFile: actionDataFactionsLoadDescFile,
    // onFactionsClearDesc: actionDataFactionsClearDesc,
    // onFactionsClearAllDesc: actionDataFactionsClearAllDesc,
    // onFactionsUpdateDesc: actionDataFactionsUpdateDesc,
    // factionsStoreDesc: stateDataFactionsStoreDesc
    R.curryService(appDataService);

    mount();

    return appDataService;

    function mount() {
      appActionService.register('Boards.set', actionDataBoardsSet).register('Factions.set', actionDataFactionsSet).register('Scenarios.set', actionDataScenariosSet).register('Terrains.set', actionDataTerrainsSet)
      // .register('Settings.set'             , actionDataSettingsSet)
      // .register('Settings.loadFile'        , actionDataSettingsLoadFile)
      // .register('Settings.reset'           , actionDataSettingsReset)
      // .register('Factions.loadDescFile'    , actionDataFactionsLoadDescFile)
      // .register('Factions.updateDesc'      , actionDataFactionsUpdateDesc)
      // .register('Factions.clearDesc'       , actionDataFactionsClearDesc)
      // .register('Factions.clearAllDesc'    , actionDataFactionsClearAllDesc)
      ;
      // .addListener('Factions.desc.change'    , actionDatactionsStoreDesc)
      // .addListener('Settings.current.change' , actionDatattingsStoreCurrent);

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
      // const settings_ready = settingsModel.initP()
      //         .then((settings) => appActionService.do('Settings.set', settings));

      appDataService.ready = R.allP([boards_ready, factions_ready, scenarios_ready,
      // settings_ready,
      terrains_ready]);
    }
    function actionDataBoardsSet(state, boards) {
      return R.set(BOARDS_LENS, boards, state);
    }
    function actionDataFactionsSet(state, factions) {
      return R.set(FACTIONS_LENS, factions, state);
    }
    function actionDataScenariosSet(state, scenarios) {
      return R.set(SCENARIOS_LENS, scenarios, state);
    }
    // function actionDataSettingsSet(state, settings) {
    //   return R.set(SETTINGS_LENS, settings, state);
    // }
    function actionDataTerrainsSet(state, terrains) {
      return R.set(TERRAINS_LENS, terrains, state);
    }
    // function actionDataSettingsLoadFile(_state_, file) {
    //   return R.threadP(file)(
    //     fileImportService.readP$('json'),
    //     settingsModel.bind,
    //     settingsModel.update,
    //     (settings) => {
    //       appActionService.do('Settings.set', settings);
    //       appStateService.emit('Settings.loadFile', 'Settings loaded');
    //     }
    //   ).catch((error) => {
    //     appStateService.emit('Settings.loadFile', error);
    //   });
    // }
    // function actionDataSettingsReset(state, data) {
    //   return R.thread(data)(
    //     settingsModel.bind,
    //     settingsModel.update,
    //     (settings) => R.set(SETTINGS_LENS, settings, state)
    //   );
    // }
    // function actionDataFactionsLoadDescFile(_state_, faction, file) {
    //   return R.threadP(file)(
    //     fileImportService.readP$('json'),
    //     (desc) => {
    //       appStateService
    //         .reduce('Factions.updateDesc', faction, desc);
    //       appStateService
    //         .emit('Factions.loadDescFile', 'File loaded');
    //     }
    //   ).catch((error) => {
    //     appStateService.emit('Factions.loadDescFile', error);
    //   });
    // }
    // function actionDataFactionsUpdateDesc(state, faction, desc) {
    //   return R.over(
    //     FACTIONS_LENS,
    //     (factions) => R.thread(factions)(
    //       R.assocPath(['desc', faction], desc),
    //       gameFactionsModel.updateDesc
    //     ),
    //     state
    //   );
    // }
    // function actionDataFactionsClearDesc(state, faction) {
    //   return R.over(
    //     FACTIONS_LENS,
    //     (factions) => R.thread(factions)(
    //       R.dissocPath(['desc', faction]),
    //       gameFactionsModel.updateDesc
    //     ),
    //     state
    //   );
    // }
    // function actionDataFactionsClearAllDesc(state) {
    //   return R.over(
    //     FACTIONS_LENS,
    //     (factions) => R.thread(factions)(
    //       R.assoc('desc', {}),
    //       gameFactionsModel.updateDesc
    //     ),
    //     state
    //   );
    // }
    // function stateDataSettingsStoreCurrent() {
    //   const settings = R.view(SETTINGS_LENS, appStateService.current());
    //   return settingsModel.store(settings);
    // }
    // function stateDataFactionsStoreDesc(_state_) {
    //   const factions = R.view(FACTIONS_LENS, appStateService.current());
    //   return gameFactionsModel.storeDesc(factions);
    // }
    // function stateDataSettingsUpdateExport(exp, current_settings) {
    //   fileExportService.cleanup(exp.url);
    //   return {
    //     name: 'clicknfeat_settings.json',
    //     url: fileExportService.generate('json', current_settings)
    //   };
    // }
  }
})();
//# sourceMappingURL=data.js.map
