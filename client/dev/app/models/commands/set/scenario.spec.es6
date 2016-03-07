describe('set scenario', function() {
  describe('setScenarioCommand model', function() {
    beforeEach(inject([
      'setScenarioCommand',
      function(setScenarioCommand) {
        this.setScenarioCommandModel = setScenarioCommand;
        this.state = jasmine.createSpyObj('state', [
          'queueChangeEventP'
        ]);
      }
    ]));

    context('execute(<scenario>, <state>, <game>)', function() {
      return this.setScenarioCommandModel.executeP({
        name: 'after_name'
      }, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.game = { scenario: 'before' };
      });

      it('should set game scenario', function() {
        expect(this.context[1].scenario)
          .toEqual({ name: 'after_name' });
      });

      it('should send changeScenario event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.scenario.change');
      });

      it('should return context', function() {
        expect(this.context[0]).toEqual({
          before: 'before',
          after: { name: 'after_name' },
          desc: 'after_name'
        });
      });
    });

    example(function(e) {
      context(e.method+'(<ctxt>, <state>, <game>)', function() {
        return this.setScenarioCommandModel[e.method](this.ctxt, this.state, this.game);
      }, function() {
        beforeEach(function() {
          this.ctxt = {
            before: 'before',
            after: 'after'
          };

          this.game = { scenario: e.previous };
        });

        it('should set game scenario', function() {
          expect(this.context.scenario).toBe(e.result);
        });

        it('should send changeScenario event', function() {
          expect(this.state.queueChangeEventP)
            .toHaveBeenCalledWith('Game.scenario.change');
        });
      });
    }, [
      [ 'method'  , 'previous' , 'result' ],
      [ 'replayP' , 'before'   , 'after'  ],
      [ 'undoP'   , 'after'    , 'before' ],
    ]);
  });
});
