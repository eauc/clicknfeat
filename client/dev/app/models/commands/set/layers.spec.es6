describe('setLayersCommand model', function() {
  beforeEach(inject([
    'setLayersCommand',
    function(setLayersCommand) {
      this.setLayersCommandModel = setLayersCommand;

      this.gameLayersModel = spyOnService('gameLayers');
    }
  ]));

  context('executeP(<cmd>, <layer>, <state>, <game>)', function() {
    return this.setLayersCommandModel
      .executeP(this.cmd, 'l', this.game);
  }, function() {
    beforeEach(function() {
      this.game = { layers: 'before' };
    });

    context('when gameLayers model does not respond to <cmd>', function() {
      this.cmd = 'whatever';
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'Layers unknown method "whatever"'
        ]);
      });
    });

    context('when gameLayers model responds to <cmd>', function() {
      this.cmd = 'toggle';
    }, function() {
      it('should execute <cmd>', function() {
        expect(this.gameLayersModel[this.cmd])
          .toHaveBeenCalledWith('l', 'before');
      });

      it('should return ctxt', function() {
        expect(this.context[0])
          .toEqual({
            before: 'before',
            desc: 'toggle(l)',
            after: 'gameLayers.toggle.returnValue'
          });
      });
    });
  });

  example(function(e) {
    context(e.method+'(<ctxt>, <state>, <game>)', function() {
      return this.setLayersCommandModel[e.method](this.ctxt, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: 'before',
          after: 'after'
        };

        this.game = { layers: e.previous };
      });

      it('should set game layers', function() {
        expect(this.context.layers).toBe(e.result);
      });
    });
  }, [
    [ 'method' , 'previous', 'result' ],
    [ 'replayP', 'before'  , 'after'  ],
    [ 'undoP'  , 'after'   , 'before' ],
  ]);
});
