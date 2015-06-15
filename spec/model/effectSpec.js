'use strict';

describe('model effects', function() {
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

    when('user toggles leader display on models', function() {
        this.modelsModeService.actions.toggleLeaderDisplay(this.scope);
    }, function() {
      it('should toggle leader display on local selection', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'toggleLeaderDisplay',
                                'gameModelSelection.get.returnValue',
                                this.scope, this.scope.game);
      });
    });

    using([
      [ 'effect' , 'flag' ], 
      [ 'Blind' , 'b' ],
      [ 'Corrosion' , 'c' ],
      [ 'Disrupt' , 'd' ],
      [ 'Fire' , 'f' ],
      [ 'Fleeing' , 'r' ],
      [ 'KD' , 'k' ],
      [ 'Stationary' , 's' ],
    ], function(e, d) {
      when('user toggles '+e.effect+' effect display on models', function() {
        this.modelsModeService.actions['toggle'+e.effect+'EffectDisplay'](this.scope);
      }, function() {
        it('should toggle '+e.effect+' effect display on local selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'toggleEffectDisplay', e.flag,
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

    describe('isLeaderDisplayed()', function() {
      using([
        [ 'dsp'         , 'isDisplayed' ],
        [ []            , false ],
        [ ['a', 'w']    , false ],
        [ ['l']         , true ],
        [ ['a','l','w'] , true ],
      ], function(e, d) {
        it('should check whether model\'s leader is displayed, '+d, function() {
          expect(this.modelService.isLeaderDisplayed({
            state: { dsp: e.dsp }
          })).toBe(e.isDisplayed);
        });
      });
    });

    describe('toggleLeaderDisplay()', function() {
      using([
        [ 'dsp'         , 'new_dsp'     ],
        [ []            , ['l']  ],
        [ ['l']         , []            ],
        [ ['a','w']     , ['a','w','l'] ],
        [ ['a','l','w'] , ['a','w']     ],
      ], function(e, d) {
        it('should toggle leader display for <model>, '+d, function() {
          this.model = {
            state: { dsp: e.dsp }
          };
          
          this.modelService.toggleLeaderDisplay(this.model);
          
          expect(this.model.state.dsp).toEqual(e.new_dsp);
        });
      });
    });

    using([
      [ 'effect' , 'flag' ], 
      [ 'Blind' , 'b' ],
      [ 'Corrosion' , 'c' ],
      [ 'Disrupt' , 'd' ],
      [ 'Fire' , 'f' ],
      [ 'Fleeing' , 'r' ],
      [ 'KD' , 'k' ],
      [ 'Stationary' , 's' ],
    ], function(ee, dd) {
      describe('isEffectDisplayed(<effect>), '+dd, function() {
        using([
          [ 'eff'             , 'isDisplayed' ],
          [ []                , false ],
          [ ['a', 'w']        , false ],
          [ [ee.flag]         , true ],
          [ ['a',ee.flag,'w'] , true ],
        ], function(e, d) {
          it('should check whether model\'s effect is displayed, '+d, function() {
            expect(this.modelService.isEffectDisplayed(ee.flag, {
              state: { eff: e.eff }
            })).toBe(e.isDisplayed);
          });
        });
      });

      describe('toggleEffectDisplay(<effect>), '+dd, function() {
        using([
          [ 'eff'             , 'new_eff'     ],
          [ []                , [ee.flag]  ],
          [ [ee.flag]         , []            ],
          [ ['a','w']         , ['a','w',ee.flag] ],
          [ ['a',ee.flag,'w'] , ['a','w']     ],
        ], function(e, d) {
          it('should toggle effect display for <model>, '+d, function() {
            this.model = {
              state: { eff: e.eff }
            };
            
            this.modelService.toggleEffectDisplay(ee.flag, this.model);
            
            expect(this.model.state.eff).toEqual(e.new_eff);
          });
        });
      });
    });
  });
});
