angular.module('clickApp.services')
  .factory('modelIncorporeal', [
    function modelIncorporealServiceFactory() {
      return function(modelService) {
        var modelIncorporealService = {
          isIncorporealDisplayed: function modelIsIncorporealDisplayed(model) {
            return !!R.find(R.equals('in'), model.state.dsp);
          },
          setIncorporealDisplay: function modelSetIncorporealDisplay(set, model) {
            if(set) {
              return R.over(R.lensPath(['state','dsp']),
                            R.compose(R.uniq, R.append('in')),
                            model);
            }
            else {
              return R.over(R.lensPath(['state','dsp']),
                            R.reject(R.equals('in')),
                            model);
            }
          },
          toggleIncorporealDisplay: function modelToggleIncorporealDisplay(model) {
            if(modelService.isIncorporealDisplayed(model)) {
              return R.over(R.lensPath(['state','dsp']),
                            R.reject(R.equals('in')),
                            model);
            }
            else {
              return R.over(R.lensPath(['state','dsp']),
                            R.append('in'),
                            model);
            }
          }
        };
        return modelIncorporealService;
      };
    }
  ]);
