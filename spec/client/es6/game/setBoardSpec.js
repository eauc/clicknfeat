describe('set board', function() {
  describe('setBoardCommand service', function() {
    beforeEach(inject([ 'setBoardCommand', function(setBoardCommand) {
      this.setBoardCommandService = setBoardCommand;
    }]));

    describe('execute(<board>, <state>, <game>)', function() {
      beforeEach(function() {
        this.state = jasmine.createSpyObj('state', ['changeEvent']);

        let game = { board: 'before' };
        [this.ctxt, this.game] = this.setBoardCommandService.execute({
          name: 'after_name'
        }, this.state, game);
      });
      
      it('should set game board', function() {
        expect(this.game.board)
          .toEqual({ name: 'after_name' });
      });
      
      it('should send changeBoard event', function() {
        expect(this.state.changeEvent)
          .toHaveBeenCalledWith('Game.board.change');
      });
      
      it('should return context', function() {
        expect(this.ctxt).toEqual({
          before: 'before',
          after: { name: 'after_name' },
          desc: 'after_name'
        });
      });
    });

    using([
      [ 'method', 'previous', 'result' ],
      [ 'replay', 'before'  , 'after'  ],
      [ 'undo'  , 'after'   , 'before' ],
    ], function(e) {
      describe(e.method+'(<ctxt>, <state>, <game>)', function() {
        beforeEach(function() {
          this.ctxt = {
            before: 'before',
            after: 'after'
          };
          this.state = jasmine.createSpyObj('state', ['changeEvent']);

          let game = { board: e.previous };
          this.game = this.setBoardCommandService[e.method](this.ctxt, this.state, game);
        });
      
        it('should set game board', function() {
          expect(this.game.board).toBe(e.result);
        });
      
        it('should send changeBoard event', function() {
          expect(this.state.changeEvent)
            .toHaveBeenCalledWith('Game.board.change');
        });
      });
    });
  });

  describe('gameBoard service', function() {
    beforeEach(inject([ 'gameBoard', function(gameBoardService) {
      this.gameBoardService = gameBoardService;
    }]));

    describe('forName(<name>)', function() {
      beforeEach(function() {
        this.boards = [
          { name: 'board1', view: 'view1' },
          { name: 'board2', view: 'view2' },
          { name: 'board3', view: 'view3' },
        ];
      });

      using([
        [ 'name'  , 'board' ],
        [ 'board1', { name: 'board1', view: 'view1' } ],
        [ 'board3', { name: 'board3', view: 'view3' } ],
        [ 'unknown', undefined ],
        [ null, undefined ],
      ], function(e, d) {
        it('should find board with <name>, '+d, function() {
          expect(this.gameBoardService.forName(e.name, this.boards))
            .toEqual(e.board);
        });
      });
    });
  });
});
