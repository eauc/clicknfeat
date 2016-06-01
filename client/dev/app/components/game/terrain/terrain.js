'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.directives').directive('clickGameTerrain', clickGameTerrainDirectiveFactory).directive('clickGameTerrainsList', clickGameTerrainsListDirectiveFactory);

  clickGameTerrainDirectiveFactory.$inject = ['appGame', 'terrain', 'gameTerrains', 'gameTerrainSelection'];
  function clickGameTerrainDirectiveFactory(appGameService, terrainModel, gameTerrainsModel, gameTerrainSelectionModel) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope) {
      console.warn('gameTerrain', scope.terrain);

      var stamp = scope.terrain.state.stamp;
      scope.listenSignal(refreshSelection, appGameService.terrains.selection_changes, scope);
      scope.listenSignal(onTerrainsChanges, appGameService.terrains.changes, scope);
      mount();

      function onTerrainsChanges(_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var terrains = _ref2[0];
        var stamps = _ref2[1];

        if (!R.find(R.equals(stamp), stamps)) return;

        refreshRender(terrains);
      }
      function mount() {
        var terrains = appGameService.terrains.terrains.sample();
        refreshRender(terrains);

        var selection = appGameService.terrains.selection.sample();
        refreshSelection(selection);
      }
      function refreshRender(terrains) {
        var terrain = gameTerrainsModel.findStamp(stamp, terrains);
        if (R.isNil(terrain)) return;
        scope.terrain = terrain;

        terrain.render = terrainModel.render(terrain);

        console.warn('RENDER TERRAIN', stamp, terrain.state, terrain.render);
      }
      function refreshSelection(selection) {
        var local = gameTerrainSelectionModel.in('local', stamp, selection);
        var remote = gameTerrainSelectionModel.in('remote', stamp, selection);
        var selected = local || remote;
        scope.selection = {
          local: local,
          remote: remote,
          selected: selected
        };
        console.warn('SELECTION TERRAIN', stamp, selection, scope.selection);
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
//# sourceMappingURL=terrain.js.map
