'use strict';

describe('execute commands', function() {
  describe('commandsService', function(c) {
    beforeEach(inject([ 'commands', function(commandsService) {
      this.commandsService = commandsService;
      this.cmd1 = jasmine.createSpyObj('cmd1', [
        'execute', 'replay', 'undo'
      ]);
      this.cmd1.execute.and.returnValue({ 'returnValue': 'cmd1' });
      this.cmd2 = jasmine.createSpyObj('cmd2', [
        'execute', 'replay', 'undo'
      ]);
      this.cmd2.execute.and.returnValue({ 'returnValue': 'cmd2' });
      this.commandsService.registerCommand('cmd1',this.cmd1);
      this.commandsService.registerCommand('cmd2',this.cmd2);
    }]));

    describe('replay(<ctxt>, <scope>, <game>)', function() {
      when('<ctxt.type> is unknown', function() {
        this.ret = this.commandsService.replay({ type: 'unknown' }, 'scope', 'game');
      }, function() {
        it('should discard command', function() {
          expect(this.cmd1.replay)
            .not.toHaveBeenCalled();
          expect(this.cmd2.replay)
            .not.toHaveBeenCalled();
        });
      });

      using([
        [ 'cmd' ],
        [ 'cmd1' ],
        [ 'cmd2' ],
      ], function(e, d) {
        when('<ctxt.type> is known, '+d, function() {
          this.ret = this.commandsService.replay({ type: e.cmd }, 'scope', 'game');
        }, function() {
          it('should proxy <name>.replay', function() {
            expect(this[e.cmd].replay)
              .toHaveBeenCalledWith({ type: e.cmd }, 'scope', 'game');
          });
        });
      });
    });
  });
});
