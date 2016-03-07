(function() {
  angular.module('clickApp.services')
    .factory('stateData', stateDataModelFactory);

  stateDataModelFactory.$inject = [
    'stateExports',
    'fileImport',
    'settings',
    'gameBoard',
    'gameTerrainInfo',
    // 'gameFactions',
    'gameScenario',
  ];
  function stateDataModelFactory(stateExportsService,
                                 fileImportService,
                                 settingsModel,
                                 gameBoardModel,
                                 gameTerrainInfoModel,
                                 // gameFactionsModel,
                                 gameScenarioModel) {
    const stateDataModel = {
      create: stateDataCreate,
      save: stateDataSave,
      onStateInit: stateDataOnInit,
      onSettingsLoadFile: stateDataOnSettingsLoadFile,
      onSettingsReset: stateDataOnSettingsReset,
      // onFactionsLoadDescFile: stateDataOnFactionsLoadDescFile,
      // onFactionsClearDesc: stateDataOnFactionsClearDesc,
      // onFactionsClearAllDesc: stateDataOnFactionsClearAllDesc
    };
    const setSettings$ = R.curry(setSettings);
    // const setFactions$ = R.curry(setFactions);
    const exportCurrentSettings = stateExportsService
          .exportP$('settings', R.path(['settings','current']));

    R.curryService(stateDataModel);
    return stateDataModel;

    function stateDataCreate(state) {
      state.data_ready = new self.Promise((resolve) => {
        state.onEvent('State.init',
                      stateDataModel.onStateInit$(state, resolve));
      });

      state.onEvent('Settings.loadFile',
                    stateDataModel.onSettingsLoadFile$(state));
      state.onEvent('Settings.reset',
                    stateDataModel.onSettingsReset$(state));
      // state.onEvent('Factions.loadDescFile',
      //               stateDataModel.onFactionsLoadDescFile$(state));
      // state.onEvent('Factions.clearDesc',
      //               stateDataModel.onFactionsClearDesc$(state));
      // state.onEvent('Factions.clearAllDesc',
      //               stateDataModel.onFactionsClearAllDesc$(state));
      // state.onEvent('Factions.reload',
      //               stateDataModel.onReloadFactions$(state));

      return state;
    }
    function stateDataOnInit(state, resolve, event) {
      event = event;
      const boards_ready = gameBoardModel.initP()
              .then((boards) => {
                state.boards = boards;
                console.info('board', boards);
              });
      const terrains_ready = gameTerrainInfoModel.initP()
              .then((terrains) => {
                state.terrains = terrains;
                console.log('terrains', terrains);
              });
      // const factions_ready = gameFactionsModel.init()
      //         .then((factions) => {
      //           state.factions = factions;
      //         });
      const scenario_ready = gameScenarioModel.initP()
              .then((scenarios) => {
                state.scenarios = scenarios;
                console.log('scenarios', scenarios);
              });
      const settings_ready = settingsModel.initP()
              .then((settings) => {
                state.settings = settings;
              });
      self.Promise.all([
        boards_ready,
        terrains_ready,
        // factions_ready,
        scenario_ready,
        settings_ready,
      ]).then(() => {
        console.log('data ready');
        resolve();
      });
    }
    function stateDataSave(state) {
      return R.threadP()(
        () => exportCurrentSettings(state),
        () => storeCurrentSettings(state)
        // R.always(storeCurrentFactions(state))
      );
    }
    function stateDataOnSettingsLoadFile(state, event, file) {
      return R.threadP(file)(
        fileImportService.readP$('json'),
        settingsModel.bind,
        settingsModel.update,
        setSettings$(state),
        () => {
          state.queueChangeEventP('Settings.loadFile', 'Settings loaded');
        }
      ).catch((error) => {
        state.queueChangeEventP('Settings.loadFile', error);
      });
    }
    function stateDataOnSettingsReset(state, event, data) {
      return R.threadP(data)(
        settingsModel.bind,
        settingsModel.update,
        setSettings$(state)
      );
    }
    // function stateDataOnFactionsLoadDescFile(state, event, faction, file) {
    //   return R.threadP(file)(
    //     fileImportService.read$('json'),
    //     (faction_desc) => {
    //       return R.assocPath(['desc', faction], faction_desc, state.factions);
    //     },
    //     gameFactionsModel.updateDesc,
    //     setFactions$(state),
    //     () => {
    //       state.queueChangeEventP('Factions.loadDescFile', 'File loaded');
    //     }
    //   ).catch((error) => {
    //     state.queueChangeEventP('Factions.loadDescFile', error);
    //   });
    // }
    // function stateDataOnFactionsClearDesc(state, event, faction) {
    //   return R.threadP(state.factions)(
    //     R.dissocPath(['desc', faction]),
    //     gameFactionsModel.updateDesc,
    //     setFactions$(state)
    //   );
    // }
    // function stateDataOnFactionsClearAllDesc(state, event) {
    //   event = event;
    //   return R.threadP(state.factions)(
    //     R.assoc('desc', {}),
    //     gameFactionsModel.updateDesc,
    //     setFactions$(state)
    //   );
    // }
    function setSettings(state, settings) {
      state.settings = settings;
      state.queueChangeEventP('Settings.change');
    }
    // function setFactions(state, factions) {
    //   state.factions = factions;
    //   state.changeEvent('Factions.change');
    // }
    function storeCurrentSettings(state) {
      if(state._settings === state.settings) return null;
      state._settings = state.settings;
      return settingsModel.store(state.settings);
    }
    // function storeCurrentFactions(state) {
    //   if(state._factions === state.factions) return null;
    //   state._factions = state.factions;
    //   return gameFactionsModel.storeDesc(state.factions);
    // }
  }
})();
