describe('undo commands', function() {
  describe('gameConnectionService', function() {
    beforeEach(inject([ 'gameConnection', function(gameConnectionService) {
      this.gameConnectionService = gameConnectionService;
    }]));

    when('sendUndoCommand(<cmd>, <game>)', function() {
      this.ret = this.gameConnectionService
        .sendUndoCommand(this.cmd, this.game);
    }, function() {
      beforeEach(function() {
        this.cmd = 'cmd';
        this.game = { undo_log: [ 'log1' ] };

        spyOn(this.gameConnectionService, 'sendEvent');
        this.gameConnectionService.sendEvent$ =
          R.curryN(2, this.gameConnectionService.sendEvent);
        mockReturnPromise(this.gameConnectionService.sendEvent);
        this.gameConnectionService.sendEvent
          .resolveWith = this.game;
      });

      it('should send "undoCmd" event', function() {
        expect(this.gameConnectionService.sendEvent)
          .toHaveBeenCalledWith({
            type: 'undoCmd',
            cmd: 'cmd'
          }, this.game);
      });

      it('should append <cmd> to undo log', function() {
        this.thenExpect(this.ret, (result) => {
          expect(result)
            .toEqual({
              undo_log: [ 'log1', 'cmd' ]
            });
        });
      });
    });
  });
});
