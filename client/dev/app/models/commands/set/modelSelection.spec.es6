describe('setModelSelectionCommand model', function() {
  beforeEach(inject([
    'setModelSelectionCommand',
    function(setModelSelectionCommandModel) {
      this.setModelSelectionCommandModel = setModelSelectionCommandModel;
      this.gameModelSelectionModel = spyOnService('gameModelSelection');

      this.game = { model_selection: 'selection' };
    }
  ]));

  context('executeP(<method>, <stamps>, <game>)', function() {
    return this.setModelSelectionCommandModel
      .executeP(this.method, this.stamps, this.game);
  }, function() {
    beforeEach(function() {
      this.stamps = ['stamps1', 'stamp2' ];
      this.gameModelSelectionModel.get.and.returnValue({
        gameModelSelection: 'set.returnValue'
      });
    });

    context('when <method> exists', function() {
      this.method = 'set';
    }, function() {
      it('should proxy <method> on gameModelSelectionModel', function() {
        expect(this.gameModelSelectionModel[this.method])
          .toHaveBeenCalledWith('local', this.stamps, 'selection');
      });

      it('should return context', function() {
        [this.ctxt] = this.context;
        expect(this.ctxt)
          .toEqual({
            after: { gameModelSelection: 'set.returnValue' },
            desc: '',
            do_not_log: true
          });
      });
    });

    context('<method> does not exist', function() {
      this.method = 'whatever';
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.contextError).toEqual([
          'SetModelSelection unknown method whatever'
        ]);
      });
    });
  });

  context('replayP(<ctxt>, <game>)', function() {
    return this.setModelSelectionCommandModel
      .replayP(this.ctxt, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        after: [ 'stamp1', 'stamp2' ],
        desc: '',
        do_not_log: true
      };
    });

    it('should set remote selection to <ctxt.after>', function() {
      expect(this.gameModelSelectionModel.set)
        .toHaveBeenCalledWith('remote', [ 'stamp1', 'stamp2' ], 'selection');
    });
  });

  // UNUSED
  // describe('undo(<ctxt>, <state>, <game>)', function() {
  // });
});
