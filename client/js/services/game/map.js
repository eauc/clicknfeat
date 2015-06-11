'use strict';

self.gameMapServiceFactory = function gameMapServiceFactory(gameModelsService,
                                                            gameTemplatesService) {
  var gameMapService = {
    isFlipped: function mapIsFlipped(map) {
      return map.hasAttribute('flipped');
    },
    zoomFactor: function mapZoomFactor(map) {
      var map_rect = map.getBoundingClientRect();
      return map_rect.width / 480;
    },
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
      var map_flipped = gameMapService.isFlipped(map);
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
      var stamp;
      if(event.target.classList.contains('template') &&
         event.target.hasAttribute('data-stamp')) {
        stamp = event.target.getAttribute('data-stamp');
        var template = gameTemplatesService.findStamp(stamp, game.templates);
        if(R.exists(template)) {
          return { type: 'Template',
                   target: template
                 };
        }
      }
      if(event.target.classList.contains('model-base') &&
         event.target.hasAttribute('data-stamp')) {
        stamp = event.target.getAttribute('data-stamp');
        var model = gameModelsService.findStamp(stamp, game.models);
        if(R.exists(model)) {
          return { type: 'Model',
                   target: model
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
};
