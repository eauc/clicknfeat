'use strict';

angular.module('clickApp.services').factory('modelWreck', ['gameFactions', function modelWreckServiceFactory(gameFactionsService) {
  return function (modelService) {
    var modelWreckService = {
      isWreckDisplayed: function modelIsWreckDisplayed(model) {
        return !!R.find(R.equals('w'), model.state.dsp);
      },
      getWreckImage: function modelGetWreckImage(factions, model) {
        return R.pipeP(gameFactionsService.getModelInfo$(model.state.info), R.prop('img'), function (info_img) {
          var img = R.find(R.propEq('type', 'wreck'), info_img);

          if (R.isNil(img)) {
            img = R.pipe(R.find(R.propEq('type', 'default')), R.defaultTo({}), R.assoc('link', null))(info_img);
          }

          return img;
        }, function (img) {
          var link = modelService.isImageDisplayed(model) ? img.link : null;
          return R.assoc('link', link, img);
        })(factions);
      },
      setWreckDisplay: function modelSetWreckDisplay(set, model) {
        if (set) {
          return R.over(R.lensPath(['state', 'dsp']), R.compose(R.uniq, R.append('w')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('w')), model);
        }
      },
      toggleWreckDisplay: function modelToggleWreckDisplay(model) {
        if (modelService.isWreckDisplayed(model)) {
          return R.over(R.lensPath(['state', 'dsp']), R.reject(R.equals('w')), model);
        } else {
          return R.over(R.lensPath(['state', 'dsp']), R.append('w'), model);
        }
      }
    };
    return modelWreckService;
  };
}]);
//# sourceMappingURL=wreck.js.map
