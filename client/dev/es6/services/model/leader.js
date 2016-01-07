angular.module('clickApp.services')
  .factory('modelLeader', [
    function modelLeaderServiceFactory() {
      return function(modelService) {
        var modelLeaderService = {
          isLeaderDisplayed: function modelIsLeaderDisplayed(model) {
            return !!R.find(R.equals('l'), model.state.dsp);
          },
          setLeaderDisplay: function modelSetLeaderDisplay(set, model) {
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
          },
          toggleLeaderDisplay: function modelToggleLeaderDisplay(model) {
            if(modelService.isLeaderDisplayed(model)) {
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
        return modelLeaderService;
      };
    }
  ]);
