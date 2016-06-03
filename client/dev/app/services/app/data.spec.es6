describe('appData service', function() {
  beforeEach(inject(['appData', function(appDataService) {
    this.appDataService = appDataService;

    this.appActionService = spyOnService('appAction');
    this.fileImportService = spyOnService('fileImport');

    this.gameFactionsModel = spyOnService('gameFactions');
    this.settingsModel = spyOnService('settings');

    this.state = {
      boards: 'boards'
    };
  }]));

  context('boardsSet(<boards>)', function() {
    return this.appDataService
      .boardsSet(this.state, 'new_boards');
  }, function() {
    it('should set state boards', function() {
      expect(this.context.boards)
        .toBe('new_boards');
    });
  });

  context('factionsClearDesc(<faction>)', function() {
    return this.appDataService
      .factionsClearDesc(this.state, 'faction');
  }, function() {
    beforeEach(function() {
      this.state.factions = {
        desc: { faction: 'faction_desc',
                other: 'other_desc'
              }
      };
    });

    it('should clear desc for <faction> and update current factions', function() {
      expect(this.gameFactionsModel.updateDesc)
        .toHaveBeenCalledWith({ desc: { other: 'other_desc' } });
    });

    it('should return updated state', function() {
      expect(this.context.factions)
        .toEqual('gameFactions.updateDesc.returnValue');
    });
  });

  context('factionsClearAllDesc()', function() {
    return this.appDataService
      .factionsClearAllDesc(this.state);
  }, function() {
    beforeEach(function() {
      this.state.factions = {
        desc: 'desc'
      };
    });

    it('should clear all factions descs and update current factions', function() {
      expect(this.gameFactionsModel.updateDesc)
        .toHaveBeenCalledWith({ desc: { } });
    });

    it('should return updated state', function() {
      expect(this.context.factions)
        .toEqual('gameFactions.updateDesc.returnValue');
    });
  });

  context('factionsLoadDescFile(<faction>, <file>)', function() {
    return this.appDataService
      .factionsLoadDescFile(this.state, 'faction' , 'file');
  }, function() {
    it('should load desc data from file', function() {
      expect(this.fileImportService.readP)
        .toHaveBeenCalledWith('json', 'file');
    });

    it('should update desc with data', function() {
      expect(this.appActionService.do)
        .toHaveBeenCalledWith('Factions.updateDesc', 'faction',
                              'fileImport.readP.returnValue');
    });
  });

  context('factionsSet(<factions>)', function() {
    return this.appDataService
      .factionsSet(this.state, 'new_factions');
  }, function() {
    it('should set state factions', function() {
      expect(this.context.factions)
        .toBe('new_factions');
    });
  });

  context('factionsUpdateDesc(<faction>, <desc>)', function() {
    return this.appDataService
      .factionsUpdateDesc(this.state, 'faction', 'new_desc');
  }, function() {
    beforeEach(function() {
      this.state.factions = {
        desc: { faction: 'faction_desc' }
      };
    });

    it('should update desc for <faction> and update current factions', function() {
      expect(this.gameFactionsModel.updateDesc)
        .toHaveBeenCalledWith({ desc: { faction: 'new_desc' } });
    });

    it('should return updated state', function() {
      expect(this.context.factions)
        .toEqual('gameFactions.updateDesc.returnValue');
    });
  });

  context('scenariosSet(<scenarios>)', function() {
    return this.appDataService
      .scenariosSet(this.state, 'new_scenarios');
  }, function() {
    it('should set state scenarios', function() {
      expect(this.context.scenarios)
        .toBe('new_scenarios');
    });
  });

  context('settingsLoadFile(<file>)', function() {
    return this.appDataService
      .settingsLoadFile(this.state, 'file');
  }, function() {
    it('should load desc data from file', function() {
      expect(this.fileImportService.readP)
        .toHaveBeenCalledWith('json', 'file');
    });

    it('should update settings with data', function() {
      expect(this.settingsModel.bind)
        .toHaveBeenCalledWith('fileImport.readP.returnValue');
      expect(this.settingsModel.update)
        .toHaveBeenCalledWith('settings.bind.returnValue');
      expect(this.appActionService.do)
        .toHaveBeenCalledWith('Settings.set',
                              'settings.update.returnValue');
    });
  });

  context('settingsReset(<data>)', function() {
    return this.appDataService
      .settingsReset(this.state, 'data');
  }, function() {
    it('should update settings with data', function() {
      expect(this.settingsModel.bind)
        .toHaveBeenCalledWith('data');
      expect(this.settingsModel.update)
        .toHaveBeenCalledWith('settings.bind.returnValue');
      expect(this.context.settings)
        .toBe('settings.update.returnValue');
    });
  });

  context('settingsSet(<settings>)', function() {
    return this.appDataService
      .settingsSet(this.state, 'new_settings');
  }, function() {
    it('should update settings with <settings>', function() {
      expect(this.context.settings)
        .toBe('new_settings');
    });
  });

  context('terrainsSet(<terrains>)', function() {
    return this.appDataService
      .terrainsSet(this.state, 'new_terrains');
  }, function() {
    it('should set state terrains', function() {
      expect(this.context.terrains)
        .toBe('new_terrains');
    });
  });
});
