angular.module('clickApp.directives')
  .directive('clickGameCreateTerrain', [
    '$window',
    'gameTerrainInfo',
    'gameMap',
    function($window,
             gameTerrainInfoService,
             gameMapService) {
      return {
        restrict: 'A',
        link: function(scope, el/*, attrs*/) {
          var map = document.getElementById('map');
          var svgNS = map.namespaceURI;

          console.log('clickCreateTerrain', scope.index);
          var terrain = R.nth(scope.index, scope.create.terrain.terrains);

          R.pipeP(
            gameTerrainInfoService.getInfo$(terrain.info),
            (info) => {
              var element = createTerrainElement(info, document, svgNS, el[0]);
              var is_flipped = gameMapService.isFlipped(map);
              setTerrainPosition(info, scope.create.terrain.base, is_flipped, terrain, element);
          
              scope.onGameEvent('moveCreateTerrain', () => {
                is_flipped = gameMapService.isFlipped(map);
                setTerrainPosition(info, scope.create.terrain.base, is_flipped, terrain, element);
              }, scope);
            }
          )(scope.terrains);
        }
      };
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
      function setTerrainPosition(info, base, is_flipped, terrain, element) {
        var coeff = is_flipped ? -1 : 1;
        element.setAttribute('x', (base.x + coeff * terrain.x - info.img.width / 2)+'');
        element.setAttribute('y', (base.y + coeff * terrain.y - info.img.height / 2)+'');
      }
    }
  ]);
