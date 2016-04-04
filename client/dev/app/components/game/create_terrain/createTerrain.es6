(function() {
  angular.module('clickApp.directives')
    .directive('clickGameCreateTerrain', clickGameCreateTerrainDirectiveFactory);

  clickGameCreateTerrainDirectiveFactory.$inject = [
    '$rootScope',
    'terrain',
    'gameMap',
  ];
  function clickGameCreateTerrainDirectiveFactory($rootScope,
                                                  terrainModel,
                                                  gameMapService) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, parent) {
      parent = parent[0];
      console.log('clickCreateTerrain', scope.index, scope.terrain);

      const state = $rootScope.state;
      const render = terrainModel
              .render(state.terrains, scope.terrain);
      initTerrainElement(render, parent);
      setTerrainPosition(R.path(['create','base'], state),
                         render, scope);

      $rootScope.onStateChangeEvent('Create.base.change',
                                    updateTerrainElement(scope),
                                    scope);
    }
    function initTerrainElement(render, parent) {
      const element = parent.querySelector('rect');
      element.setAttribute('width', render.width);
      element.setAttribute('height', render.height);
    }
    function updateTerrainElement(scope) {
      return () => {
        const state = $rootScope.state;
        const base = R.path(['create','base'], state);
        if(R.isNil(base)) return;

        const render = terrainModel
                .render(state.terrains, scope.terrain);
        setTerrainPosition(base, render, scope);
        scope.$digest();
      };
    }
    function setTerrainPosition(base, render, scope) {
      const map = document.getElementById('map');
      const is_flipped = gameMapService.isFlipped(map);
      const coeff = is_flipped ? -1 : 1;
      scope.pos = {
        x: base.x + coeff * render.x,
        y: base.y + coeff * render.y
      };
    }
  }
})();
