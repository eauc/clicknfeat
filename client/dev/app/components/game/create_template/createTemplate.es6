(function() {
  angular.module('clickApp.directives')
    .directive('clickGameCreateTemplate', gameCreateTemplateDirectiveFactory);

  gameCreateTemplateDirectiveFactory.$inject = [
    'appGame',
    'template',
  ];
  function gameCreateTemplateDirectiveFactory(appGameService,
                                              templateModel) {
    const gameCreateTemplateDirective = {
      restrict: 'A',
      templateUrl: 'app/components/game/create_template/create_template.html',
      link: link
    };
    return gameCreateTemplateDirective;

    function link(scope) {
      console.log('clickCreateTemplate', scope.template);

      scope.bindCell(onCreateUpdate, appGameService.create, scope);

      function onCreateUpdate(create) {
        if(R.isNil(create) ||
           R.isNil(R.prop('templates', create))) return;
        setPosition(scope, create);
      }
    }
    function setPosition(scope, create) {
      const base = R.propOr({ x: 0, y: 0 }, 'base', create);
      const template = scope.template;
      scope.pos = templateModel.render({ is_flipped: false }, {
        state: R.thread(template)(
          R.assoc('x', base.x),
          R.assoc('y', base.y)
        )
      });
    }
  }
})();
