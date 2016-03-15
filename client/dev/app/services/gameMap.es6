(function() {
  angular.module('clickApp.services')
    .factory('gameMap', gameMapServiceFactory);

  gameMapServiceFactory.$inject = [
    'gameModels',
    'gameTemplates',
    'gameTerrains',
  ];
  function gameMapServiceFactory(gameModelsModel,
                                 gameTemplatesModel,
                                 gameTerrainsModel) {
    const gameMapService = {
      isFlipped: mapIsFlipped,
      zoomFactor: mapZoomFactor,
      eventToMapCoordinates: gameMapEventToMapCoordinates,
      mapToScreenCoordinates: gameMapMapToScreenCoordinates,
      findEventTarget: gameMapFindEventTarget
    };

    R.curryService(gameMapService);
    return gameMapService;

    function mapIsFlipped(map) {
      return map.classList.contains('flipped');
    }
    function mapZoomFactor(map) {
      var map_rect = map.getBoundingClientRect();
      return map_rect.width / 480;
    }
    function gameMapEventToMapCoordinates(map, event) {
      var map_flipped = gameMapService.isFlipped(map);
      var rect = map.getBoundingClientRect();
      var map_x = (event.clientX - rect.left) * 480 / rect.width;
      var map_y = (event.clientY - rect.top) * 480 / rect.height;
      map_x = ( map_flipped ? 480 - map_x : map_x );
      map_y = ( map_flipped ? 480 - map_y : map_y );
      return { x: map_x, y: map_y };
    }
    function gameMapMapToScreenCoordinates(map, coord) {
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
    }
    function gameMapFindEventTarget(game, event) {
      const not_found = {
        type: 'Map',
        target: null
      };
      if(eventTargetTypeIs('template')) {
        return emitTypeEvent(gameTemplatesModel, 'template');
      }
      if(eventTargetTypeIs('model-base')) {
        return emitTypeEvent(gameModelsModel, 'model');
      }
      if(eventTargetTypeIs('terrain-image')) {
        return emitTypeEvent(gameTerrainsModel, 'terrain');
      }
      return R.resolveP(not_found);

      function eventTargetTypeIs(type) {
        return ( event.target.classList.contains(type) &&
                 event.target.hasAttribute('data-stamp')
               );
      }
      function emitTypeEvent(model, type) {
        const stamp = event.target.getAttribute('data-stamp');
        return R.threadP(game)(
          R.prop(`${type}s`),
          model.findStampP$(stamp),
          (element) => ({ type: s.capitalize(type),
                          target: element
                        })
        ).catch(R.always(not_found));
      }
    }
  }
})();
