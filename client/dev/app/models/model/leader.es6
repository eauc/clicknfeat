(function() {
  angular.module('clickApp.services')
    .factory('modelLeader', modelLeaderModelFactory);

  modelLeaderModelFactory.$inject = [];
  function modelLeaderModelFactory() {
    return (modelModel) => {
      const modelLeaderModel = {
        isLeaderDisplayed: modelIsLeaderDisplayed,
        setLeaderDisplay: modelSetLeaderDisplay,
        toggleLeaderDisplay: modelToggleLeaderDisplay
      };
      return modelLeaderModel;

      function modelIsLeaderDisplayed(model) {
        return !!R.find(R.equals('l'), model.state.dsp);
      }
      function modelSetLeaderDisplay(set, model) {
        if(set) {
          return R.over(R.lensPath(['state','dsp']),
                        R.compose(R.uniq, R.append('l')),
                        model);
        }
        else {
          return R.over(R.lensPath(['state','dsp']),
                        R.reject(R.equals('l')),
                        model);
        }
      }
      function modelToggleLeaderDisplay(model) {
        if(modelModel.isLeaderDisplayed(model)) {
          return R.over(R.lensPath(['state','dsp']),
                        R.reject(R.equals('l')),
                        model);
        }
        else {
          return R.over(R.lensPath(['state','dsp']),
                        R.append('l'),
                        model);
        }
      }
    };
  }
})();
