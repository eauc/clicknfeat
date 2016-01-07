angular.module('clickApp.directives')
  .directive('clickGameTerrain', [
    'gameMap',
    'gameTerrains',
    'gameTerrainInfo',
    'gameTerrainSelection',
    function(gameMapService,
             gameTerrainsService,
             gameTerrainInfoService,
             gameTerrainSelectionService) {
      var clickGameTerrainDirective = {
        restrict: 'A',
        link: (scope, parent) => {
          let state = scope.state;
          R.pipeP(
            () => {
              return gameTerrainInfoService
                .getInfo(scope.terrain.state.info, state.terrains)
                .catch((reason) => {
                  console.error('clickGameTerrain', reason);
                  return self.Promise.reject(reason);
                });
            },
            (info) => {
              console.log('gameTerrain', scope.terrain, info);

              return buildTerrainElement(state, info, scope.terrain,
                                         parent[0], scope);
            }
          )();
        }
      };
      function buildTerrainElement(state, info, terrain, parent, scope) {
        var element = createTerrainElement(info, terrain, parent);

        var updateTerrain = gameTerrainOnUpdate(state, info,
                                                scope, element);
        scope.onStateChangeEvent(`Game.terrain.change.${terrain.state.stamp}`,
                                 updateTerrain, scope);
        updateTerrain();
      }
      function createTerrainElement(info, terrain, parent) {
        var map = document.getElementById('map');
        var svgNS = map.namespaceURI;

        var image = document.createElementNS(svgNS, 'image');
        image.classList.add('terrain-image');
        image.setAttribute('data-stamp', terrain.state.stamp);
        image.setAttribute('x', '0');
        image.setAttribute('y', '0');
        image.setAttribute('width', info.img.width+'');
        image.setAttribute('height', info.img.height+'');
        image.setAttributeNS('http://www.w3.org/1999/xlink', 'href', info.img.link);
        parent.appendChild(image);

        var direction = document.createElementNS(svgNS, 'line');
        direction.classList.add('terrain-los');
        direction.setAttribute('x1', (info.img.width/2)+'');
        direction.setAttribute('y1', (info.img.height/2)+'');
        direction.setAttribute('x2', (info.img.width/2)+'');
        direction.setAttribute('y2', '0');
        parent.appendChild(direction);

        var edge = document.createElementNS(svgNS, 'rect');
        edge.classList.add('terrain-edge');
        edge.setAttribute('x', '0');
        edge.setAttribute('y', '0');
        edge.setAttribute('width', (info.img.width)+'');
        edge.setAttribute('height', (info.img.height)+'');
        parent.appendChild(edge);

        return { container: parent,
                 image: image,
                 direction: direction,
                 edge: edge
               };
      }
      function gameTerrainOnUpdate(state, info, scope, element) {
        return () => {
          R.pipeP(
            () => {
              return gameTerrainsService
                .findStamp(scope.terrain.state.stamp,
                           scope.state.game.terrains);
            },
            (terrain) => {
              updateTerrainPosition(info.img, terrain, element);
              updateTerrainSelection(state.game.terrain_selection,
                                     terrain, element);
            }
          )();
        };
      }
      function updateTerrainPosition(img, terrain, element) {
        element.container.setAttribute('transform', [
          'translate(',
          terrain.state.x-img.width/2,
          ',',
          terrain.state.y-img.height/2,
          ') rotate(',
          terrain.state.r,
          ',',
          img.width/2,
          ',',
          img.height/2,
          ')'
        ].join(''));
      }
      function updateTerrainSelection(selection, terrain, element) {
        var container = element.container;
        var stamp = terrain.state.stamp;
        if(gameTerrainSelectionService.in('local', stamp, selection)) {
          container.classList.add('local-selection');
        }
        else {
          container.classList.remove('local-selection');
        }
        if(gameTerrainSelectionService.in('remote', stamp, selection)) {
          container.classList.add('remote-selection');
        }
        else {
          container.classList.remove('remote-selection');
        }
      }
      return clickGameTerrainDirective;
    }
  ])
  .directive('clickGameTerrainsList', [
    function() {
      return {
        restrict: 'A',
        templateUrl: 'partials/game/terrains_list.html',
        scope: true,
        link: function(scope, element) {
          scope.type = element[0].getAttribute('click-game-terrains-list');
          scope.digestOnStateChangeEvent('Game.terrain.create', scope);
          console.log('clickGameTerrainsList', scope.type);
        }
      };
    }
  ]);
