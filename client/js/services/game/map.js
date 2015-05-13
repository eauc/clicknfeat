'use strict';

angular.module('clickApp.services')
  .factory('gameMap', [
    'gameTemplates',
    function gameMapServiceFactory(gameTemplatesService) {
      var gameMapService = {
        eventToMapCoordinates: function gameMapEventToMapCoordinates(map, event) {
          var event_x, event_y;
          if(event.offsetX) {
            event_x = event.offsetX;
            event_y = event.offsetY;
          }
          else {
            event_x = event.layerX;
            event_y = event.layerY;
          }
          var rect = map.getBoundingClientRect();
          var map_x = event_x * 480 / rect.width;
          var map_y = event_y * 480 / rect.height;
          return { x: map_x, y: map_y };
        },
        mapToScreenCoordinates: function gameMapMapToScreenCoordinates(map, coord) {
          var map_flipped = map.hasAttribute('flipped');
          var rect = map.getBoundingClientRect();
          var x = (coord.x * rect.width / 480);
          var y = (coord.y * rect.height / 480);
          if(map_flipped) {
            x = rect.width - x;
            y = rect.height - y;
          }
          x = x + rect.left;
          y = y + rect.top;
          return { x: x, y: y };
        },
        findEventTarget: function gameMapFindEventTarget(game, event) {
          if(event.target.classList.contains('template') &&
             event.target.hasAttribute('data-stamp')) {
            var stamp = event.target.getAttribute('data-stamp');
            var template = gameTemplatesService.findStamp(stamp, game.templates);
            if(R.exists(template)) {
              return { type: 'Template',
                       target: template
                     };
            }
          }
          return { type: 'Map',
                   target: null
                 };
        },
      };
      R.curryService(gameMapService);
      return gameMapService;
    }
  ]);
