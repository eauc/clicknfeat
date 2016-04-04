describe('onElementsCommand model', function() {
  beforeEach(inject([
    'onElementsCommand',
    function(onElementsCommandModel) {
      this.elementModel = spyOnService('terrain');
      this.gameElementsModel = spyOnService('gameTerrains');
      this.gameElementsModel.findStamp.and.callFake((s) => {
        return { state: { stamp: s } };
      });
      this.gameElementSelectionModel = spyOnService('gameTerrainSelection');

      this.onElementsCommandModel =
        onElementsCommandModel('type',
                               this.elementModel,
                               this.gameElementsModel,
                               this.gameElementSelectionModel);

      this.game = { types: 'elements',
                    type_selection: 'selection' };
    }
  ]));

  context('executeP(<method>, <..args..>, <stamps>, <state>, <game>)', function() {
    return this.onElementsCommandModel
      .executeP(this.method, this.args, this.stamps, this.game);
  }, function() {
    beforeEach(function() {
      this.args = ['arg1', 'arg2'];
      this.stamps = ['stamp1', 'stamp2'];

      this.gameElementsModel.fromStampsP.resolveWith((m) => {
        return `gameElements.fromStampsP.returnValue(${m})`;
      });
      this.gameElementsModel.onStampsP.resolveWith((m) => {
        return `gameElements.onStampsP.returnValue(${m})`;
      });
    });

    context('when elementModel does not respond to <method> ', function() {
      this.method = 'whatever';
      this.expectContextError();
    }, function() {
      it('should reject command', function() {
        expect(this.gameElementsModel.onStampsP)
          .not.toHaveBeenCalled();

        expect(this.contextError).toEqual([
          'Unknown method "whatever" on type'
        ]);
      });
    });

    context('when elementModel responds to <method> ', function() {
      this.method = 'setState';
    }, function() {
      it('should save <stamps> states before change', function() {
        expect(this.gameElementsModel.fromStampsP)
          .toHaveBeenCalledWith('saveState', [], this.stamps, 'elements');
        expect(this.context[0].before)
          .toEqual('gameElements.fromStampsP.returnValue(saveState)');
      });

      it('should apply <method> on <stamps>', function() {
        expect(this.gameElementsModel.onStampsP)
          .toHaveBeenCalledWith(this.method, this.args, this.stamps, 'elements');
        expect(this.context[1].types)
          .toBe('gameElements.onStampsP.returnValue(setState)');
      });

      it('should save <stamps> states after change', function() {
        expect(this.gameElementsModel.fromStampsP)
          .toHaveBeenCalledWith('saveState', [], this.stamps, 'elements');
        expect(this.context[0].after)
          .toEqual('gameElements.fromStampsP.returnValue(saveState)');
      });

      it('should return context', function() {
        expect(this.context[0])
          .toEqual({
            before: 'gameElements.fromStampsP.returnValue(saveState)',
            after: 'gameElements.fromStampsP.returnValue(saveState)',
            desc: 'setState'
          });
      });
    });
  });

  example(function(e) {
    context(e.method+'(<ctxt>, <state>, <game>)', function() {
      return this.onElementsCommandModel[e.method](this.ctxt, this.game);
    }, function() {
      beforeEach(function() {
        this.ctxt = {
          before: [ { stamp: 'before1' }, { stamp: 'before2' } ],
          after: [ { stamp: 'after1' }, { stamp: 'after2' } ]
        };
      });

      it('should set <'+e.state+'> states', function() {
        expect(this.gameElementsModel.setStateStamps)
          .toHaveBeenCalledWith(this.ctxt[e.state],
                                [e.state+'1',e.state+'2'],
                                'elements');
        expect(this.context.types)
            .toBe('gameTerrains.setStateStamps.returnValue');
      });

      it('should set remote elementSelection to modified elements', function() {
        expect(this.gameElementSelectionModel.set)
          .toHaveBeenCalledWith('remote', [e.state+'1', e.state+'2'],
                                'selection');
        expect(this.context.type_selection)
          .toBe('gameTerrainSelection.set.returnValue');
      });
    });
  }, [
    [ 'method'  , 'state'  ],
    [ 'replayP' , 'after'  ],
    [ 'undoP'   , 'before' ],
  ]);
});
