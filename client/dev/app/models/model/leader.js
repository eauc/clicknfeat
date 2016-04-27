'use strict';

(function () {
  angular.module('clickApp.services').factory('modelLeader', modelLeaderModelFactory);

  modelLeaderModelFactory.$inject = [];
  function modelLeaderModelFactory() {
    var DSP_LENS = R.lensPath(['state', 'dsp']);
    return function (modelModel) {
      var modelLeaderModel = {
        isLeaderDisplayed: modelIsLeaderDisplayed,
        setLeaderDisplay: modelSetLeaderDisplay,
        toggleLeaderDisplay: modelToggleLeaderDisplay
      };
      return modelLeaderModel;

      function modelIsLeaderDisplayed(model) {
        return !!R.find(R.equals('l'), R.viewOr([], DSP_LENS, model));
      }
      function modelSetLeaderDisplay(set, model) {
        var update = set ? R.compose(R.uniq, R.append('l')) : R.reject(R.equals('l'));
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleLeaderDisplay(model) {
        var update = modelModel.isLeaderDisplayed(model) ? R.reject(R.equals('l')) : R.append('l');
        return R.over(DSP_LENS, update, model);
      }
    };
  }
})();
//# sourceMappingURL=leader.js.map
