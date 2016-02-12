describe('replay commands', function() {
  describe('gameConnectionService', function() {
    beforeEach(inject([ 'gameConnection', function(gameConnectionService) {
      this.gameConnectionService = gameConnectionService;
    }]));

    when('sendReplayCommand(<cmd>, <game>)', function() {
      this.ret = this.gameConnectionService
        .sendReplayCommand(this.cmd, this.game);
    }, function() {
      beforeEach(function() {
        this.cmd = 'cmd';
        this.game = { commands_log: [ 'log1' ] };

        spyOn(this.gameConnectionService, 'sendEvent');
        this.gameConnectionService.sendEvent$ =
          R.curryN(2, this.gameConnectionService.sendEvent);
        mockReturnPromise(this.gameConnectionService.sendEvent);
        this.gameConnectionService.sendEvent
          .resolveWith = this.game;
      });

      it('should send "replayCmd" event', function() {
        expect(this.gameConnectionService.sendEvent)
          .toHaveBeenCalledWith({
            type: 'replayCmd',
            cmd: 'cmd'
          }, this.game);
      });

      it('should append <cmd> to replay log', function() {
        this.thenExpect(this.ret, (result) => {
          expect(result)
            .toEqual({
              commands_log: [ 'log1', 'cmd' ]
            });
        });
      });
    });
  });
});
