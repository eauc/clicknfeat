'use strict';

(function () {
  angular.module('clickApp.services').factory('modelGeom', modelGeomModelFactory);

  modelGeomModelFactory.$inject = ['point', 'gameFactions'];
  function modelGeomModelFactory(pointModel, gameFactionsModel) {
    return function (modelModel) {
      var modelGeomModel = {
        isBetweenPoints: modelIsBetweenPoints,
        shortestLineTo: modelShortestLineTo,
        baseEdgeInDirection: modelBaseEdgeInDirection,
        distanceTo: modelDistanceTo,
        distanceToAoE: modelDistanceToAoE,
        setB2BP: modelSetB2BP
      };
      return modelGeomModel;

      function modelIsBetweenPoints(top_left, bottom_right, model) {
        var x = R.path(['state', 'x'], model);
        var y = R.path(['state', 'y'], model);
        return top_left.x <= x && x <= bottom_right.x && top_left.y <= y && y <= bottom_right.y;
      }
      function modelShortestLineTo(factions, other, model) {
        var info = gameFactionsModel.getModelInfo(model.state.info, factions);
        var other_info = gameFactionsModel.getModelInfo(other.state.info, factions);

        var direction = pointModel.directionTo(other.state, model.state);
        var start = pointModel.translateInDirection(info.base_radius, direction, model.state);
        var end = pointModel.translateInDirection(other_info.base_radius, direction + 180, other.state);
        return { start: R.pick(['x', 'y'], start),
          end: R.pick(['x', 'y'], end)
        };
      }
      function modelBaseEdgeInDirection(factions, dir, model) {
        var info = gameFactionsModel.getModelInfo(model.state.info, factions);
        return R.thread(model.state)(pointModel.translateInDirection$(info.base_radius, dir), R.pick(['x', 'y']));
      }
      function modelDistanceTo(factions, other, model) {
        var info = gameFactionsModel.getModelInfo(model.state.info, factions);
        var other_info = gameFactionsModel.getModelInfo(other.state.info, factions);
        return pointModel.distanceTo(other.state, model.state) - info.base_radius - other_info.base_radius;
      }
      function modelDistanceToAoE(factions, aoe, model) {
        var info = gameFactionsModel.getModelInfo(model.state.info, factions);
        var aoe_size = aoe.state.s;
        return pointModel.distanceTo(aoe.state, model.state) - info.base_radius - aoe_size;
      }
      function modelSetB2BP(factions, other, model) {
        var info = gameFactionsModel.getModelInfo(model.state.info, factions);
        var other_info = gameFactionsModel.getModelInfo(other.state.info, factions);
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var direction = pointModel.directionTo(model.state, other.state);
          var distance = info.base_radius + other_info.base_radius;
          var position = pointModel.translateInDirection(distance, direction, other.state);
          return R.thread(model)(R.assocPath(['state', 'x'], position.x), R.assocPath(['state', 'y'], position.y), modelModel.checkState$(factions, null));
        });
      }
    };
  }
})();
//# sourceMappingURL=geom.js.map
