'use strict';

angular.module('clickApp.services').factory('modelLeader', [function modelLeaderServiceFactory() {
  return function (modelService) {
    var modelLeaderService = {
      isLeaderDisplayed: function modelIsLeaderDisplayed(model) {
        return !!R.find(R.equals('l'), model.state.dsp);
      },
      setLeaderDisplay: function modelSetLeaderDisplay(set, model) {
        if (set) {
          model.state.dsp = R.uniq(R.append('l', model.state.dsp));
        } else {
          model.state.dsp = R.reject(R.equals('l'), model.state.dsp);
        }
      },
      toggleLeaderDisplay: function modelToggleLeaderDisplay(model) {
        if (modelService.isLeaderDisplayed(model)) {
          model.state.dsp = R.reject(R.equals('l'), model.state.dsp);
        } else {
          model.state.dsp = R.append('l', model.state.dsp);
        }
      }
    };
    return modelLeaderService;
  };
}]);
//# sourceMappingURL=leader.js.map