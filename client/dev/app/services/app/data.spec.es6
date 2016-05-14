describe('appData service', function() {
  beforeEach(inject(['appData', function(appDataService) {
    this.appDataService = appDataService;

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

  context('factionsSet(<factions>)', function() {
    return this.appDataService
      .factionsSet(this.state, 'new_factions');
  }, function() {
    it('should set state factions', function() {
      expect(this.context.factions)
        .toBe('new_factions');
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
