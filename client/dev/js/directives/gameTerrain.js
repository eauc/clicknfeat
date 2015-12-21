'use strict';

angular.module('clickApp.directives').directive('clickGameTerrain', ['gameMap', 'gameTerrainInfo', 'gameTerrainSelection', 'terrain', function (gameMapService, gameTerrainInfoService, gameTerrainSelectionService) {
  var clickGameTerrainDirective = {
    restrict: 'A',
    link: function link(scope, el /*, attrs*/) {
      R.pipeP(function () {
        return gameTerrainInfoService.getInfo(scope.terrain.state.info, scope.terrains).catch(function (reason) {
          console.error('clickGameTerrain', reason);
          return self.Promise.reject(reason);
        });
      }, function (info) {
        console.log('gameTerrain', scope.terrain, info);

        return buildTerrainElement(info, scope.terrain, el[0], scope);
      })();
    }
  };
  function buildTerrainElement(info, terrain, container, scope) {
    var element = createTerrainElement(info, terrain, container);

    // scope.$on('$destroy', gameTerrainOnDestroy(element));
    // scope.onGameEvent('mapFlipped',
    //                   gameTerrainOnMapFlipped(info, terrain, element),
    //                   scope);
    var updateTerrain = gameTerrainOnUpdate(scope.terrains, info, terrain, scope.game, scope, element);
    scope.onGameEvent('changeTerrain-' + terrain.state.stamp, updateTerrain, scope);
    updateTerrain();
  }
  function createTerrainElement(info, terrain, parent) {
    var map = document.getElementById('map');
    var svgNS = map.namespaceURI;

    // var title = document.createElementNS(svgNS, 'title');
    // base.appendChild(title);
    // title.innerHTML = info.name;

    var image = document.createElementNS(svgNS, 'image');
    image.classList.add('terrain-image');
    image.setAttribute('data-stamp', terrain.state.stamp);
    image.setAttribute('x', '0');
    image.setAttribute('y', '0');
    image.setAttribute('width', info.img.width + '');
    image.setAttribute('height', info.img.height + '');
    image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', info.img.link);
    parent.appendChild(image);

    var direction = document.createElementNS(svgNS, 'line');
    direction.classList.add('terrain-los');
    direction.setAttribute('x1', info.img.width / 2 + '');
    direction.setAttribute('y1', info.img.height / 2 + '');
    direction.setAttribute('x2', info.img.width / 2 + '');
    direction.setAttribute('y2', '0');
    parent.appendChild(direction);

    var edge = document.createElementNS(svgNS, 'rect');
    edge.classList.add('terrain-edge');
    edge.setAttribute('x', '0');
    edge.setAttribute('y', '0');
    edge.setAttribute('width', info.img.width + '');
    edge.setAttribute('height', info.img.height + '');
    parent.appendChild(edge);

    return { container: parent,
      image: image,
      direction: direction,
      edge: edge
    };
  }
  // function gameTerrainOnDestroy(/*element*/) {
  //   return function _gameTerrainOnDestroy() {
  //     console.log('gameTerrainOnDestroy');
  //   };
  // }
  // function gameTerrainOnMapFlipped(/*info, terrain, element*/) {
  //   return function _gameTerrainOnMapFlipped() {
  //   };
  // }
  function gameTerrainOnUpdate(terrains, info, terrain, game, scope, element) {
    return function () {
      updateTerrainPosition(info.img, terrain, element);
      updateTerrainSelection(game.terrain_selection, terrain, element);
    };
  }
  function updateTerrainPosition(img, terrain, element) {
    element.container.setAttribute('transform', ['translate(', terrain.state.x - img.width / 2, ',', terrain.state.y - img.height / 2, ') rotate(', terrain.state.r, ',', img.width / 2, ',', img.height / 2, ')'].join(''));
  }
  function updateTerrainSelection(selection, terrain, element) {
    var container = element.container;
    var stamp = terrain.state.stamp;
    if (gameTerrainSelectionService.in('local', stamp, selection)) {
      container.classList.add('local-selection');
    } else {
      container.classList.remove('local-selection');
    }
    if (gameTerrainSelectionService.in('remote', stamp, selection)) {
      container.classList.add('remote-selection');
    } else {
      container.classList.remove('remote-selection');
    }
  }
  return clickGameTerrainDirective;
}]).directive('clickGameTerrainsList', [function () {
  return {
    restrict: 'A',
    templateUrl: 'partials/game/terrains_list.html',
    scope: true,
    link: function link(scope, element /*, attrs*/) {
      scope.type = element[0].getAttribute('click-game-terrains-list');
      console.log('clickGameTerrainsList', scope.type);
    }
  };
}]);
//# sourceMappingURL=gameTerrain.js.map
