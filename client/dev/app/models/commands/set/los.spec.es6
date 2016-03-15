describe('setLosCommand model', function() {
  beforeEach(inject([ 'setLosCommand', function(setLosCommand) {
    this.setLosCommandModel = setLosCommand;

    this.gameLosModel = spyOnService('gameLos');
    this.gameLosModel.saveRemoteState.and.callFake((r) => {
      return r+'Save';
    });

    this.state = jasmine.createSpyObj('state', [
      'queueChangeEventP'
    ]);
    this.game = { los: 'los' };
  }]));

  context('executeP(<method>, <...args...>, <state>, <game>)', function() {
    return this.setLosCommandModel
      .executeP(this.method, ['args'], this.state, this.game);
  }, function() {
    context('<method> does not exist', function() {
      this.method = 'unknown';
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'Los unknown method "unknown"'
        ]);
      });
    });

    context('<method> exists', function() {
      this.method = 'setRemote';
    }, function() {
      it('should save previous remote los state', function() {
        expect(this.context[0].before).toEqual('losSave');
      });

      it('should apply <method> on game los', function() {
        expect(this.gameLosModel.setRemote)
          .toHaveBeenCalledWith('args', this.state, this.game, 'los');
        expect(this.context[1].los)
          .toBe('gameLos.setRemote.returnValue');
      });

      it('should save new remote los state', function() {
        expect(this.context[0].after)
          .toBe('gameLos.setRemote.returnValueSave');
      });
    });
  });

  example(function(e) {
    context(e.method+'(<ctxt>, <state>, <game>)', function() {
      return this.setLosCommandModel[e.method](this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: 'before',
          after: 'after'
        };
        this.game = { 'los': e.previous };
      });

      it('should set game remote los', function() {
        expect(this.gameLosModel.resetRemote)
          .toHaveBeenCalledWith(e.result, this.state, this.game, e.previous);
        expect(this.context.los)
          .toBe('gameLos.resetRemote.returnValue');
      });
    });
  }, [
    [ 'method'  , 'previous' , 'result' ],
    [ 'replayP' , 'before'   , 'after'  ],
    [ 'undoP'   , 'after'    , 'before' ],
  ]);
});
