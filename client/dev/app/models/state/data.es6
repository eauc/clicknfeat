(function() {
  angular.module('clickApp.services')
    .factory('stateData', stateDataModelFactory);

  stateDataModelFactory.$inject = [
    'fileExport',
    'fileImport',
    'settings',
    'gameBoard',
    'gameTerrainInfo',
    'gameFactions',
    'gameScenario',
    'appState',
    'state',
  ];
  function stateDataModelFactory(fileExportService,
                                 fileImportService,
                                 settingsModel,
                                 gameBoardModel,
                                 gameTerrainInfoModel,
                                 gameFactionsModel,
                                 gameScenarioModel,
                                 appStateService,
                                 stateModel) {
    const BOARDS_LENS = R.lensProp('boards');
    const FACTIONS_LENS = R.lensProp('factions');
    const SCENARIOS_LENS = R.lensProp('scenarios');
    const SETTINGS_LENS = R.lensProp('settings');
    const TERRAINS_LENS = R.lensProp('terrains');

    const stateDataModel = {
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
      appStateService
        .addReducer('Boards.set'               , stateDataModel.onBoardsSet)
        .addReducer('Terrains.set'             , stateDataModel.onTerrainsSet)
        .addReducer('Factions.set'             , stateDataModel.onFactionsSet)
        .addReducer('Scenarios.set'            , stateDataModel.onScenariosSet)
        .addReducer('Settings.set'             , stateDataModel.onSettingsSet)
        .addReducer('Settings.loadFile'        , stateDataModel.onSettingsLoadFile)
        .addReducer('Settings.reset'           , stateDataModel.onSettingsReset)
        .addReducer('Factions.loadDescFile'    , stateDataModel.onFactionsLoadDescFile)
        .addReducer('Factions.updateDesc'      , stateDataModel.onFactionsUpdateDesc)
        .addReducer('Factions.clearDesc'       , stateDataModel.onFactionsClearDesc)
        .addReducer('Factions.clearAllDesc'    , stateDataModel.onFactionsClearAllDesc)
        .addListener('Factions.desc.change'    , stateDataModel.factionsStoreDesc)
        .addListener('Settings.current.change' , stateDataModel.settingsStoreCurrent);

      const boards_ready = gameBoardModel.initP()
              .then((boards) => appStateService.reduce('Boards.set', boards));
      const factions_ready = gameFactionsModel.initP()
              .then((factions) => appStateService.reduce('Factions.set', factions));
      const terrains_ready = gameTerrainInfoModel.initP()
              .then((terrains) => appStateService.reduce('Terrains.set', terrains));
      const scenarios_ready = gameScenarioModel.initP()
              .then((scenarios) => appStateService.reduce('Scenarios.set', scenarios));
      const settings_ready = settingsModel.initP()
              .then((settings) => appStateService.reduce('Settings.set', settings));

      appStateService
        .onChange('AppState.change',
                  'Factions.desc.change',
                  R.compose(R.prop('desc'), R.view(FACTIONS_LENS)));
      appStateService
        .onChange('AppState.change',
                  'Settings.current.change',
                  R.compose(R.prop('current'), R.view(SETTINGS_LENS)));
      const settings_export_cell = appStateService
        .cell('Settings.current.change',
              stateDataModel.settingsUpdateExport,
              {});

      return R.thread(state)(
        R.set(BOARDS_LENS, []),
        R.set(FACTIONS_LENS, {}),
        R.set(SCENARIOS_LENS, {}),
        R.set(SETTINGS_LENS, {}),
        R.set(TERRAINS_LENS, {}),
        R.assocPath(['exports', 'settings'], settings_export_cell),
        R.assoc('data_ready', R.allP([
          boards_ready,
          terrains_ready,
          factions_ready,
          scenarios_ready,
          settings_ready,
        ]))
      );
    }
    function stateDataOnBoardsSet(state, _event_, [boards]) {
      return R.set(BOARDS_LENS, boards, state);
    }
    function stateDataOnFactionsSet(state, _event_, [factions]) {
      return R.set(FACTIONS_LENS, factions, state);
    }
    function stateDataOnScenariosSet(state, _event_, [scenarios]) {
      return R.set(SCENARIOS_LENS, scenarios, state);
    }
    function stateDataOnSettingsSet(state, _event_, [settings]) {
      return R.set(SETTINGS_LENS, settings, state);
    }
    function stateDataOnTerrainsSet(state, _event_, [terrains]) {
      return R.set(TERRAINS_LENS, terrains, state);
    }
    function stateDataOnSettingsLoadFile(_state_, _event_, [file]) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        settingsModel.bind,
        settingsModel.update,
        (settings) => {
          appStateService.reduce('Settings.set', settings);
          appStateService.emit('Settings.loadFile', 'Settings loaded');
        }
      ).catch((error) => {
        appStateService.emit('Settings.loadFile', error);
      });
    }
    function stateDataOnSettingsReset(state, _event_, [data]) {
      return R.thread(data)(
        settingsModel.bind,
        settingsModel.update,
        (settings) => R.set(SETTINGS_LENS, settings, state)
      );
    }
    function stateDataOnFactionsLoadDescFile(_state_, _event_, [faction, file]) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        (desc) => {
          appStateService
            .reduce('Factions.updateDesc', faction, desc);
          appStateService
            .emit('Factions.loadDescFile', 'File loaded');
        }
      ).catch((error) => {
        appStateService.emit('Factions.loadDescFile', error);
      });
    }
    function stateDataOnFactionsUpdateDesc(state, _event_, [faction, desc]) {
      return R.over(
        FACTIONS_LENS,
        (factions) => R.thread(factions)(
          R.assocPath(['desc', faction], desc),
          gameFactionsModel.updateDesc
        ),
        state
      );
    }
    function stateDataOnFactionsClearDesc(state, _event_, [faction]) {
      return R.over(
        FACTIONS_LENS,
        (factions) => R.thread(factions)(
          R.dissocPath(['desc', faction]),
          gameFactionsModel.updateDesc
        ),
        state
      );
    }
    function stateDataOnFactionsClearAllDesc(state) {
      return R.over(
        FACTIONS_LENS,
        (factions) => R.thread(factions)(
          R.assoc('desc', {}),
          gameFactionsModel.updateDesc
        ),
        state
      );
    }
    function stateDataSettingsStoreCurrent() {
      const settings = R.view(SETTINGS_LENS, appStateService.current());
      return settingsModel.store(settings);
    }
    function stateDataFactionsStoreDesc(_state_) {
      const factions = R.view(FACTIONS_LENS, appStateService.current());
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
