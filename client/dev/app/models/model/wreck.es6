(function() {
  angular.module('clickApp.services')
    .factory('modelWreck', modelWreckModelFactory);

  modelWreckModelFactory.$inject = [
    'gameFactions',
  ];
  function modelWreckModelFactory(gameFactionsModel) {
    const DSP_LENS = R.lensPath(['state','dsp']);
    return (modelModel) => {
      const modelWreckModel = {
        isWreckDisplayed: modelIsWreckDisplayed,
        getWreckImage: modelGetWreckImage,
        setWreckDisplay: modelSetWreckDisplay,
        toggleWreckDisplay: modelToggleWreckDisplay
      };
      return modelWreckModel;

      function modelIsWreckDisplayed(model) {
        return !!R.find(R.equals('w'), R.viewOr([], DSP_LENS, model));
      }
      function modelGetWreckImage(factions, model) {
        return R.thread(factions)(
          gameFactionsModel.getModelInfo$(model.state.info),
          R.prop('img'),
          (info_img) => R.thread(info_img)(
            R.find(R.propEq('type','wreck')),
            R.defaultTo(R.thread(info_img)(
              R.find(R.propEq('type','default')),
              R.defaultTo({}),
              R.assoc('link', null)
            ))
          ),
          (img) => {
            const link = modelModel.isImageDisplayed(model) ? img.link : null;
            return R.assoc('link', link, img);
          }
        );
      }
      function modelSetWreckDisplay(set, model) {
        const update = ( set
                         ? R.compose(R.uniq, R.append('w'))
                         : R.reject(R.equals('w'))
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleWreckDisplay(model) {
        const update = ( modelModel.isWreckDisplayed(model)
                         ? R.reject(R.equals('w'))
                         : R.append('w')
                       );
        return R.over(DSP_LENS, update, model);
      }
    };
  }
})();
