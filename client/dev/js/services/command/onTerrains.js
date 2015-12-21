'use strict';

angular.module('clickApp.services').factory('onTerrainsCommand', ['commands', 'terrain', 'gameTerrains', 'gameTerrainSelection', function onTerrainsCommandServiceFactory(commandsService, terrainService, gameTerrainsService, gameTerrainSelectionService) {
  var onTerrainsCommandService = {
    execute: function onTerrainsExecute(method) /*, stamps, scope, game */{
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      if ('Function' !== R.type(terrainService[method])) {
        return self.Promise.reject('Unknown method ' + method + ' on terrain');
      }

      var game = R.last(args);
      var scope = R.nth(-2, args);
      var stamps = R.nth(-3, args);
      var ctxt = {
        before: [],
        after: [],
        desc: method
      };

      args = R.pipe(R.slice(0, -2), R.prepend(method), R.append(game.terrains))(args);

      return R.pipeP(function () {
        return gameTerrainsService.onStamps$('saveState', stamps, game.terrains);
      }, function (before) {
        ctxt.before = before;

        return gameTerrainsService.onStamps.apply(null, args);
      }, function () {
        return gameTerrainsService.onStamps('saveState', stamps, game.terrains);
      }, function (after) {
        ctxt.after = after;

        R.forEach(function (stamp) {
          scope.gameEvent('changeTerrain-' + stamp);
        }, stamps);

        return ctxt;
      })();
    },
    replay: function onTerrainsRedo(ctxt, scope, game) {
      var stamps = R.pluck('stamp', ctxt.after);
      return R.pipeP(gameTerrainsService.findAnyStamps$(stamps), R.addIndex(R.forEach)(function (terrain, index) {
        if (R.isNil(terrain)) return;

        terrainService.setState(ctxt.after[index], terrain);
        scope.gameEvent('changeTerrain-' + terrainService.eventName(terrain));
      }), function () {
        game.terrain_selection = gameTerrainSelectionService.set('remote', stamps, scope, game.terrain_selection);
      })(game.terrains);
    },
    undo: function onTerrainsUndo(ctxt, scope, game) {
      var stamps = R.pluck('stamp', ctxt.before);
      return R.pipeP(gameTerrainsService.findAnyStamps$(stamps), R.addIndex(R.forEach)(function (terrain, index) {
        if (R.isNil(terrain)) return;

        terrainService.setState(ctxt.before[index], terrain);
        scope.gameEvent('changeTerrain-' + terrainService.eventName(terrain));
      }), function () {
        game.terrain_selection = gameTerrainSelectionService.set('remote', stamps, scope, game.terrain_selection);
      })(game.terrains);
    }
  };
  commandsService.registerCommand('onTerrains', onTerrainsCommandService);
  return onTerrainsCommandService;
}]);
//# sourceMappingURL=onTerrains.js.map
