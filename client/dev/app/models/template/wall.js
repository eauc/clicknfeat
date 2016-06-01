'use strict';

(function () {
  angular.module('clickApp.models').factory('wallTemplate', wallTemplateModelFactory);

  wallTemplateModelFactory.$inject = ['template'];
  function wallTemplateModelFactory(templateModel) {
    var wallTemplateModel = Object.create(templateModel);
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
    function wallTemplateRender(temp, base_render) {
      var state = temp.state;
      R.deepExtend(base_render, {
        x: state.x - 20,
        y: state.y - 3.75,
        transform: 'rotate(' + state.r + ',' + state.x + ',' + state.y + ')'
      });
      return {
        text_center: { x: state.x,
          y: state.y + 2
        },
        flip_center: state,
        rotate_with_model: true
      };
    }
  }
})();
//# sourceMappingURL=wall.js.map
