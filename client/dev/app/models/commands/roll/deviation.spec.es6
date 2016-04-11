describe('rollDeviationCommand model', function() {
  beforeEach(inject([
    'rollDeviationCommand',
    function(rollDeviationCommand) {
      this.rollDeviationCommandModel = rollDeviationCommand;

      this.onTemplatesCommandModel = spyOnService('onTemplatesCommand');

      this.game = { dice: [] };
    }
  ]));

  context('executeP(<stamps>, <game>)', function() {
    return this.rollDeviationCommandModel
      .executeP(['stamps'], this.game);
  }, function() {
    beforeEach(function() {
      const fake_dice = [5,4];
      let ndie = 0;
      spyOn(R, 'randomRange')
        .and.callFake(() => { return fake_dice[ndie++]; });

      this.onTemplatesCommandModel.executeP
        .resolveWith((_c_, _a_, _s_, g) => {
          return [
            { ctxt: 'onTemplatesCommand' },
            R.assoc('onTemplatesCommand', true, g)
          ];
        });
    });

    it('should deviate <stamps> templates', function() {
      expect(this.onTemplatesCommandModel.executeP)
        .toHaveBeenCalledWith('deviate', [5, 4], ['stamps'] , this.game);
    });

    it('should return updated game', function() {
      expect(this.context[1]).toEqual({
        dice: [  ],
        onTemplatesCommand: true
      });
    });

    it('should extend context', function() {
      expect(this.context[0]).toEqual({
        ctxt: 'onTemplatesCommand',
        desc: 'AoE deviation : direction 5, distance 4"',
        r: 5, d: 4
      });
    });
  });

  context('replayP(<ctxt>, <game>)', function() {
    return this.rollDeviationCommandModel
      .replayP(this.ctxt, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        desc: 'AoE deviation : direction 5, distance 4"',
        r: 5, d: 4
      };

      this.onTemplatesCommandModel.replayP
        .resolveWith((_c_, g) => {
          return R.assoc('onTemplatesCommand', true, g);
        });
    });

    it('should replay onTemplatesCommand', function() {
      expect(this.onTemplatesCommandModel.replayP)
        .toHaveBeenCalledWith(this.ctxt, this.game);
    });

    it('should return update game', function() {
      expect(this.context).toEqual({
        onTemplatesCommand: true,
        dice: [ { desc: 'AoE deviation : direction 5, distance 4"',
                  r: 5, d: 4 } ]
      });
    });
  });

  context('undoP(<ctxt>, <game>)', function() {
    return this.rollDeviationCommandModel
      .undoP(this.ctxt, this.game);
  }, function() {
    beforeEach(function() {
      this.ctxt = {
        stamp: 'ctxt'
      };
      this.game = { dice: [
        { stamp: 'other1' },
        { stamp: 'ctxt' },
        { stamp: 'other2' },
      ] };

      this.onTemplatesCommandModel.undoP
        .resolveWith((_c_, g) => {
          return R.assoc('onTemplatesCommand', true, g);
        });
    });

    it('should undo onTemplatesCommand', function() {
      expect(this.onTemplatesCommandModel.undoP)
        .toHaveBeenCalledWith(this.ctxt, this.game);
    });

    it('should return updated game', function() {
      expect(this.context).toEqual({
        onTemplatesCommand: true,
        dice: [
          { stamp: 'other1' },
          { stamp: 'other2' },
        ]
      });
    });
  });
});
