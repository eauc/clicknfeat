(function() {
  angular.module('clickApp.services')
    .factory('appData', appDataServiceFactory);

  appDataServiceFactory.$inject = [
    'appAction',
    'appState',
    // 'fileExport',
    // 'fileImport',
    // 'settings',
    'gameBoard',
    'gameFactions',
    'gameScenario',
    'gameTerrainInfo',
    // 'appState',
    // 'state',
  ];
  function appDataServiceFactory(appActionService,
                                 appStateService,
                                 // fileExportService,
                                 // fileImportService,
                                 // settingsModel,
                                 gameBoardModel,
                                 gameFactionsModel,
                                 gameScenarioModel,
                                 gameTerrainInfoModel) {
    // appStateService,
    // stateModel
                                // ) {
    const BOARDS_LENS = R.lensProp('boards');
    const FACTIONS_LENS = R.lensProp('factions');
    const SCENARIOS_LENS = R.lensProp('scenarios');
    // const SETTINGS_LENS = R.lensProp('settings');
    const TERRAINS_LENS = R.lensProp('terrains');

    const boards = appStateService.state
            .map(R.viewOr([], BOARDS_LENS));
    const factions = appStateService.state
            .map(R.viewOr({}, FACTIONS_LENS));
    const scenarios = appStateService.state
            .map(R.viewOr({}, SCENARIOS_LENS));
    const terrains = appStateService.state
            .map(R.viewOr({}, TERRAINS_LENS));

    const appDataService = {
      boards, factions, scenarios, terrains,
      boardsSet: actionDataBoardsSet,
      factionsSet: actionDataFactionsSet,
      scenariosSet: actionDataScenariosSet,
      // onSettingsSet: actionDataSettingsSet,
      terrainsSet: actionDataTerrainsSet,
      // onSettingsLoadFile: actionDataSettingsLoadFile,
      // onSettingsReset: actionDataSettingsReset,
      // settingsStoreCurrent: stateDataSettingsStoreCurrent,
      // settingsUpdateExport: stateDataSettingsUpdateExport,
      // onFactionsLoadDescFile: actionDataFactionsLoadDescFile,
      // onFactionsClearDesc: actionDataFactionsClearDesc,
      // onFactionsClearAllDesc: actionDataFactionsClearAllDesc,
      // onFactionsUpdateDesc: actionDataFactionsUpdateDesc,
      // factionsStoreDesc: stateDataFactionsStoreDesc
    };
    R.curryService(appDataService);

    mount();

    return appDataService;

    function mount() {
      appActionService
        .register('Boards.set'               , actionDataBoardsSet)
        .register('Factions.set'             , actionDataFactionsSet)
        .register('Scenarios.set'            , actionDataScenariosSet)
        .register('Terrains.set'             , actionDataTerrainsSet)
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

      const boards_ready = gameBoardModel.initP()
              .then((boards) => appActionService.do('Boards.set', boards));
      const factions_ready = gameFactionsModel.initP()
              .then((factions) => appActionService.do('Factions.set', factions));
      const scenarios_ready = gameScenarioModel.initP()
              .then((scenarios) => appActionService.do('Scenarios.set', scenarios));
      const terrains_ready = gameTerrainInfoModel.initP()
              .then((terrains) => appActionService.do('Terrains.set', terrains));
      // const settings_ready = settingsModel.initP()
      //         .then((settings) => appActionService.do('Settings.set', settings));

      appDataService.ready = R.allP([
        boards_ready,
        factions_ready,
        scenarios_ready,
        // settings_ready,
        terrains_ready,
      ]);
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
