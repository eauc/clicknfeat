'use strict';

describe('model image', function() {
  describe('modelsMode service', function() {
    beforeEach(inject([
      'modelsMode',
      function(modelsModeService) {
        this.modelsModeService = modelsModeService;
        this.gameService = spyOnService('game');
        this.gameModelSelectionService = spyOnService('gameModelSelection');
      
        this.scope = { game: { model_selection: 'selection' },
                       factions: 'factions'
                     };
      }
    ]));

    using([
      [ 'melee' , 'flag' ],
      [ 'Melee' , 'mm' ],
      [ 'Reach' , 'mr' ],
      [ 'Strike', 'ms' ],
    ], function(e, d) {
      when('user toggles melee display on models, '+d, function() {
        this.modelsModeService.actions['toggle'+e.melee+'Display'](this.scope);
      }, function() {
        it('should toggle melee display on local selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'toggleMeleeDisplay', e.flag,
                                  'gameModelSelection.get.returnValue',
                                  this.scope, this.scope.game);
        });
      });
    });
  });

  describe('model service', function() {
    beforeEach(inject([
      'model',
      function(modelService) {
        this.modelService = modelService;
        this.gameFactionsService = spyOnService('gameFactions');
      }
    ]));

    describe('isMeleeDisplayed(<melee>)', function() {
      using([
        [ 'dsp'         , 'isDisplayed' ],
        [ []            , false ],
        [ ['a', 'mr']    , false ],
        [ ['mm']         , true ],
        [ ['a','mm','mr'] , true ],
      ], function(e, d) {
        it('should check whether model\'s <melee> is displayed, '+d, function() {
          expect(this.modelService.isMeleeDisplayed('mm', {
            state: { dsp: e.dsp }
          })).toBe(e.isDisplayed);
        });
      });
    });

    describe('toggleMeleeDisplay(<melee>)', function() {
      using([
        [ 'dsp'          , 'new_dsp'     ],
        [ []             , ['mm']         ],
        [ ['mm']         , []            ],
        [ ['a','r']      , ['a','r','mm'] ],
        [ ['a','mm','r'] , ['a','r']     ],
      ], function(e, d) {
        it('should toggle <melee> display for <model>, '+d, function() {
          this.model = {
            state: { dsp: e.dsp }
          };
          
          this.modelService.toggleMeleeDisplay('mm', this.model);

          expect(this.model.state.dsp).toEqual(e.new_dsp);
        });
      });
    });
  });
});
