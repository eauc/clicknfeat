describe('gameBoard model', function() {
  beforeEach(inject([
    'gameBoard',
    function(gameBoardModel) {
      this.gameBoardModel = gameBoardModel;
    }
  ]));

  context('forName(<name>)', function() {
    return this.gameBoardModel
      .forName(this.name, this.boards);
  }, function() {
    beforeEach(function() {
      this.boards = [
        { name: 'board1', view: 'view1' },
        { name: 'board2', view: 'view2' },
        { name: 'board3', view: 'view3' },
      ];
    });

    example(function(e, d) {
      context(d, function() {
        this.name = e.name;
      }, function() {
        it('should find board with <name>', function() {
          expect(this.context).toEqual(e.board);
        });
      });
    }, [
      [ 'name'    , 'board'          ],
      [ 'board1'  , { name: 'board1' , view: 'view1' } ],
      [ 'board3'  , { name: 'board3' , view: 'view3' } ],
      [ 'unknown' , undefined        ],
      [ null      , undefined        ],
    ]);
  });
});
