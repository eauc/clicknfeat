(function() {
  angular.module('clickApp.models')
    .factory('wallTemplate', wallTemplateModelFactory);

  wallTemplateModelFactory.$inject = [
    'template',
  ];
  function wallTemplateModelFactory(templateModel) {
    const wallTemplateModel = Object.create(templateModel);
    R.deepExtend(wallTemplateModel, {
      _create: wallTemplateCreate,
      render: wallTemplateRender
    });

    templateModel.registerTemplate('wall', wallTemplateModel);
    R.curryService(wallTemplateModel);
    return wallTemplateModel;

    function wallTemplateCreate(temp) {
      return temp;
    }
    function wallTemplateRender(temp_state, base_render) {
      R.deepExtend(base_render, {
        x: temp_state.x - 20,
        y: temp_state.y - 3.75,
        transform: `rotate(${temp_state.r},${temp_state.x},${temp_state.y})`
      });
      return {
        text_center: { x: temp_state.x,
                       y: temp_state.y + 2
                     },
        flip_center: temp_state,
        rotate_with_model: true
      };
    }
  }
})();
