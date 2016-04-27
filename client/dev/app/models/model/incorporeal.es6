(function() {
  angular.module('clickApp.services')
    .factory('modelIncorporeal', modelIncorporealModelFactory);

  modelIncorporealModelFactory.$inject = [];
  function modelIncorporealModelFactory() {
    const DSP_LENS = R.lensPath(['state','dsp']);
    return (modelModel) => {
      const modelIncorporealModel = {
        isIncorporealDisplayed: modelIsIncorporealDisplayed,
        setIncorporealDisplay: modelSetIncorporealDisplay,
        toggleIncorporealDisplay: modelToggleIncorporealDisplay
      };
      return modelIncorporealModel;

      function modelIsIncorporealDisplayed(model) {
        return !!R.find(R.equals('in'), R.viewOr([], DSP_LENS, model));
      }
      function modelSetIncorporealDisplay(set, model) {
        const update = ( set
                         ? R.compose(R.uniq, R.append('in'))
                         : R.reject(R.equals('in'))
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleIncorporealDisplay(model) {
        const update = ( modelModel.isIncorporealDisplayed(model)
                         ? R.reject(R.equals('in'))
                         : R.append('in')
                       );
        return R.over(DSP_LENS, update, model);
      }
    };
  }
})();
