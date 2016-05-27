(function() {
  angular.module('clickApp.directives')
    .directive('clickGameTerrain', clickGameTerrainDirectiveFactory)
    .directive('clickGameTerrainsList', clickGameTerrainsListDirectiveFactory);

  clickGameTerrainDirectiveFactory.$inject = [
    'appGame',
    'terrain',
    'gameTerrains',
    'gameTerrainSelection',
  ];
  function clickGameTerrainDirectiveFactory(appGameService,
                                            terrainModel,
                                            gameTerrainsModel,
                                            gameTerrainSelectionModel) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope) {
      console.warn('gameTerrain', scope.terrain);

      const stamp = scope.terrain.state.stamp;
      scope.listenSignal(refreshSelection,
                         appGameService.terrains.selection_changes,
                         scope);
      scope.listenSignal(onTerrainsChanges,
                         appGameService.terrains.changes,
                         scope);
      mount();

      function onTerrainsChanges([terrains, stamps]) {
        if(!R.find(R.equals(stamp), stamps)) return;

        refreshRender(terrains);
      }
      function mount() {
        const terrains = appGameService.terrains.terrains.sample();
        refreshRender(terrains);

        const selection = appGameService.terrains.selection.sample();
        refreshSelection(selection);
      }
      function refreshRender(terrains) {
        const terrain = gameTerrainsModel
                .findStamp(stamp, terrains);
        if(R.isNil(terrain)) return;
        scope.terrain = terrain;

        terrain.render = terrainModel
          .render(terrain.info, terrain.state);

        console.warn('RENDER TERRAIN',
                     stamp, terrain.state, terrain.render);
      }
      function refreshSelection(selection) {
        const local = gameTerrainSelectionModel
                .in('local', stamp, selection);
        const remote = gameTerrainSelectionModel
                .in('remote', stamp, selection);
        const selected = (local || remote);
        scope.selection = {
          local: local,
          remote: remote,
          selected: selected
        };
        console.warn('SELECTION TERRAIN',
                     stamp, selection, scope.selection);
      }
    }
  }

  clickGameTerrainsListDirectiveFactory.$inject = [];
  function clickGameTerrainsListDirectiveFactory() {
    return {
      restrict: 'A',
      templateUrl: 'app/components/game/terrain/terrains_list.html',
      scope: true,
      link: link
    };

    function link(scope, _element_, attrs) {
      scope.type = attrs.clickGameTerrainsList;
      console.log('clickGameTerrainsList', scope.type);
    }
  }
})();
