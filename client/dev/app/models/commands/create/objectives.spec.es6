describe('createObjectivesCommand model', function() {
  beforeEach(inject([
    'createObjectivesCommand',
    function(createObjectivesCommandModel) {
      this.createObjectivesCommandModel = createObjectivesCommandModel;

      this.gameModelsModel = spyOnService('gameModels');
      this.gameScenarioModel = spyOnService('gameScenario');
      this.createModelCommandModel = spyOnService('createModelCommand');
      this.deleteModelCommandModel = spyOnService('deleteModelCommand');

      this.game = { scenario: 'scenario' };
    }
  ]));

  context('executeP(<game>)', function() {
    return this.createObjectivesCommandModel
      .executeP(this.game);
  }, function() {
    beforeEach(function() {
      this.gameModelsModel.all
        .and.returnValue([
          { state: { stamp: 'stamp1', info: [ 'scenario' ] } },
          { state: { stamp: 'stamp2', info: [ 'legion' ] } },
          { state: { stamp: 'stamp3', info: [ 'scenario' ] } },
          { state: { stamp: 'stamp4', info: [ 'legion' ] } },
        ]);
      this.createModelCommandModel.executeP
        .and.callFake((_c_, _f_, g) => ['createModelCommand.executeP.returnValue',g]);
      this.deleteModelCommandModel.executeP
        .and.callFake((_s_, g) => ['deleteModelCommand.executeP.returnValue',g]);
    });

    it('should delete scenario models', function() {
      expect(this.deleteModelCommandModel.executeP)
        .toHaveBeenCalledWith(['stamp1','stamp3'], this.game);
    });

    it('should create scenario objectives', function() {
      expect(this.gameScenarioModel.createObjectives)
        .toHaveBeenCalledWith('scenario');
      expect(this.createModelCommandModel.executeP)
        .toHaveBeenCalledWith('gameScenario.createObjectives.returnValue',
                              false, this.game);
    });

    it('should return context', function() {
      expect(this.context[0])
        .toEqual({
          desc: '',
          del: 'deleteModelCommand.executeP.returnValue',
          create: 'createModelCommand.executeP.returnValue'
        });
    });
  });

  context('replayP(<ctxt>, <game>)', function() {
    return this.createObjectivesCommandModel
      .replayP({ del: 'delete_ctxt', create: 'create_ctxt' }, this.game);
  }, function() {
    it('should replay delete models', function() {
      expect(this.deleteModelCommandModel.replayP)
        .toHaveBeenCalledWith('delete_ctxt', this.game);
    });

    it('should replay create objectives', function() {
      expect(this.createModelCommandModel.replayP)
        .toHaveBeenCalledWith('create_ctxt', 'deleteModelCommand.replayP.returnValue');
    });

    it('should return game', function() {
      expect(this.context)
        .toBe('createModelCommand.replayP.returnValue');
    });
  });

  context('undoP(<ctxt>, <game>)', function() {
    return this.createObjectivesCommandModel
      .undoP({ del: 'delete_ctxt', create: 'create_ctxt' }, this.game);
  }, function() {
    it('should undo create models', function() {
      expect(this.createModelCommandModel.undoP)
        .toHaveBeenCalledWith('create_ctxt', this.game);
    });

    it('should undo delete objectives', function() {
      expect(this.deleteModelCommandModel.undoP)
        .toHaveBeenCalledWith('delete_ctxt', 'createModelCommand.undoP.returnValue');
    });

    it('should return game', function() {
      expect(this.context)
        .toBe('deleteModelCommand.undoP.returnValue');
    });
  });
});
