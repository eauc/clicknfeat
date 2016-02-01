'use strict';

angular.module('clickApp.services').factory('modelImage', ['gameFactions', function modelImageServiceFactory(gameFactionsService) {
  return function (modelService) {
    var modelImageService = {
      isImageDisplayed: function modelIsImageDisplayed(model) {
        return !!R.find(R.equals('i'), model.state.dsp);
      },
      getImage: function modelGetImage(factions, model) {
        return R.pipeP(gameFactionsService.getModelInfo$(model.state.info), R.prop('img'), function (info_img) {
          var img = R.pipe(R.filter(R.propEq('type', 'default')), R.prop(model.state.img))(info_img);
          if (modelService.isLeaderDisplayed(model)) {
            img = R.pipe(R.filter(R.propEq('type', 'leader')), R.head, R.defaultTo(img))(info_img);
          }
          if (modelService.isIncorporealDisplayed(model)) {
            img = R.pipe(R.filter(R.propEq('type', 'incorporeal')), R.head, R.defaultTo(img))(info_img);
          }
          var link = modelService.isImageDisplayed(model) ? img.link : null;
          return R.assoc('link', link, img);
        })(factions);
      },
      setNextImage: function modelSetNextImage(factions, model) {
        return R.pipeP(gameFactionsService.getModelInfo$(model.state.info), R.prop('img'), R.filter(R.propEq('type', 'default')), function (imgs) {
          return model.state.img >= imgs.length - 1 ? 0 : model.state.img + 1;
        }, function (next_img) {
          return R.assocPath(['state', 'img'], next_img, model);
        })(factions);
      },
      setImageDisplay: function modelSetImageDisplay(set, model) {
        if (set) {
          return R.over(R.lensPath(['state', 'dsp']), R.compose(R.uniq, R.append('i')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('i')), model);
        }
      },
      toggleImageDisplay: function modelToggleImageDisplay(model) {
        if (modelService.isImageDisplayed(model)) {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('i')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.append('i'), model);
        }
      }
    };
    return modelImageService;
  };
}]);
//# sourceMappingURL=image.js.map
