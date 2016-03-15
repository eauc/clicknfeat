describe('setSegmentCommand model', function() {
  beforeEach(inject([ 'setSegmentCommand', function(setSegmentCommand) {
    this.gameLosModel = spyOnService('gameLos');
    this.gameLosModel.saveRemoteState.and.callFake((r) => {
      return r+'Save';
    });

    this.setSegmentCommandModel = setSegmentCommand('type', this.gameLosModel);

    this.state = jasmine.createSpyObj('state', [
      'queueChangeEventP'
    ]);
    this.game = { type: 'type' };
  }]));

  context('executeP(<method>, <...args...>, <state>, <game>)', function() {
    return this.setSegmentCommandModel
      .executeP(this.method, ['args'], this.state, this.game);
  }, function() {
    context('<method> does not exist', function() {
      this.method = 'unknown';
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'Type unknown method "unknown"'
        ]);
      });
    });

    context('<method> exists', function() {
      this.method = 'setRemote';
    }, function() {
      it('should save previous remote segment state', function() {
        expect(this.context[0].before).toEqual('typeSave');
      });

      it('should apply <method> on game segment', function() {
        expect(this.gameLosModel.setRemote)
          .toHaveBeenCalledWith('args', this.state, this.game, 'type');
        expect(this.context[1].type)
          .toBe('gameLos.setRemote.returnValue');
      });

      it('should save new remote segment state', function() {
        expect(this.context[0].after)
          .toBe('gameLos.setRemote.returnValueSave');
      });
    });
  });

  example(function(e) {
    context(e.method+'(<ctxt>, <state>, <game>)', function() {
      return this.setSegmentCommandModel[e.method](this.ctxt, this.state, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: 'before',
          after: 'after'
        };
        this.game = { type: e.previous };
      });

      it('should set game remote segment', function() {
        expect(this.gameLosModel.resetRemote)
          .toHaveBeenCalledWith(e.result, this.state, this.game, e.previous);
        expect(this.context.type)
          .toBe('gameLos.resetRemote.returnValue');
      });
    });
  }, [
    [ 'method'  , 'previous' , 'result' ],
    [ 'replayP' , 'before'   , 'after'  ],
    [ 'undoP'   , 'after'    , 'before' ],
  ]);
});
