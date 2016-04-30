(function() {
  angular.module('clickApp.services')
    .factory('modelCounter', modelCounterModelFactory);

  modelCounterModelFactory.$inject = [];
  function modelCounterModelFactory() {
    const DSP_LENS = R.lensPath(['state','dsp']);
    return (modelModel) => {
      const modelCounterModel = {
        isCounterDisplayed: modelIsCounterDisplayed,
        incrementCounter: modelIncrementCounter,
        decrementCounter: modelDecrementCounter,
        setCounterDisplay: modelSetCounterDisplay,
        toggleCounterDisplay: modelToggleCounterDisplay,
        renderCounter: modelRenderCounter
      };
      return modelCounterModel;

      function modelIsCounterDisplayed(counter, model) {
        return !!R.find(R.equals(counter), R.viewOr([], DSP_LENS, model));
      }
      function modelIncrementCounter(counter, model) {
        const value = R.defaultTo(0, model.state[counter]) + 1;
        return R.assocPath(['state', counter], value, model);
      }
      function modelDecrementCounter(counter, model) {
        const value = Math.max(0, R.defaultTo(0, model.state[counter]) - 1);
        return R.assocPath(['state', counter], value, model);
      }
      function modelSetCounterDisplay(counter, set, model) {
        const update = ( set
                         ? R.compose(R.uniq, R.append(counter))
                         : R.reject(R.equals(counter))
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleCounterDisplay(counter, model) {
        const update = ( modelModel.isCounterDisplayed(counter, model)
                         ? R.reject(R.equals(counter))
                         : R.append(counter)
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelRenderCounter({ base,
                                    cx, cy,
                                    is_flipped,
                                    radius }, state) {
        const counter_options = {
          rotate: -state.r,
          flipped: is_flipped,
          flip_center: { x: cx, y: cy },
          text_center: { x: cx, y: cy + 2 }
        };
        const counter = base
                .renderText(counter_options, state.c);
        counter.show = modelModel
          .isCounterDisplayed('c', {state});
        const souls_options = {
          rotate: -state.r,
          flip_center: { x: cx, y: cy },
          text_center: { x: cx + radius * 0.8 + 5,
                         y: cy - radius - 5 }
        };
        const souls = base
                .renderText(souls_options, state.s);
        souls.show = modelModel
          .isCounterDisplayed('s', {state});
        souls.cx = souls.x - 10;
        souls.cy = souls.y - 10;
        return {
          counter,
          souls
        };
      }
    };
  }
})();
