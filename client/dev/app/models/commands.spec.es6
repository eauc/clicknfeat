describe('commandsModel', function() {
  beforeEach(inject([ 'commands', function(commandsModel) {
    this.commandsModel = commandsModel;

    this.state = { state: 'state' };
    this.game = { game: 'game' };
    this.game = { game: 'game' };
    this.cmd1 = jasmine.createSpyObj('cmd1', [
      'executeP', 'replayP', 'undoP'
    ]);
    this.cmd2 = jasmine.createSpyObj('cmd2', [
      'executeP', 'replayP', 'undoP'
    ]);

    this.commandsModel.registerCommand('cmd1',this.cmd1);
    this.commandsModel.registerCommand('cmd2',this.cmd2);
  }]));

  context('execute(<name>, <args>, <state>, <game>)', function() {
    return this.commandsModel
      .executeP(this.name, this.args, this.state, this.game);
  }, function() {
    beforeEach(function() {
      this.cmd1.executeP.and.returnValue([
        { returnValue: 'cmd1' },
        this.game
      ]);
      this.cmd2.executeP.and.returnValue([
        { 'returnValue': 'cmd2' },
        this.game
      ]);

      this.args = ['arg1', 'arg2'];
    });

    context('when <name> is unknown', function() {
      this.name = 'unknown';
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'Game: execute unknown command "unknown"'
        ]);
      });
    });

    example(function(e, d) {
      context('when <name> is known, '+d, function() {
        this.name = e.cmd;
      }, function() {
        it('should proxy <name>.execute', function() {
          expect(this[e.cmd].executeP)
            .toHaveBeenCalledWith('arg1', 'arg2', this.state, this.game);
        });

        it('should return context', function() {
          expect(this.context).toEqual([
            { type: e.cmd, returnValue: e.cmd },
            this.game
          ]);
        });
      });
    }, [
      [ 'cmd' ],
      [ 'cmd1' ],
      [ 'cmd2' ],
    ]);

    context('when <name>.execute reject promise', function() {
      spyReturnPromise(this.cmd1.executeP);
      this.cmd1.executeP.rejectWith('reason');
      this.name = 'cmd1';
      this.expectContextError();
    }, function() {
      it('should also reject promise', function() {
        expect(this.contextError)
          .toEqual(['reason']);
      });
    });
  });

  context('replayP(<ctxt>, <scope>, <game>)', function() {
    return this.commandsModel
      .replayP(this.cmd, 'state', 'game');
  }, function() {
    beforeEach(function() {
      this.cmd1.replayP.and.returnValue('cmd1.returnValue');
      this.cmd2.replayP.and.returnValue('cmd2.returnValue');
    });

    context('when <ctxt.type> is unknown', function() {
      this.cmd = { type: 'unknown' };
      this.expectContextError();
    }, function() {
      it('should discard command', function() {
        expect(this.contextError)
          .toEqual(['Game: replay unknown command "unknown"']);
      });
    });

    example(function(e, d) {
      context('when <ctxt.type> is known, '+d, function() {
        this.cmd = { type: e.cmd };
      }, function() {
        it('should proxy <name>.replayP', function() {
          expect(this[e.cmd].replayP)
            .toHaveBeenCalledWith({ type: e.cmd }, 'state', 'game');

          expect(this.context).toBe(e.cmd+'.returnValue');
        });
      });
    }, [
      [ 'cmd'  ],
      [ 'cmd1' ],
      [ 'cmd2' ],
    ]);

    context('when replay fails', function() {
      spyReturnPromise(this.cmd1.replayP)
        .rejectWith('reason');
      this.cmd = { type: 'cmd1' };
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError)
          .toEqual(['reason']);
      });
    });
  });

  context('replayBatch(<cmds>, <scope>, <game>)', function() {
    return this.commandsModel
      .replayBatchP(this.cmds, 'state', 'game');
  }, function() {
    beforeEach(function() {
      spyOnPromise(this.commandsModel, 'replayP');

      this.replay = '';
      this.commandsModel.replayP.resolveWith((c) => {
        this.replay += c;
        return 'game';
      });

      this.cmds = [ 'cmd1', 'cmd2', 'cmd3' ];
    });

    it('should replay each command in batch in order', function() {
      expect(this.commandsModel.replayP)
        .toHaveBeenCalledWith('cmd1', 'state', 'game');
      expect(this.commandsModel.replayP)
        .toHaveBeenCalledWith('cmd2', 'state', 'game');
      expect(this.commandsModel.replayP)
        .toHaveBeenCalledWith('cmd3', 'state', 'game');

      expect(this.replay).toBe('cmd1cmd2cmd3');
    });

    context('some command fails', function() {
      this.commandsModel.replayP.resolveWith((c) => {
        return ( c === 'cmd2'
                 ? self.Promise.reject('reason')
                 : 'game'
               );
      });
    }, function() {
      it('should still replay all commands in batch', function() {
        expect(this.commandsModel.replayP)
          .toHaveBeenCalledWith('cmd1', 'state', 'game');
        expect(this.commandsModel.replayP)
          .toHaveBeenCalledWith('cmd2', 'state', 'game');
        expect(this.commandsModel.replayP)
          .toHaveBeenCalledWith('cmd3', 'state', 'game');
      });
    });
  });
});
