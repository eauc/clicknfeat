'use strict';

describe('set scenario', function() {
  describe('setupCtrl', function(c) {
    beforeEach(inject([
      '$rootScope',
      '$controller',
      function($rootScope,
               $controller) {
        this.gameScenarioService = spyOnService('gameScenario');
        this.gameService = spyOnService('game');

        this.createController = function() {
          this.scope = $rootScope.$new();
          this.scope.game = { board: {}, scenario: {} };
          this.scope.scenarios = ['scenarios'];

          $controller('gameSetupCtrl', { 
            '$scope': this.scope,
          });
          $rootScope.$digest();
        };
        this.createController();
      }
    ]));

    when('user set scenario', function() {
      this.scope.scenario_name = 'name';
      this.scope.scenario_group = 'group';
      this.scope.doSetScenario();
    }, function() {
      it('should find scenario_name in scenarios', function() {
        expect(this.gameScenarioService.forName)
          .toHaveBeenCalledWith('name','group');
      });

      it('should execute setScenario command', function() {
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('setScenario',
                                'gameScenario.forName.returnValue',
                                this.scope,
                                this.scope.game);
      });
    });
  });

  describe('setScenarioCommand service', function() {
    beforeEach(inject([ 'setScenarioCommand', function(setScenarioCommand) {
      this.setScenarioCommandService = setScenarioCommand;
    }]));

    describe('execute(<scenario>, <scope>, <game>)', function() {
      beforeEach(function() {
        this.scope = jasmine.createSpyObj('scope', ['gameEvent']);
        this.game = { scenario: 'before' };

        this.ctxt = this.setScenarioCommandService.execute('after', this.scope, this.game);
      });
      
      it('should set game scenario', function() {
        expect(this.game.scenario).toBe('after');
      });
      
      it('should send changeScenario event', function() {
        expect(this.scope.gameEvent)
          .toHaveBeenCalledWith('changeScenario');
      });
      
      it('should return context', function() {
        expect(this.ctxt).toEqual({
          before: 'before',
          after: 'after'
        });
      });
    });

    using([
      [ 'method', 'previous', 'result' ],
      [ 'replay', 'before'  , 'after'  ],
      [ 'undo'  , 'after'   , 'before' ],
    ], function(e, d) {
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
  });
});
