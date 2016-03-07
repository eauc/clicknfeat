describe('setBoardCommand model', function() {
  beforeEach(inject([
    'setBoardCommand',
    function(setBoardCommand) {
      this.setBoardCommandModel = setBoardCommand;

      this.state = jasmine.createSpyObj('state', [
        'queueChangeEventP'
      ]);
    }
  ]));

  context('executeP(<board>, <state>, <game>)', function() {
    return this.setBoardCommandModel.executeP({
      name: 'after_name'
    }, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.game = { board: 'before' };
    });

    it('should set game board', function() {
      const game = this.context[1];
      expect(game.board)
        .toEqual({ name: 'after_name' });
    });

    it('should send changeBoard event', function() {
      expect(this.state.queueChangeEventP)
        .toHaveBeenCalledWith('Game.board.change');
    });

    it('should return context', function() {
      const [ ctxt ] = this.context;
      expect(ctxt).toEqual({
        before: 'before',
        after: { name: 'after_name' },
        desc: 'after_name'
      });
    });
  });

  example(function(e) {
    context(e.method+'(<ctxt>, <state>, <game>)', function() {
      return this.setBoardCommandModel[e.method](this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: 'before',
          after: 'after'
        };
        this.game = { board: e.previous };
      });

      it('should set game board', function() {
        expect(this.context.board).toBe(e.result);
      });

      it('should send changeBoard event', function() {
        expect(this.state.queueChangeEventP)
          .toHaveBeenCalledWith('Game.board.change');
      });
    });
  }, [
    [ 'method'  , 'previous' , 'result' ],
    [ 'replayP' , 'before'   , 'after'  ],
    [ 'undoP'   , 'after'    , 'before' ],
  ]);
});
