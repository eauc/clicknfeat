(function() {
  angular.module('clickApp.services')
    .factory('modelImage', modelImageModelFactory);

  modelImageModelFactory.$inject = [];
  function modelImageModelFactory() {
    const DSP_LENS = R.lensPath(['state','dsp']);
    return (modelModel) => {
      const modelImageModel = {
        isImageDisplayed: modelIsImageDisplayed,
        getImage: modelGetImage,
        setNextImage: modelSetNextImage,
        setImageDisplay: modelSetImageDisplay,
        toggleImageDisplay: modelToggleImageDisplay,
        renderImage: modelRenderImage
      };
      return modelImageModel;

      function modelIsImageDisplayed(model) {
        return !!R.find(R.equals('i'), R.viewOr([], DSP_LENS, model));
      }
      function modelGetImage(model) {
        const info = model.info;
        const info_img = info.img;
        let img = R.thread(info_img)(
          R.filter(R.propEq('type','default')),
          R.prop(model.state.img)
        );
        if(modelModel.isLeaderDisplayed(model)) {
          img = R.thread(info_img)(
            R.filter(R.propEq('type','leader')),
            R.head,
            R.defaultTo(img)
          );
        }
        if(modelModel.isIncorporealDisplayed(model)) {
          img = R.thread(info_img)(
            R.filter(R.propEq('type','incorporeal')),
            R.head,
            R.defaultTo(img)
          );
        }
        const link = modelModel.isImageDisplayed(model) ? img.link : null;
        return R.assoc('link', link, img);
      }
      function modelSetNextImage(model) {
        return R.thread(model.info)(
          R.prop('img'),
          R.filter(R.propEq('type','default')),
          (imgs) => (model.state.img >= imgs.length-1) ? 0 : model.state.img + 1,
          (next_img) => R.assocPath(['state','img'], next_img, model)
        );
      }
      function modelSetImageDisplay(set, model) {
        const update = ( set
                         ? R.compose(R.uniq, R.append('i'))
                         : R.reject(R.equals('i'))
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleImageDisplay(model) {
        const update = ( modelModel.isImageDisplayed(model)
                         ? R.reject(R.equals('i'))
                         : R.append('i')
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelRenderImage({ img }, _state_) {
        return { img: img.link };
      }
    };
  }
})();
