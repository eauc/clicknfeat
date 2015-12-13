'use strict';

describe('game chat', function() {
  describe('gameService', function() {
    beforeEach(inject([ 'game', function(gameService) {
      this.gameService = gameService;
      
      this.gameConnectionService = spyOnService('gameConnection');
      mockReturnPromise(this.gameConnectionService.sendEvent);
      this.gameConnectionService.sendEvent
        .resolveWith = 'gameConnection.sendEvent.returnValue';
    }]));

    when('sendChat(<from>, <msg>)', function() {
      this.ret = this.gameService
        .sendChat(this.from, this.msg, 'game');
    }, function() {
      beforeEach(function() {
        this.from = 'user';
        this.msg = 'hello';
      });

      it('should send chat event on connection', function() {
        this.thenExpect(this.ret, function() {
          expect(this.gameConnectionService.sendEvent)
            .toHaveBeenCalledWith({
              type: 'chat',
              chat: { from: this.from,
                      msg: this.msg
                    }
            }, 'game');
        });
      });
    });
  });
});
