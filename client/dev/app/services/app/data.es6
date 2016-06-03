(function() {
  angular.module('clickApp.services')
    .factory('appData', appDataServiceFactory);

  appDataServiceFactory.$inject = [
    'appAction',
    'appError',
    'appState',
    'fileExport',
    'fileImport',
    'settings',
    'gameBoard',
    'gameFactions',
    'gameScenario',
    'gameTerrainInfo',
  ];
  function appDataServiceFactory(appActionService,
                                 appErrorService,
                                 appStateService,
                                 fileExportService,
                                 fileImportService,
                                 settingsModel,
                                 gameBoardModel,
                                 gameFactionsModel,
                                 gameScenarioModel,
                                 gameTerrainInfoModel) {
    const BOARDS_LENS = R.lensProp('boards');
    const FACTIONS_LENS = R.lensProp('factions');
    const SCENARIOS_LENS = R.lensProp('scenarios');
    const SETTINGS_LENS = R.lensProp('settings');
    const TERRAINS_LENS = R.lensProp('terrains');

    const boards = appStateService.state
            .map(R.viewOr([], BOARDS_LENS));
    const factions = appStateService.state
            .map(R.viewOr({}, FACTIONS_LENS));
    const scenarios = appStateService.state
            .map(R.viewOr({}, SCENARIOS_LENS));
    const settings = appStateService.state
            .map(R.viewOr({}, SETTINGS_LENS));
    const terrains = appStateService.state
            .map(R.viewOr({}, TERRAINS_LENS));

    const export_settings = settings
            .map(R.prop('current'))
            .changes()
            .snapshot(dataSettingsExport, () => previous_export_settings)
            .hold({});
    const previous_export_settings = export_settings.delay();

    settings
      .map(R.prop('current'))
      .changes()
      .listen((current) => settingsModel.store({current}));
    factions
      .map(R.prop('desc'))
      .changes()
      .listen((desc) => gameFactionsModel.storeDesc({desc}));

    const appDataService = {
      boards, factions, scenarios, settings, terrains,
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
      appActionService
        .register('Boards.set'               , actionDataBoardsSet)
        .register('Factions.clearDesc'       , actionDataFactionsClearDesc)
        .register('Factions.clearAllDesc'    , actionDataFactionsClearAllDesc)
        .register('Factions.loadDescFile'    , actionDataFactionsLoadDescFile)
        .register('Factions.set'             , actionDataFactionsSet)
        .register('Factions.updateDesc'      , actionDataFactionsUpdateDesc)
        .register('Settings.loadFile'        , actionDataSettingsLoadFile)
        .register('Scenarios.set'            , actionDataScenariosSet)
        .register('Settings.reset'           , actionDataSettingsReset)
        .register('Settings.set'             , actionDataSettingsSet)
        .register('Terrains.set'             , actionDataTerrainsSet);

      const boards_ready = gameBoardModel.initP()
              .then((boards) => appActionService.do('Boards.set', boards));
      const factions_ready = gameFactionsModel.initP()
              .then((factions) => appActionService.do('Factions.set', factions));
      const scenarios_ready = gameScenarioModel.initP()
              .then((scenarios) => appActionService.do('Scenarios.set', scenarios));
      const terrains_ready = gameTerrainInfoModel.initP()
              .then((terrains) => appActionService.do('Terrains.set', terrains));
      const settings_ready = settingsModel.initP()
              .then((settings) => appActionService.do('Settings.set', settings));

      appDataService.ready = R.allP([
        boards_ready,
        factions_ready,
        scenarios_ready,
        settings_ready,
        terrains_ready,
      ]);
    }
    function actionDataBoardsSet(state, boards) {
      return R.set(BOARDS_LENS, boards, state);
    }
    function actionDataFactionsClearDesc(state, faction) {
      return R.over(
        FACTIONS_LENS,
        R.pipe(
          R.dissocPath(['desc', faction]),
          gameFactionsModel.updateDesc
        ),
        state
      );
    }
    function actionDataFactionsClearAllDesc(state) {
      return R.over(
        FACTIONS_LENS,
        R.pipe(
          R.assoc('desc', {}),
          gameFactionsModel.updateDesc
        ),
        state
      );
    }
    function actionDataFactionsLoadDescFile(_state_, faction, file) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        (desc) => {
          appActionService
            .do('Factions.updateDesc', faction, desc);
        }
      ).catch(appErrorService.emit);
    }
    function actionDataFactionsSet(state, factions) {
      return R.set(FACTIONS_LENS, factions, state);
    }
    function actionDataFactionsUpdateDesc(state, faction, desc) {
      return R.over(
        FACTIONS_LENS,
        R.pipe(
          R.assocPath(['desc', faction], desc),
          gameFactionsModel.updateDesc
        ),
        state
      );
    }
    function actionDataScenariosSet(state, scenarios) {
      return R.set(SCENARIOS_LENS, scenarios, state);
    }
    function actionDataSettingsLoadFile(_state_, file) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        settingsModel.bind,
        settingsModel.update,
        (settings) => {
          appActionService.do('Settings.set', settings);
        }
      ).catch(appErrorService.emit);
    }
    function actionDataSettingsReset(state, data) {
      return R.thread(data)(
        settingsModel.bind,
        settingsModel.update,
        (settings) => R.set(SETTINGS_LENS, settings, state)
      );
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
