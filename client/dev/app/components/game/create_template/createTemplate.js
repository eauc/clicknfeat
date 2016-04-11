'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameCreateTemplate', gameCreateTemplateDirectiveFactory);

  gameCreateTemplateDirectiveFactory.$inject = ['template'];
  function gameCreateTemplateDirectiveFactory(templateModel) {
    var gameCreateTemplateDirective = {
      restrict: 'A',
      link: link
    };
    return gameCreateTemplateDirective;

    function link(scope) {
      console.log('clickCreateTemplate', scope.template);

      scope.onStateChangeEvent('Create.base.change', onUpdate, scope);
      setPosition(scope);

      function onUpdate() {
        var state = scope.state;
        if (R.isNil(R.path(['create', 'templates'], state))) return;
        setPosition(scope);
        scope.$digest();
      }
    }
    function setPosition(scope) {
      var state = scope.state;
      var base = R.pathOr({ x: 0, y: 0 }, ['create', 'base'], state);
      var template = scope.template;
      scope.pos = templateModel.render(false, R.thread(template)(R.assoc('x', base.x), R.assoc('y', base.y)));
    }
  }
})();
//# sourceMappingURL=createTemplate.js.map
