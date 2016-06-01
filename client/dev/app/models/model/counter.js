'use strict';

(function () {
  angular.module('clickApp.services').factory('modelCounter', modelCounterModelFactory);

  modelCounterModelFactory.$inject = [];
  function modelCounterModelFactory() {
    var DSP_LENS = R.lensPath(['state', 'dsp']);
    return function (modelModel) {
      var modelCounterModel = {
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
        var value = R.defaultTo(0, model.state[counter]) + 1;
        return R.assocPath(['state', counter], value, model);
      }
      function modelDecrementCounter(counter, model) {
        var value = Math.max(0, R.defaultTo(0, model.state[counter]) - 1);
        return R.assocPath(['state', counter], value, model);
      }
      function modelSetCounterDisplay(counter, set, model) {
        var update = set ? R.compose(R.uniq, R.append(counter)) : R.reject(R.equals(counter));
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleCounterDisplay(counter, model) {
        var update = modelModel.isCounterDisplayed(counter, model) ? R.reject(R.equals(counter)) : R.append(counter);
        return R.over(DSP_LENS, update, model);
      }
      function modelRenderCounter(_ref, model) {
        var base = _ref.base;
        var cx = _ref.cx;
        var cy = _ref.cy;
        var is_flipped = _ref.is_flipped;

        var state = model.state;
        var radius = model.info.base_radius;
        var counter_options = {
          rotate: -state.r,
          flipped: is_flipped,
          flip_center: { x: cx, y: cy },
          text_center: { x: cx, y: cy + 2 }
        };
        var counter = base.renderText(counter_options, state.c);
        counter.show = modelModel.isCounterDisplayed('c', model);
        var souls_options = {
          rotate: -state.r,
          flip_center: { x: cx, y: cy },
          text_center: { x: cx + radius * 0.8 + 5,
            y: cy - radius - 5 }
        };
        var souls = base.renderText(souls_options, state.s);
        souls.show = modelModel.isCounterDisplayed('s', model);
        souls.cx = souls.x - 10;
        souls.cy = souls.y - 10;
        return {
          counter: counter,
          souls: souls
        };
      }
    };
  }
})();
//# sourceMappingURL=counter.js.map
