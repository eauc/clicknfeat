(function() {
  angular.module('clickApp.services')
    .factory('modelArea', modelAreaModelFactory);

  modelAreaModelFactory.$inject = [];
  function modelAreaModelFactory() {
    const DSP_LENS = R.lensPath(['state','dsp']);
    const AREA_LENS = R.lensPath(['state','are']);
    return () => {
      const modelAreaModel = {
        isCtrlAreaDisplayed: modelIsCtrlAreaDisplayed,
        setCtrlAreaDisplay: modelSetCtrlAreaDisplay,
        toggleCtrlAreaDisplay: modelToggleCtrlAreaDisplay,
        isAreaDisplayed: modelIsAreaDisplayed,
        areaDisplay: modelAreaDisplay,
        setAreaDisplay: modelSetAreaDisplay,
        toggleAreaDisplay: modelToggleAreaDisplay,
        renderArea: modelRenderArea
      };
      return modelAreaModel;

      function modelIsCtrlAreaDisplayed(model) {
        const info = model.info;
        return ( info.type === 'wardude' &&
                 ( 'Number' === R.type(info.focus) ||
                   'Number' === R.type(info.fury)
                 ) &&
                 !!R.find(R.equals('a'), R.viewOr([], DSP_LENS, model))
               );
      }
      function modelSetCtrlAreaDisplay(set, model) {
        const update = ( set
                         ? R.compose(R.uniq, R.append('a'))
                         : R.reject(R.equals('a'))
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleCtrlAreaDisplay(model) {
        const update = ( R.find(R.equals('a'), model.state.dsp)
                         ? R.reject(R.equals('a'))
                         : R.append('a')
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelIsAreaDisplayed(model) {
        return R.exists(R.view(AREA_LENS, model));
      }
      function modelAreaDisplay(model) {
        return R.view(AREA_LENS, model);
      }
      function modelSetAreaDisplay(area, model) {
        return R.set(AREA_LENS, area, model);
      }
      function modelToggleAreaDisplay(area, model) {
        return R.over(
          AREA_LENS,
          (are) => ((area === are) ? null : area),
          model
        );
      }
      function modelRenderArea(model) {
        const info = model.info;
        const radius = info.base_radius;
        const area = ( modelAreaModel.isAreaDisplayed(model)
                       ? modelAreaModel.areaDisplay(model) * 10 + radius
                       : null
                     );
        const ctrl = ( modelAreaModel.isCtrlAreaDisplayed(model)
                       ? (info.focus || info.fury) * 20 + radius
                       : null
                     );
        return {
          area,
          ctrl
        };
      }
    };
  }
})();
