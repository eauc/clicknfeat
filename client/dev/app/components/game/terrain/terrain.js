'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameTerrain', clickGameTerrainDirectiveFactory).directive('clickGameTerrainsList', clickGameTerrainsListDirectiveFactory);

  clickGameTerrainDirectiveFactory.$inject = ['$rootScope', 'terrain', 'gameTerrainSelection'];
  function clickGameTerrainDirectiveFactory($rootScope, terrainModel, gameTerrainSelectionModel) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, parent) {
      parent = parent[0];
      console.log('gameTerrain', scope.terrain);
      return buildTerrainElement(scope, parent);
    }
    function buildTerrainElement(scope, parent) {
      var state = $rootScope.state;
      var render = terrainModel.render(state.terrains, scope.terrain.state);
      initTerrainElement(render, parent);
      scope.pos = render;
      updateTerrainSelection(state.game.terrain_selection, scope.terrain, scope);

      var updateTerrain = gameTerrainOnUpdate(scope);
      scope.onStateChangeEvent('Game.terrains.change', updateTerrain, scope);
      scope.onStateChangeEvent('Game.terrain.change.' + scope.terrain.state.stamp, gameTerrainOnUpdate_(scope), scope);
      scope.onStateChangeEvent('Game.terrain_selection.change', updateTerrain, scope);
    }
    function initTerrainElement(render, parent) {
      var image = parent.querySelector('image');
      image.setAttribute('data-stamp', render.stamp);
      image.setAttribute('width', render.width + '');
      image.setAttribute('height', render.height + '');
      image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', render.img_link);

      var edge = parent.querySelector('rect');
      edge.setAttribute('width', render.width + '');
      edge.setAttribute('height', render.height + '');
    }
    function gameTerrainOnUpdate(scope) {
      var onUpdate_ = gameTerrainOnUpdate_(scope);
      var _terrain = scope.terrain;
      var _selection = R.path(['game', 'terrain_selection'], $rootScope.state);
      return function () {
        var current_selection = R.path(['game', 'terrain_selection'], $rootScope.state);
        if (scope.terrain === _terrain && current_selection === _selection) {
          return;
        }
        _terrain = scope.terrain;
        _selection = current_selection;
        onUpdate_();
      };
    }
    function gameTerrainOnUpdate_(scope) {
      return function () {
        console.warn('RENDER TERRAIN', scope.terrain.state.stamp);
        var state = $rootScope.state;
        var render = terrainModel.render(state.terrains, scope.terrain.state);
        scope.pos = render;
        updateTerrainSelection(state.game.terrain_selection, scope.terrain, scope);
        scope.$digest();
      };
    }
    function updateTerrainSelection(selection, terrain, scope) {
      var stamp = terrain.state.stamp;
      scope.selection = {
        local: gameTerrainSelectionModel.in('local', stamp, selection),
        remote: gameTerrainSelectionModel.in('remote', stamp, selection)
      };
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
      scope.digestOnStateChangeEvent('Game.terrains.change', scope);
      console.log('clickGameTerrainsList', scope.type);
    }
  }
})();
//# sourceMappingURL=terrain.js.map
