'use strict';

(function () {
  angular.module('clickApp.directives').directive('clickGameCreateTerrain', clickGameCreateTerrainDirectiveFactory);

  clickGameCreateTerrainDirectiveFactory.$inject = ['gameTerrainInfo', 'gameMap'];
  function clickGameCreateTerrainDirectiveFactory(gameTerrainInfoModel, gameMapModel) {
    return {
      restrict: 'A',
      link: link
    };

    function link(scope, parent) {
      var map = document.getElementById('map');
      var svgNS = map.namespaceURI;

      console.log('clickCreateTerrain', scope.index);
      var state = scope.state;
      var terrain = R.nth(scope.index, state.create.terrains);
      R.threadP(state.terrains)(gameTerrainInfoModel.getInfoP$(terrain.info), function (info) {
        var element = createTerrainElement(info, document, svgNS, parent[0]);
        var is_flipped = gameMapModel.isFlipped(map);
        setTerrainPosition(info, state.create.base, is_flipped, terrain, element);

        scope.onStateChangeEvent('Game.create.update', updateTerrainElement(map, state, info, terrain, element), scope);
      });
    }
    function createTerrainElement(info, document, svgNS, parent) {
      var element = document.createElementNS(svgNS, 'rect');
      element.classList.add('create-terrain');
      element.setAttribute('x', '240');
      element.setAttribute('y', '240');
      element.setAttribute('width', info.img.width);
      element.setAttribute('height', info.img.height);
      parent.appendChild(element);
      return element;
    }
    function updateTerrainElement(map, state, info, terrain, element) {
      return function () {
        var is_flipped = gameMapModel.isFlipped(map);
        setTerrainPosition(info, state.create.base, is_flipped, terrain, element);
      };
    }
    function setTerrainPosition(info, base, is_flipped, terrain, element) {
      var coeff = is_flipped ? -1 : 1;
      element.setAttribute('x', base.x + coeff * terrain.x - info.img.width / 2 + '');
      element.setAttribute('y', base.y + coeff * terrain.y - info.img.height / 2 + '');
    }
  }
})();
//# sourceMappingURL=createTerrain.js.map
