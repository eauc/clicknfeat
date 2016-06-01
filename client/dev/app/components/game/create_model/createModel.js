'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameCreateModel', gameCreateModelDirectiveFactory);

  gameCreateModelDirectiveFactory.$inject = ['$rootScope', 'appGame', 'gameFactions', 'gameMap', 'model'];
  function gameCreateModelDirectiveFactory($rootScope, appGameService, gameFactionsModel, gameMapService, modelModel) {
    var gameCreateModelDirective = {
      restrict: 'A',
      templateUrl: 'app/components/game/create_model/create_model.html',
      link: link
    };
    return gameCreateModelDirective;

    function link(scope) {
      console.log('clickCreateModel', scope.model);

      var info = gameFactionsModel.getModelInfo(scope.model.info, $rootScope.state.factions);
      scope.bindCell(onCreateUpdate, appGameService.create, scope);

      function onCreateUpdate(create) {
        if (R.isNil(create) || R.isNil(R.prop('models', create))) return;
        setRender(scope, info, create);
      }
    }
    function setRender(scope, info, create) {
      var map = document.getElementById('map');
      var base = R.propOr({ x: 0, y: 0 }, 'base', create);
      var model = scope.model;
      var is_flipped = gameMapService.isFlipped(map);
      var coeff = is_flipped ? -1 : 1;
      scope.render = modelModel.render({ is_flipped: is_flipped }, {
        info: info,
        state: R.thread(model)(R.assoc('x', base.x + coeff * model.x), R.assoc('y', base.y + coeff * model.y))
      });
      console.warn('createModel.update', scope.render);
    }
  }
})();
//# sourceMappingURL=createModel.js.map
