(function() {
  angular.module('clickApp.services')
    .factory('modelMelee', modelMeleeServiceFactory);

  modelMeleeServiceFactory.$inject = [];
  function modelMeleeServiceFactory() {
    const DSP_LENS = R.lensPath(['state','dsp']);
    return function(modelService) {
      const modelMeleeModel = {
        isMeleeDisplayed: modelIsMeleeDisplayed,
        setMeleeDisplay: modelSetMeleeDisplay,
        toggleMeleeDisplay: modelToggleMeleeDisplay,
        renderMelee: modelRenderMelee
      };
      return modelMeleeModel;

      function modelIsMeleeDisplayed(melee, model) {
        return !!R.find(R.equals(melee), model.state.dsp);
      }
      function modelSetMeleeDisplay(melee, set, model) {
        const update = ( set
                         ? R.compose(R.uniq, R.append(melee))
                         : R.reject(R.equals(melee))
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelToggleMeleeDisplay(melee, model) {
        const update = ( modelService.isMeleeDisplayed(melee, model)
                         ? R.reject(R.equals(melee))
                         : R.append(melee)
                       );
        return R.over(DSP_LENS, update, model);
      }
      function modelRenderMelee({ img,
                                  info }, state) {
        const melee = {
          melee: {
            show: modelMeleeModel.isMeleeDisplayed('mm', {state}),
            path: computeMeleePath(5, img, info)
          },
          reach: {
            show: modelMeleeModel.isMeleeDisplayed('mr', {state}),
            path: computeMeleePath(20, img, info)
          },
          strike: {
            show: modelMeleeModel.isMeleeDisplayed('ms', {state}),
            path: computeMeleePath(40, img, info)
          }
        };
        return { melee };
      }
      function computeMeleePath(size, img, info) {
        return [
          `M${img.width/2-info.base_radius-size},${img.height/2}`,
          `L${img.width/2+info.base_radius+size},${img.height/2}`,
          `A${info.base_radius+size},${info.base_radius+size} 0 0,0`,
          `${img.width/2-info.base_radius-size},${img.height/2}`,
          `M${img.width/2},${img.height/2}`,
          `L${img.width/2},${img.height/2-info.base_radius-size}`,
        ].join(' ');
      }
    };
  }
})();
