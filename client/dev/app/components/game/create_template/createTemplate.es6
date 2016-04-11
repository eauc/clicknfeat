(function() {
  angular.module('clickApp.directives')
    .directive('clickGameCreateTemplate', gameCreateTemplateDirectiveFactory);

  gameCreateTemplateDirectiveFactory.$inject = [
    'template',
  ];
  function gameCreateTemplateDirectiveFactory(templateModel) {
    const gameCreateTemplateDirective = {
      restrict: 'A',
      link: link
    };
    return gameCreateTemplateDirective;

    function link(scope) {
      console.log('clickCreateTemplate', scope.template);

      scope.onStateChangeEvent('Create.base.change', onUpdate, scope);
      setPosition(scope);

      function onUpdate() {
        const state = scope.state;
        if(R.isNil(R.path(['create','templates'], state))) return;
        setPosition(scope);
        scope.$digest();
      }
    }
    function setPosition(scope) {
      const state = scope.state;
      const base = R.pathOr({ x: 0, y: 0 }, ['create','base'], state);
      const template = scope.template;
      scope.pos = templateModel.render(false, R.thread(template)(
        R.assoc('x', base.x),
        R.assoc('y', base.y)
      ));
    }
  }
})();
