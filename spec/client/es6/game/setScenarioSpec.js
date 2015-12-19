'use strict';

describe('set scenario', function() {
  describe('setScenarioCommand service', function() {
    beforeEach(inject([ 'setScenarioCommand', function(setScenarioCommand) {
      this.setScenarioCommandService = setScenarioCommand;
    }]));

    describe('execute(<scenario>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        this.game = { scenario: 'before' };

        this.ctxt = this.setScenarioCommandService.execute({
          name: 'after_name'
        }, this.scope, this.game);
      });
      
      it('should set game scenario', function() {
        expect(this.game.scenario).toEqual({ name: 'after_name' });
      });
      
      it('should send changeScenario event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeScenario');
      });
      
      it('should return context', function() {
        expect(this.ctxt).toEqual({
          before: 'before',
          after: { name: 'after_name' },
          desc: 'after_name',
        });
      });
    });

    using([
      [ 'method', 'previous', 'result' ],
      [ 'replay', 'before'  , 'after'  ],
      [ 'undo'  , 'after'   , 'before' ],
    ], function(e) {
      describe(e.method+'(<ctxt>, <scope>, <game>)', function() {
        beforeEach(function() {
          this.ctxt = {
            before: 'before',
            after: 'after'
          };
          this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
          this.game = { scenario: e.previous };

          this.setScenarioCommandService[e.method](this.ctxt, this.scope, this.game);
        });
      
        it('should set game scenario', function() {
          expect(this.game.scenario).toBe(e.result);
        });
      
        it('should send changeScenario event', function() {
          expect(this.scope.gameEvent)
            .toHaveBeenCalledWith('changeScenario');
        });
      });
    });
  });

  describe('gameScenario service', function() {
    beforeEach(inject([ 'gameScenario', function(gameScenarioService) {
      this.gameScenarioService = gameScenarioService;
    }]));

    describe('forName(<name>)', function() {
      beforeEach(function() {
        this.group = [ 'group', [
          { name: 'scenario1' },
          { name: 'scenario2' },
          { name: 'scenario3' },
        ] ];
      });

      using([
        [ 'name'  , 'scenario' ],
        [ 'scenario1', { name: 'scenario1' } ],
        [ 'scenario3', { name: 'scenario3' } ],
        [ 'unknown', undefined ],
        [ null, undefined ],
      ], function(e, d) {
        it('should find scenario with <name>, '+d, function() {
          expect(this.gameScenarioService.forName(e.name, this.group))
            .toEqual(e.scenario);
        });
      });
    });

    describe('group(<group_name>)', function() {
      beforeEach(function() {
        this.groups = [
          [ 'group1', [ 'gr1' ] ],
          [ 'group2', [ 'gr2' ] ],
          [ 'group3', [ 'gr3' ] ],
        ];
      });

      using([
        [ 'name'  , 'group' ],
        [ 'group1', [ 'group1', [ 'gr1' ] ] ],
        [ 'group3', [ 'group3', [ 'gr3' ] ] ],
        [ 'unknown', undefined ],
        [ null, undefined ],
      ], function(e, d) {
        it('should find scenario group with <name>, '+d, function() {
          expect(this.gameScenarioService.group(e.name, this.groups))
            .toEqual(e.group);
        });
      });
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

      using([
        [ 'name'  , 'group' ],
        [ 'gr1scenario2', 0 ],
        [ 'gr2scenario3', 1 ],
        [ 'gr3scenario1', 2 ],
        [ 'unknown', undefined ],
        [ null, undefined ],
      ], function(e, d) {
        it('should find group for scenario with <name>, '+d, function() {
          expect(this.gameScenarioService.groupForName(e.name, this.groups))
            .toEqual(this.groups[e.group]);
        });
      });
    });

    when('createObjectives()', function() {
      this.ret = this.gameScenarioService
        .createObjectives(this.scenario);
    }, function() {
      when('scenario does not have objectives', function() {
        this.scenario = {};
      }, function() {
        it('should reject creation', function() {
          this.thenExpectError(this.ret, function(reason) {
            expect(reason).toBe('No objectives');
          });
        });
      });

      when('scenario has objectives', function() {
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
          this.thenExpect(this.ret, function(objectives) {
            expect(objectives).toEqual({
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
    });
  });
});
