'use strict';

(function () {
  angular.module('clickApp.services').factory('modelWreck', modelWreckModelFactory);

  modelWreckModelFactory.$inject = ['gameFactions'];
  function modelWreckModelFactory(gameFactionsModel) {
    return function (modelModel) {
      var modelWreckModel = {
        isWreckDisplayed: modelIsWreckDisplayed,
        getWreckImageP: modelGetWreckImageP,
        setWreckDisplay: modelSetWreckDisplay,
        toggleWreckDisplay: modelToggleWreckDisplay
      };
      return modelWreckModel;

      function modelIsWreckDisplayed(model) {
        return !!R.find(R.equals('w'), model.state.dsp);
      }
      function modelGetWreckImageP(factions, model) {
        return R.threadP(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.prop('img'), function (info_img) {
          return R.thread(info_img)(R.find(R.propEq('type', 'wreck')), R.defaultTo(R.thread(info_img)(R.find(R.propEq('type', 'default')), R.defaultTo({}), R.assoc('link', null))));
        }, function (img) {
          var link = modelModel.isImageDisplayed(model) ? img.link : null;
          return R.assoc('link', link, img);
        });
      }
      function modelSetWreckDisplay(set, model) {
        if (set) {
          return R.over(R.lensPath(['state', 'dsp']), R.compose(R.uniq, R.append('w')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('w')), model);
        }
      }
      function modelToggleWreckDisplay(model) {
        if (modelModel.isWreckDisplayed(model)) {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('w')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.append('w'), model);
        }
      }
    };
  }
})();
//# sourceMappingURL=wreck.js.map
