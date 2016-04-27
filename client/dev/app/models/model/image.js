'use strict';

(function () {
  angular.module('clickApp.services').factory('modelImage', modelImageModelFactory);

  modelImageModelFactory.$inject = ['gameFactions'];
  function modelImageModelFactory(gameFactionsModel) {
    var DSP_LENS = R.lensPath(['state', 'dsp']);
    return function (modelModel) {
      var modelImageModel = {
        isImageDisplayed: modelIsImageDisplayed,
        getImage: modelGetImage,
        setNextImage: modelSetNextImage,
        setImageDisplay: modelSetImageDisplay,
        toggleImageDisplay: modelToggleImageDisplay
      };
      return modelImageModel;

      function modelIsImageDisplayed(model) {
        return !!R.find(R.equals('i'), R.viewOr([], DSP_LENS, model));
      }
      function modelGetImage(factions, model) {
        return R.thread(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.prop('img'), function (info_img) {
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
      function modelSetNextImage(factions, model) {
        return R.thread(factions)(gameFactionsModel.getModelInfo$(model.state.info), R.prop('img'), R.filter(R.propEq('type', 'default')), function (imgs) {
          return model.state.img >= imgs.length - 1 ? 0 : model.state.img + 1;
        }, function (next_img) {
          return R.assocPath(['state', 'img'], next_img, model);
        });
      }
      function modelSetImageDisplay(set, model) {
        var update = set ? R.compose(R.uniq, R.append('i')) : R.reject(R.equals('i'));
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleImageDisplay(model) {
        var update = modelModel.isImageDisplayed(model) ? R.reject(R.equals('i')) : R.append('i');
        return R.over(DSP_LENS, update, model);
      }
    };
  }
})();
//# sourceMappingURL=image.js.map
