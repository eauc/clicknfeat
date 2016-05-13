describe('commands model', function() {
  beforeEach(inject([ 'commands', function(commandsModel) {
    this.commandsModel = commandsModel;

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

  context('executeP(<name>, <args>, <state>, <game>)', function() {
    return this.commandsModel
      .executeP(this.name, this.args, this.game);
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
          'Game: unknown command "unknown"'
        ]);
      });
    });

    example(function(e, d) {
      context('when <name> is known, '+d, function() {
        this.name = e.cmd;
      }, function() {
        it('should proxy <name>.execute', function() {
          expect(this[e.cmd].executeP)
            .toHaveBeenCalledWith('arg1', 'arg2', this.game);
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
      .replayP(this.cmd, 'game');
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
          .toEqual(['Game: unknown command "unknown"']);
      });
    });

    example(function(e, d) {
      context('when <ctxt.type> is known, '+d, function() {
        this.cmd = { type: e.cmd };
      }, function() {
        it('should proxy <name>.replayP', function() {
          expect(this[e.cmd].replayP)
            .toHaveBeenCalledWith({ type: e.cmd }, 'game');

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

  context('replayBatchP(<cmds>, <scope>, <game>)', function() {
    return this.commandsModel
      .replayBatchP(this.cmds, 'game');
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
        .toHaveBeenCalledWith('cmd1', 'game');
      expect(this.commandsModel.replayP)
        .toHaveBeenCalledWith('cmd2', 'game');
      expect(this.commandsModel.replayP)
        .toHaveBeenCalledWith('cmd3', 'game');

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
          .toHaveBeenCalledWith('cmd1', 'game');
        expect(this.commandsModel.replayP)
          .toHaveBeenCalledWith('cmd2', 'game');
        expect(this.commandsModel.replayP)
          .toHaveBeenCalledWith('cmd3', 'game');
      });
    });
  });

  context('undoP(<ctxt>, <state>, <arg>)', function() {
    return this.commandsModel.undoP({
      type: this.type
    }, 'game');
  }, function() {
    beforeEach(function() {
      this.cmd1.undoP.and.returnValue('cmd1.undoP.returnValue');
      this.cmd2.undoP.and.returnValue('cmd2.undoP.returnValue');
    });

    context('when <ctxt.type> is unknown', function() {
      this.type = 'unknown';
      this.expectContextError();
    }, function() {
      it('should discard command', function() {
        expect(this.contextError).toEqual([
          'Game: unknown command "unknown"'
        ]);
      });
    });

    example(function(e, d) {
      context('when <ctxt.type> is known, '+d, function() {
        this.type = e.cmd;
      }, function() {
        it('should proxy <ctxt.type>.undo', function() {
          expect(this[e.cmd].undoP)
            .toHaveBeenCalledWith({
              type: e.cmd
            }, 'game');

          expect(this.context)
            .toBe(e.cmd+'.undoP.returnValue');
        });
      });
    }, [
      [ 'cmd' ],
      [ 'cmd1' ],
      [ 'cmd2' ],
    ]);

    context('when undo fails', function() {
      spyReturnPromise(this.cmd1.undoP);
      this.cmd1.undoP.rejectWith('reason');
      this.type = 'cmd1';
      this.expectContextError();
    }, function() {
      it('should reject promise', function() {
        expect(this.contextError).toEqual([
          'reason'
        ]);
      });
    });
  });
});
