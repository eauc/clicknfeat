(function() {
  angular.module('clickApp.directives')
    .directive('clickGameCreateTerrain', clickGameCreateTerrainDirectiveFactory);

  clickGameCreateTerrainDirectiveFactory.$inject = [
    '$rootScope',
    'appGame',
    'terrain',
    'gameTerrainInfo',
    'gameMap',
  ];
  function clickGameCreateTerrainDirectiveFactory($rootScope,
                                                  appGameService,
                                                  terrainModel,
                                                  gameTerrainInfoModel) {
    return {
      restrict: 'A',
      templateUrl: 'app/components/game/create_terrain/create_terrain.html',
      link: link
    };

    function link(scope, parent) {
      parent = parent[0];
      console.log('clickCreateTerrain', scope.terrain);

      const info = gameTerrainInfoModel
              .getInfo(scope.terrain.info,
                       $rootScope.state.terrains);
      scope.bindCell(onCreateUpdate, appGameService.create, scope);
      setRender(scope, info, scope.state.create);

      function onCreateUpdate(create) {
        if(R.isNil(create) ||
           R.isNil(R.prop('terrains', create))) return;
        setRender(scope, info, create);
      }
    }
    function setRender(scope, info, create) {
      const base = R.propOr({ x: 0, y: 0 }, 'base', create);
      scope.render = terrainModel.render(info, R.thread(scope.template)(
        R.assoc('x', base.x),
        R.assoc('y', base.y)
      ));
    }
  }
})();
