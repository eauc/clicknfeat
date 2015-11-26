'use strict';

xdescribe('damage model', function() {
  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
        this.gameFactionsService = spyOnService('gameFactions');
      }
    ]));

    when('resetDamage()', function() {
      this.modelService.resetDamage(this.model);
    }, function() {
      when('damage type is warrior', function() {
        this.model = { state: { info: ['info'], dmg: { n: 3, t: 3 } } };
      }, function() {
        it('should reset current damage', function() {
          expect(this.model.state.dmg).toEqual({ n: 0, t: 0 });
        });
      });

      when('damage type is jack', function() {
        this.model = { state: { info: ['info'], dmg: {
          'col1': [ 0, 1, 1, 0 ],
          'col2': [ 0, 1, 0, 0 ],
          'col3': [ 0, 1, 0, 1 ],
          f: 3,
          t: 5
        } } };
      }, function() {
        it('should reset current damage', function() {
          expect(this.model.state.dmg).toEqual({
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 0, 0, 0, 0 ],
            'col3': [ 0, 0, 0, 0 ],
            f: 0,
            t: 0
          });
        });
      });
    });

    when('setWarriorDamage(<factions>, <i>)', function() {
      this.modelService.setWarriorDamage('factions', this.i, this.model);
    }, function() {
      beforeEach(function() {
        this.gameFactionsService.getModelInfo._retVal = { damage: { n: 10 } };
      });

      when('<i> is different from current damage', function() {
        this.model = { state: { info: ['info'], dmg: { n: 3, t: 3 } } };
        this.i = 5;
      }, function() {
        it('should set current damage to <i>', function() {
          expect(this.model.state.dmg).toEqual({ n: 5, t: 5 });
        });
      });

      when('<i> equals from current damage', function() {
        this.model = { state: { info: ['info'], dmg: { n: 3, t: 3 } } };
        this.i = 3;
      }, function() {
        it('should reset current damage', function() {
          expect(this.model.state.dmg).toEqual({ n: 0, t: 0 });
        });
      });

      when('<i> exceeds info damage', function() {
        this.model = { state: { info: ['info'], dmg: { n: 3, t: 3 } } };
        this.i = 15;
      }, function() {
        it('should set maximum info damage', function() {
          expect(this.model.state.dmg).toEqual({ n: 10, t: 10 });
        });
      });
    });

    when('setFieldDamage(<factions>, <i>)', function() {
      this.modelService.setFieldDamage('factions', this.i, this.model);
    }, function() {
      beforeEach(function() {
        this.gameFactionsService.getModelInfo._retVal = { damage: { field: 10 } };
      });

      when('<i> is different from current field damage', function() {
        this.model = { state: { info: ['info'], dmg: { f: 3 } } };
        this.i = 5;
      }, function() {
        it('should set current field damage to <i>', function() {
          expect(this.model.state.dmg).toEqual({ f: 5 });
        });
      });

      when('<i> equals from current field damage', function() {
        this.model = { state: { info: ['info'], dmg: { f: 3 } } };
        this.i = 3;
      }, function() {
        it('should reset current damage', function() {
          expect(this.model.state.dmg).toEqual({ f: 0 });
        });
      });

      when('<i> exceeds info field damage', function() {
        this.model = { state: { info: ['info'], dmg: { f: 3 } } };
        this.i = 15;
      }, function() {
        it('should set maximum info damage', function() {
          expect(this.model.state.dmg).toEqual({ f: 10 });
        });
      });
    });

    when('setGridDamage(<factions>, <line>, <col>)', function() {
      this.modelService.setGridDamage('factions',
                                      this.line, this.col,
                                      this.model);
    }, function() {
      beforeEach(function() {
        this.gameFactionsService.getModelInfo._retVal = {
          damage: { 'col': [ null, 'b', 'b', null ] }
        };
        this.col = 'col';
      });

      using([
        [ 'current', 'line', 'result' ],
        [ [ 0, 0, 0, 0 ], 1, { col: [ 0, 1, 0, 0 ], t: 1 } ],
        [ [ 0, 0, 1, 0 ], 1, { col: [ 0, 1, 1, 0 ], t: 2 } ],
        [ [ 0, 1, 1, 0 ], 1, { col: [ 0, 0, 1, 0 ], t: 1 } ],
      ], function(e, d) {
        when('<line,col> is a valid box, '+d, function() {
          this.line = e.line;
          this.model = { state: { info: ['info'], dmg: {
            col: e.current
          } } };
        }, function() {
          it('should set current box damage', function() {
            expect(this.model.state.dmg).toEqual(e.result);
          });
        });
      });

      using([
        [ 'current', 'line', 'result' ],
        [ [ 0, 0, 0, 0 ], 0, { col: [ 0, 0, 0, 0 ], t: 0 } ],
        [ [ 0, 0, 1, 0 ], 3, { col: [ 0, 0, 1, 0 ], t: 1 } ],
      ], function(e, d) {
        when('<line,col> is not a valid box, '+d, function() {
          this.line = e.line;
          this.model = { state: { info: ['info'], dmg: {
            col: e.current
          } } };
        }, function() {
          it('should not set current box damage', function() {
            expect(this.model.state.dmg).toEqual(e.result);
          });
        });
      });
    });

    when('setGridColDamage(<factions>, <col>)', function() {
      this.modelService.setGridColDamage('factions',
                                         this.col,
                                         this.model);
    }, function() {
      beforeEach(function() {
        this.gameFactionsService.getModelInfo._retVal = {
          damage: { 'col1': [ null, 'b', 'b', null ],
                    'col2': [  'b', 'b', 'b', null ],
                    'col3': [ null, 'b', 'b',  'b' ] }
        };
      });

      using([
        [ 'current', 'col', 'result' ],
        [ {
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 0, 0, 0, 0 ],
            'col3': [ 0, 0, 0, 0 ]
          }, 'col1', {
            'col1': [ 0, 1, 1, 0 ],
            'col2': [ 0, 0, 0, 0 ],
            'col3': [ 0, 0, 0, 0 ],
            t: 2
          } ],
        [ {
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 0, 0, 0, 0 ],
            'col3': [ 0, 0, 0, 0 ]
          }, 'col2', {
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 1, 1, 1, 0 ],
            'col3': [ 0, 0, 0, 0 ],
            t: 3
          } ],
        [ {
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 0, 0, 0, 0 ],
            'col3': [ 0, 0, 0, 0 ]
          }, 'col3', {
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 0, 0, 0, 0 ],
            'col3': [ 0, 1, 1, 1 ],
            t: 3
          } ],
        [ {
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 0, 1, 0, 0 ],
            'col3': [ 0, 0, 0, 0 ]
          }, 'col2', {
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 1, 1, 1, 0 ],
            'col3': [ 0, 0, 0, 0 ],
            t: 3
          } ],
        [ {
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 0, 0, 0, 0 ],
            'col3': [ 0, 1, 0, 1 ]
          }, 'col3', {
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 0, 0, 0, 0 ],
            'col3': [ 0, 1, 1, 1 ],
            t: 3
          } ],
      ], function(e, d) {
        when('<col> is not full, '+d, function() {
          this.col = e.col;
          this.model = { state: { info: ['info'], dmg: e.current } };
        }, function() {
          it('should set full damage to <col>', function() {
            expect(this.model.state.dmg).toEqual(e.result);
          });
        });
      });

      using([
        [ 'current', 'col', 'result' ],
        [ {
            'col1': [ 0, 1, 1, 0 ],
            'col2': [ 0, 1, 0, 0 ],
            'col3': [ 0, 1, 0, 1 ]
          }, 'col1', {
            'col1': [ 0, 0, 0, 0 ],
            'col2': [ 0, 1, 0, 0 ],
            'col3': [ 0, 1, 0, 1 ],
            t: 3
          } ],
        [ {
            'col1': [ 0, 0, 1, 0 ],
            'col2': [ 1, 1, 1, 0 ],
            'col3': [ 0, 1, 0, 1 ]
          }, 'col2', {
            'col1': [ 0, 0, 1, 0 ],
            'col2': [ 0, 0, 0, 0 ],
            'col3': [ 0, 1, 0, 1 ],
            t: 3
          } ],
        [ {
            'col1': [ 0, 0, 1, 0 ],
            'col2': [ 0, 1, 0, 0 ],
            'col3': [ 0, 1, 1, 1 ]
          }, 'col3', {
            'col1': [ 0, 0, 1, 0 ],
            'col2': [ 0, 1, 0, 0 ],
            'col3': [ 0, 0, 0, 0 ],
            t: 2
          } ],
      ], function(e, d) {
        when('<col> is full, '+d, function() {
          this.col = e.col;
          this.model = { state: { info: ['info'], dmg: e.current } };
        }, function() {
          it('should clear all damage from <col>', function() {
            expect(this.model.state.dmg).toEqual(e.result);
          });
        });
      });
    });
  });
});
