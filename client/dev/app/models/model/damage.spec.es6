describe('model damage model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;

      this.gameFactionsModel = spyOnService('gameFactions');
    }
  ]));

  context('resetDamage()', function() {
    return this.modelModel.resetDamage(this.model);
  }, function() {
    context('when damage type is warrior', function() {
      this.model = { state: { info: ['info'], dmg: { n: 3, t: 3 } } };
    }, function() {
      it('should reset current damage', function() {
        expect(this.context.state.dmg)
          .toEqual({ n: 0, t: 0 });
      });
    });

    context('when damage type is jack', function() {
      this.model = { state: { info: ['info'], dmg: {
        'col1': [ 0, 1, 1, 0 ],
        'col2': [ 0, 1, 0, 0 ],
        'col3': [ 0, 1, 0, 1 ],
        f: 3,
        t: 5
      } } };
    }, function() {
      it('should reset current damage', function() {
        expect(this.context.state.dmg).toEqual({
          'col1': [ 0, 0, 0, 0 ],
          'col2': [ 0, 0, 0, 0 ],
          'col3': [ 0, 0, 0, 0 ],
          f: 0,
          t: 0
        });
      });
    });
  });

  context('setWarriorDamage(<factions>, <i>)', function() {
    return this.modelModel
      .setWarriorDamageP('factions', this.i, this.model);
  }, function() {
    beforeEach(function() {
      this.gameFactionsModel.getModelInfoP
        .resolveWith({ damage: { n: 10 } });
    });

    context('when <i> is different from current damage', function() {
      this.model = { state: { info: ['info'], dmg: { n: 3, t: 3 } } };
      this.i = 5;
    }, function() {
      it('should set current damage to <i>', function() {
        expect(this.context.state.dmg)
          .toEqual({ n: 5, t: 5 });
      });
    });

    context('when <i> equals from current damage', function() {
      this.model = { state: { info: ['info'], dmg: { n: 3, t: 3 } } };
      this.i = 3;
    }, function() {
      it('should reset current damage', function() {
        expect(this.context.state.dmg).toEqual({ n: 0, t: 0 });
      });
    });

    context('<i> exceeds info damage', function() {
      this.model = { state: { info: ['info'], dmg: { n: 3, t: 3 } } };
      this.i = 15;
    }, function() {
      it('should set maximum info damage', function() {
        expect(this.context.state.dmg).toEqual({ n: 10, t: 10 });
      });
    });
  });

  context('setFieldDamage(<factions>, <i>)', function() {
    return this.modelModel
      .setFieldDamageP('factions', this.i, this.model);
  }, function() {
    beforeEach(function() {
      this.gameFactionsModel.getModelInfoP
        .resolveWith({ damage: { field: 10 } });
    });

    context('when <i> is different from current field damage', function() {
      this.model = { state: { info: ['info'], dmg: { f: 3 } } };
      this.i = 5;
    }, function() {
      it('should set current field damage to <i>', function() {
        expect(this.context.state.dmg).toEqual({ f: 5 });
      });
    });

    context('<i> equals from current field damage', function() {
      this.model = { state: { info: ['info'], dmg: { f: 3 } } };
      this.i = 3;
    }, function() {
      it('should reset current damage', function() {
        expect(this.context.state.dmg).toEqual({ f: 0 });
      });
    });

    context('<i> exceeds info field damage', function() {
      this.model = { state: { info: ['info'], dmg: { f: 3 } } };
      this.i = 15;
    }, function() {
      it('should set maximum info damage', function() {
        expect(this.context.state.dmg).toEqual({ f: 10 });
      });
    });
  });

  context('setGridDamage(<factions>, <line>, <col>)', function() {
    return this.modelModel
      .setGridDamageP('factions', this.line, this.col, this.model);
  }, function() {
    beforeEach(function() {
      this.gameFactionsModel.getModelInfoP
        .resolveWith({ damage: { 'col': [ null, 'b', 'b', null ] } });
      this.col = 'col';
    });

    example(function(e, d) {
      context('when <line,col> is a valid box, '+d, function() {
        this.line = e.line;
        this.model = { state: { info: ['info'], dmg: {
          col: e.current
        } } };
      }, function() {
        it('should set current box damage', function() {
          expect(this.context.state.dmg).toEqual(e.result);
        });
      });
    }, [
      [ 'current'     , 'line' , 'result' ],
      [ [ 0, 0, 0, 0 ], 1      , { col: [ 0, 1, 0, 0 ], t: 1 } ],
      [ [ 0, 0, 1, 0 ], 1      , { col: [ 0, 1, 1, 0 ], t: 2 } ],
      [ [ 0, 1, 1, 0 ], 1      , { col: [ 0, 0, 1, 0 ], t: 1 } ],
    ]);

    example(function(e, d) {
      context('when <line,col> is not a valid box, '+d, function() {
        this.line = e.line;
        this.model = { state: { info: ['info'], dmg: {
          col: e.current
        } } };
      }, function() {
        it('should not set current box damage', function() {
          expect(this.context.state.dmg).toEqual(e.result);
        });
      });
    }, [
      [ 'current'     , 'line', 'result' ],
      [ [ 0, 0, 0, 0 ], 0     , { col: [ 0, 0, 0, 0 ], t: 0 } ],
      [ [ 0, 0, 1, 0 ], 3     , { col: [ 0, 0, 1, 0 ], t: 1 } ],
    ]);
  });

  context('setGridColDamage(<factions>, <col>)', function() {
    return this.modelModel
      .setGridColDamageP('factions', this.col, this.model);
  }, function() {
    beforeEach(function() {
      this.gameFactionsModel.getModelInfoP.resolveWith({
        damage: { 'col1': [ null, 'b', 'b', null ],
                  'col2': [  'b', 'b', 'b', null ],
                  'col3': [ null, 'b', 'b',  'b' ] }
      });
    });

    example(function(e, d) {
      context('when <col> is not full, '+d, function() {
        this.col = e.col;
        this.model = { state: { info: ['info'], dmg: e.current } };
      }, function() {
        it('should set full damage to <col>', function() {
          expect(this.context.state.dmg).toEqual(e.result);
        });
      });
    }, [
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
    ]);

    example(function(e, d) {
      context('when <col> is full, '+d, function() {
        this.col = e.col;
        this.model = { state: { info: ['info'], dmg: e.current } };
      }, function() {
        it('should clear all damage from <col>', function() {
          expect(this.context.state.dmg).toEqual(e.result);
        });
      });
    }, [
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
    ]);
  });
});
