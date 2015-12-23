'use strict';

angular.module('clickApp.services').factory('gameMap', ['gameModels', 'gameTemplates', 'gameTerrains', function gameMapServiceFactory(gameModelsService, gameTemplatesService, gameTerrainsService) {
  var is_firefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
  var gameMapService = {
    isFlipped: function mapIsFlipped(map) {
      return map.classList.contains('flipped');
    },
    zoomFactor: function mapZoomFactor(map) {
      var map_rect = map.getBoundingClientRect();
      return map_rect.width / 480;
    },
    eventToMapCoordinates: function gameMapEventToMapCoordinates(map, event) {
      var event_x, event_y;
      if (is_firefox) {
        event_x = event.layerX;
        event_y = event.layerY;
      } else {
        event_x = event.offsetX;
        event_y = event.offsetY;
      }
      var rect = map.getBoundingClientRect();
      var map_x = event_x * 480 / rect.width;
      var map_y = event_y * 480 / rect.height;
      return { x: map_x, y: map_y };
    },
    mapToScreenCoordinates: function gameMapMapToScreenCoordinates(map, coord) {
      var map_flipped = gameMapService.isFlipped(map);
      var rect = map.getBoundingClientRect();
      var x = coord.x * rect.width / 480;
      var y = coord.y * rect.height / 480;
      if (map_flipped) {
        x = rect.width - x;
        y = rect.height - y;
      }
      x = x + rect.left;
      y = y + rect.top;
      return { x: x, y: y };
    },
    findEventTarget: function gameMapFindEventTarget(game, event) {
      var stamp;
      var not_found = {
        type: 'Map',
        target: null
      };
      if (event.target.classList.contains('template') && event.target.hasAttribute('data-stamp')) {
        stamp = event.target.getAttribute('data-stamp');
        return R.pipeP(function () {
          return gameTemplatesService.findStamp(stamp, game.templates);
        }, function (template) {
          return { type: 'Template',
            target: template
          };
        })().catch(R.always(not_found));
      }
      if (event.target.classList.contains('model-base') && event.target.hasAttribute('data-stamp')) {
        stamp = event.target.getAttribute('data-stamp');
        return R.pipeP(function () {
          return gameModelsService.findStamp(stamp, game.models);
        }, function (model) {
          return { type: 'Model',
            target: model
          };
        })().catch(R.always(not_found));
      }
      if (event.target.classList.contains('terrain-image') && event.target.hasAttribute('data-stamp')) {
        stamp = event.target.getAttribute('data-stamp');
        return R.pipeP(function () {
          return gameTerrainsService.findStamp(stamp, game.terrains);
        }, function (terrain) {
          return { type: 'Terrain',
            target: terrain
          };
        })().catch(R.always(not_found));
      }
      return self.Promise.resolve(not_found);
    }
  };
  R.curryService(gameMapService);
  return gameMapService;
}]);
//# sourceMappingURL=map.js.map