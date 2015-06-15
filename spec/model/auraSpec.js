'use strict';

describe('model auras', function() {
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
      [ 'aura' , 'flag' ], 
      [ 'Red' , '#F00' ],
      [ 'Green' , '#0F0' ],
      [ 'Blue' , '#00F' ],
      [ 'Yellow' , '#FF0' ],
      [ 'Purple' , '#F0F' ],
      [ 'Cyan' , '#0FF' ],
    ], function(e, d) {
      when('user toggles '+e.aura+' aura display on models', function() {
        this.modelsModeService.actions['toggle'+e.aura+'AuraDisplay'](this.scope);
      }, function() {
        it('should toggle '+e.aura+' aura display on local selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'toggleAuraDisplay', e.flag,
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

    describe('isAuraDisplayed()', function() {
      using([
        [ 'aur'   , 'isDisplayed' ],
        [ null    , false ],
        [ 'aura'  , true ],
      ], function(e, d) {
        it('should check whether model\'s aura is displayed, '+d, function() {
          expect(this.modelService.isAuraDisplayed({
            state: { aur: e.aur }
          })).toBe(e.isDisplayed);
        });
      });
    });

    describe('toggleAuraDisplay(<aura>)', function() {
      using([
        [ 'aur'   , 'new_aur' ],
        [ null    , 'aura'    ],
        [ 'other' , 'aura'    ],
        [ 'aura'  , null      ],
      ], function(e, d) {
        it('should toggle <aura> display for <model>, '+d, function() {
          this.model = {
            state: { aur: e.aur }
          };
          
          this.modelService.toggleAuraDisplay('aura', this.model);
          
          expect(this.model.state.aur).toEqual(e.new_aur);
        });
      });
    });
  });
});
