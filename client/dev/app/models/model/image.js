'use strict';

(function () {
  angular.module('clickApp.services').factory('modelImage', modelImageModelFactory);

  modelImageModelFactory.$inject = ['gameFactions'];
  function modelImageModelFactory(gameFactionsModel) {
    return function (modelModel) {
      var modelImageModel = {
        isImageDisplayed: modelIsImageDisplayed,
        getImageP: modelGetImageP,
        setNextImageP: modelSetNextImageP,
        setImageDisplay: modelSetImageDisplay,
        toggleImageDisplay: modelToggleImageDisplay
      };
      return modelImageModel;

      function modelIsImageDisplayed(model) {
        return !!R.find(R.equals('i'), model.state.dsp);
      }
      function modelGetImageP(factions, model) {
        return R.threadP(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.prop('img'), function (info_img) {
          var img = R.thread(info_img)(R.filter(R.propEq('type', 'default')), R.prop(model.state.img));
          if (modelModel.isLeaderDisplayed(model)) {
            img = R.thread(info_img)(R.filter(R.propEq('type', 'leader')), R.head, R.defaultTo(img));
          }
          if (modelModel.isIncorporealDisplayed(model)) {
            img = R.thread(info_img)(R.filter(R.propEq('type', 'incorporeal')), R.head, R.defaultTo(img));
          }
          var link = modelModel.isImageDisplayed(model) ? img.link : null;
          return R.assoc('link', link, img);
        });
      }
      function modelSetNextImageP(factions, model) {
        return R.threadP(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.prop('img'), R.filter(R.propEq('type', 'default')), function (imgs) {
          return model.state.img >= imgs.length - 1 ? 0 : model.state.img + 1;
        }, function (next_img) {
          return R.assocPath(['state', 'img'], next_img, model);
        });
      }
      function modelSetImageDisplay(set, model) {
        if (set) {
          return R.over(R.lensPath(['state', 'dsp']), R.compose(R.uniq, R.append('i')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('i')), model);
        }
      }
      function modelToggleImageDisplay(model) {
        if (modelModel.isImageDisplayed(model)) {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('i')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.append('i'), model);
        }
      }
    };
  }
})();
//# sourceMappingURL=image.js.map
