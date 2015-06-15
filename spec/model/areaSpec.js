'use strict';

describe('model areas', function() {
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

    when('user toggles ctrl area display on models', function() {
      this.modelsModeService.actions['toggleCtrlAreaDisplay'](this.scope);
    }, function() {
      it('should toggle ctrl area display on local selection', function() {
        expect(this.gameModelSelectionService.get)
          .toHaveBeenCalledWith('local', 'selection');
        expect(this.gameService.executeCommand)
          .toHaveBeenCalledWith('onModels', 'toggleCtrlAreaDisplay',
                                'gameModelSelection.get.returnValue',
                                this.scope, this.scope.game);
      });
    });

    using([
      [ 'area' ], 
      [ 1 ],[ 2 ],[ 3 ],[ 4 ],[ 5 ],[ 6 ],[ 7 ],[ 8 ],[ 9 ],[ 10 ],
      [ 11 ],[ 12 ],[ 13 ],[ 14 ],[ 15 ],[ 16 ],[ 17 ],[ 18 ],[ 19 ],[ 20 ],
    ], function(e, d) {
      when('user toggles '+e.area+'" area display on models', function() {
        this.modelsModeService.actions['toggle'+e.area+'InchesAreaDisplay'](this.scope);
      }, function() {
        it('should toggle '+e.area+'" area display on local selection', function() {
          expect(this.gameModelSelectionService.get)
            .toHaveBeenCalledWith('local', 'selection');
          expect(this.gameService.executeCommand)
            .toHaveBeenCalledWith('onModels', 'toggleAreaDisplay', e.area,
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

    describe('isAreaDisplayed()', function() {
      using([
        [ 'info', 'dsp' , 'isDisplayed' ],
        [ { type: 'warrior', focus: 7 }, []  , false ],
        [ { type: 'warrior', focus: 7 }, ['a']    , false ],
        [ { type: 'wardude', focus: null }, []  , false ],
        [ { type: 'wardude', focus: null }, ['a']    , false ],
        [ { type: 'wardude', focus: 7 }, []  , false ],
        [ { type: 'wardude', focus: 7 }, ['a']    , true ],
        [ { type: 'wardude', fury: 7 }, []  , false ],
        [ { type: 'wardude', fury: 7 }, ['i','a','r']    , true ],
      ], function(e, d) {
        it('should check whether model\'s area is displayed, '+d, function() {
          this.gameFactionsService.getModelInfo._retVal = e.info;
          
          expect(this.modelService.isCtrlAreaDisplayed('factions', {
            state: { dsp: e.dsp }
          })).toBe(e.isDisplayed);
        });
      });
    });

    describe('isAreaDisplayed()', function() {
      using([
        [ 'are' , 'isDisplayed' ],
        [ null  , false ],
        [ 42    , true ],
      ], function(e, d) {
        it('should check whether model\'s area is displayed, '+d, function() {
          expect(this.modelService.isAreaDisplayed({
            state: { are: e.are }
          })).toBe(e.isDisplayed);
        });
      });
    });

    describe('toggleCtrlAreaDisplay(<area>)', function() {
      using([
        [ 'dsp'     , 'new_dsp' ],
        [ []        , ['a']     ],
        [ ['i']     , ['i','a'] ],
        [ ['a','r'] , ['r']     ],
      ], function(e, d) {
        it('should toggle ctrlArea display for <model>, '+d, function() {
          this.model = {
            state: { dsp: e.dsp }
          };
          
          this.modelService.toggleCtrlAreaDisplay(this.model);
          
          expect(this.model.state.dsp).toEqual(e.new_dsp);
        });
      });
    });

    describe('toggleAreaDisplay(<area>)', function() {
      using([
        [ 'are' , 'new_are' ],
        [ null  , 5         ],
        [ 42    , 5         ],
        [ 5     , null      ],
      ], function(e, d) {
        it('should toggle <area> display for <model>, '+d, function() {
          this.model = {
            state: { are: e.are }
          };
          
          this.modelService.toggleAreaDisplay(5, this.model);
          
          expect(this.model.state.are).toEqual(e.new_are);
        });
      });
    });
  });
});
