describe('model counter model', function() {
  beforeEach(inject([
    'model',
    function(modelModel) {
      this.modelModel = modelModel;
      this.gameFactionsModel = spyOnService('gameFactions');
    }
  ]));

  example(function(ee, dd) {
    describe('toggleCounterDisplay(<counter>)', function() {
      it('should toggle wreck display for <model>', function() {
        this.model = { state: { dsp: [] } };

        this.model = this.modelModel.toggleCounterDisplay(ee.counter, this.model);
        expect(this.modelModel.isCounterDisplayed(ee.counter, this.model))
          .toBeTruthy();

        this.model = this.modelModel.toggleCounterDisplay(ee.counter, this.model);
        expect(this.modelModel.isCounterDisplayed(ee.counter, this.model))
          .toBeFalsy();
      });
    });

    describe('setCounterDisplay(<set>)', function() {
      it('should set counter display for <model>', function() {
        this.model = { state: { dsp: [] } };

        this.model = this.modelModel.setCounterDisplay(ee.counter, true, this.model);
        expect(this.modelModel.isCounterDisplayed(ee.counter, this.model))
          .toBeTruthy();

        this.model = this.modelModel.setCounterDisplay(ee.counter, false, this.model);
        expect(this.modelModel.isCounterDisplayed(ee.counter, this.model))
          .toBeFalsy();
      });
    });

    describe('incrementCounter(<counter>), '+dd, function() {
      it('should increment <counter>', function() {
        this.model = {
          state: { }
        };
        this.model.state[ee.counter] = 42;

        this.model = this.modelModel
          .incrementCounter(ee.counter, this.model);

        expect(this.model.state[ee.counter]).toEqual(43);
      });
    });

    context('decrementCounter(<counter>), '+dd, function() {
      return this.modelModel
        .decrementCounter(ee.counter, this.model);
    }, function() {
      beforeEach(function() {
        this.model = {
          state: {}
        };
        this.model.state[ee.counter] = 42;
      });

      it('should decrement <counter>', function() {
        expect(this.context.state[ee.counter]).toEqual(41);
      });

      context('<counter> is 0', function() {
        this.model.state[ee.counter] = 0;
      }, function() {
        it('should not decrement <counter>', function() {
          expect(this.context.state[ee.counter]).toEqual(0);
        });
      });
    });
  }, [
    [ 'counter' ],
    [ 'c'       ],
    [ 's'       ],
  ]);
});
