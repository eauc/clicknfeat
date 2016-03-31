describe('gameScenario model', function() {
  beforeEach(inject([
    'gameScenario',
    function(gameScenarioModel) {
      this.gameScenarioModel = gameScenarioModel;
    }
  ]));

  describe('forName(<name>)', function() {
    beforeEach(function() {
      this.group = [ 'group', [
        { name: 'scenario1' },
        { name: 'scenario2' },
        { name: 'scenario3' },
      ] ];
    });

    example(function(e, d) {
      it('should find scenario with <name>, '+d, function() {
        expect(this.gameScenarioModel.forName(e.name, this.group))
          .toEqual(e.scenario);
      });
    }, [
      [ 'name'      , 'scenario'            ],
      [ 'scenario1' , { name: 'scenario1' } ],
      [ 'scenario3' , { name: 'scenario3' } ],
      [ 'unknown'   , undefined             ],
      [ null        , undefined             ],
    ]);
  });

  describe('group(<group_name>)', function() {
    beforeEach(function() {
      this.groups = [
        [ 'group1', [ 'gr1' ] ],
        [ 'group2', [ 'gr2' ] ],
        [ 'group3', [ 'gr3' ] ],
      ];
    });

    example(function(e, d) {
      it('should find scenario group with <name>, '+d, function() {
        expect(this.gameScenarioModel.group(e.name, this.groups))
          .toEqual(e.group);
      });
    }, [
      [ 'name'    , 'group'    ],
      [ 'group1'  , [ 'group1' , [ 'gr1' ] ] ],
      [ 'group3'  , [ 'group3' , [ 'gr3' ] ] ],
      [ 'unknown' , undefined  ],
      [ null      , undefined  ],
    ]);
  });

  describe('groupForName(<name>)', function() {
    beforeEach(function() {
      this.groups = [
        [ 'group1', [ { name: 'gr1scenario1' },
                      { name: 'gr1scenario2' },
                      { name: 'gr1scenario3' }, ] ],
        [ 'group2', [ { name: 'gr2scenario1' },
                      { name: 'gr2scenario2' },
                      { name: 'gr2scenario3' }, ] ],
        [ 'group3', [ { name: 'gr3scenario1' },
                      { name: 'gr3scenario2' },
                      { name: 'gr3scenario3' }, ] ],
      ];
    });

    example(function(e, d) {
      it('should find group for scenario with <name>, '+d, function() {
        expect(this.gameScenarioModel.groupForName(e.name, this.groups))
          .toEqual(this.groups[e.group]);
      });
    }, [
      [ 'name'         , 'group'   ],
      [ 'gr1scenario2' , 0         ],
      [ 'gr2scenario3' , 1         ],
      [ 'gr3scenario1' , 2         ],
      [ 'unknown'      , undefined ],
      [ null           , undefined ],
    ]);
  });

  context('createObjectives()', function() {
    return this.gameScenarioModel
      .createObjectives(this.scenario);
  }, function() {
    context('when scenario does not have objectives', function() {
      this.scenario = {};
    }, function() {
      it('should return null', function() {
        expect(this.context).toBe(null);
      });
    });

    context('when scenario has objectives', function() {
      this.scenario = {
        flags: [
          {
            info: ['flags','sr15flag'],
            x: 160,
            y: 250
          },
          {
            info: ['flags','sr15flag'],
            x: 320,
            y: 230
          }
        ],
        objectives: [
          {
            info: ['sr15_objectives','sr15gen'],
            x: 160,
            y: 300
          },
          {
            info: ['sr15_objectives','sr15gen'],
            x: 320,
            y: 180
          }
        ]
      };
    }, function() {
      it('should create objectives', function() {
        expect(this.context).toEqual({
          base: { x: 160, y: 300, r: 0 },
          models: [ { info: [ 'scenario', 'models', 'sr15_objectives', 'sr15gen' ],
                      x: 0, y: 0, r: 0 },
                    { info: [ 'scenario', 'models', 'sr15_objectives', 'sr15gen' ],
                      x: 160, y: -120, r: 0 },
                    { info: [ 'scenario', 'models', 'flags', 'sr15flag' ],
                      x: 0, y: -50, r: 0 },
                    { info: [ 'scenario', 'models', 'flags', 'sr15flag' ],
                      x: 160, y: -70, r: 0 }
                  ]
        });
      });
    });
  });

  context('isKillboxing(circle)', function() {
    return this.gameScenarioModel
      .isKillboxing(this.circle, this.scenario);
  }, function() {
    context('when scenario does not have a killbox', function() {
      this.scenario = {};
    }, function() {
      it('should return false', function() {
        expect(this.context).toBe(false);
      });
    });

    context('scenario has a killbox', function() {
      this.scenario = {
        killbox: 140
      };
    }, function() {
      example(function(e, d) {
        context(d, function() {
          this.circle = e.circle;
        }, function() {
          it('should check if circle is outside killbox', function() {
            expect(this.context).toBe(e.is_killboxing);
          });
        });
      }, [
        ['circle'                      , 'is_killboxing'],
        [{ x: 240, y: 240, radius: 10 }, false ],
        [{ x: 130, y: 240, radius: 10 }, false ],
        [{ x: 240, y: 130, radius: 10 }, false ],
        [{ x: 350, y: 240, radius: 10 }, false ],
        [{ x: 240, y: 350, radius: 10 }, false ],
        [{ x: 129, y: 240, radius: 10 }, true ],
        [{ x: 240, y: 129, radius: 10 }, true ],
        [{ x: 351, y: 240, radius: 10 }, true ],
        [{ x: 240, y: 351, radius: 10 }, true ],
        [{ x: 135, y: 135, radius: 10 }, false ],
        [{ x: 345, y: 135, radius: 10 }, false ],
        [{ x: 345, y: 345, radius: 10 }, false ],
        [{ x: 135, y: 345, radius: 10 }, false ],
        [{ x: 130, y: 130, radius: 10 }, true ],
        [{ x: 350, y: 130, radius: 10 }, true ],
        [{ x: 350, y: 350, radius: 10 }, true ],
        [{ x: 130, y: 350, radius: 10 }, true ],
      ]);
    });
  });

  context('isContesting(<circle>)', function() {
    return this.gameScenarioModel
      .isContesting(this.circle, this.scenario);
  }, function() {
    example(function(e, d) {
      context(d, function() {
        this.circle = e.circle;
        this.scenario = e.scenario;
      }, function() {
        it('should check if circle is contesting', function() {
          expect(this.context).toBe(e.is_contesting);
        });
      });
    }, [
      ['scenario', 'circle', 'is_contesting'],
      // circles
      [ { circle: [ { x: 140, y: 240, r: 60 },
                    { x: 340, y: 240, r: 60 } ]
        }, { x: 240, y: 240, radius: 10 }, false ],
      [ { circle: [ { x: 140, y: 240, r: 60 },
                    { x: 340, y: 240, r: 60 } ]
        }, { x: 140, y: 240, radius: 10 }, true ],
      [ { circle: [ { x: 140, y: 240, r: 60 },
                    { x: 340, y: 240, r: 60 } ]
        }, { x: 140, y: 170, radius: 10 }, true ],
      [ { circle: [ { x: 140, y: 240, r: 60 },
                    { x: 340, y: 240, r: 60 } ]
        }, { x: 140, y: 169, radius: 10 }, false ],
      [ { circle: [ { x: 140, y: 240, r: 60 },
                    { x: 340, y: 240, r: 60 } ]
        }, { x: 210, y: 240, radius: 10 }, true ],
      [ { circle: [ { x: 140, y: 240, r: 60 },
                    { x: 340, y: 240, r: 60 } ]
        }, { x: 211, y: 240, radius: 10 }, false ],
      // rects
      [ { rect: [ { x: 240, y: 240, width: 120, height: 60 } ]
        }, { x: 240, y: 240, radius: 10 }, true ],
      [ { rect: [ { x: 240, y: 240, width: 120, height: 60 } ]
        }, { x: 170, y: 240, radius: 10 }, true ],
      [ { rect: [ { x: 240, y: 240, width: 120, height: 60 } ]
        }, { x: 169, y: 240, radius: 10 }, false ],
      [ { rect: [ { x: 240, y: 240, width: 120, height: 60 } ]
        }, { x: 240, y: 200, radius: 10 }, true ],
      [ { rect: [ { x: 240, y: 240, width: 120, height: 60 } ]
        }, { x: 240, y: 199, radius: 10 }, false ],
      // flags
      [ { flags: [ { x: 120, y: 240 },
                   { x: 240, y: 240 },
                   { x: 360, y: 240 }
                 ]
        }, { x: 240, y: 240, radius: 10 }, true ],
      [ { flags: [ { x: 120, y: 240 },
                   { x: 240, y: 240 },
                   { x: 360, y: 240 }
                 ]
        }, { x: 120, y: 183, radius: 10 }, true ],
      [ { flags: [ { x: 120, y: 240 },
                   { x: 240, y: 240 },
                   { x: 360, y: 240 }
                 ]
        }, { x: 120, y: 182, radius: 10 }, false ],
      [ { flags: [ { x: 120, y: 240 },
                   { x: 240, y: 240 },
                   { x: 360, y: 240 }
                 ]
        }, { x: 417, y: 240, radius: 10 }, true ],
      [ { flags: [ { x: 120, y: 240 },
                   { x: 240, y: 240 },
                   { x: 360, y: 240 }
                 ]
        }, { x: 418, y: 240, radius: 10 }, false ],
    ]);
  });
});
