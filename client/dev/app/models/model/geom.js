'use strict';

(function () {
  angular.module('clickApp.services').factory('modelGeom', modelGeomModelFactory);

  modelGeomModelFactory.$inject = ['point', 'gameFactions'];
  function modelGeomModelFactory(pointModel, gameFactionsModel) {
    return function (modelModel) {
      var modelGeomModel = {
        isBetweenPoints: modelIsBetweenPoints,
        shortestLineToP: modelShortestLineToP,
        baseEdgeInDirectionP: modelBaseEdgeInDirectionP,
        distanceToP: modelDistanceToP,
        distanceToAoEP: modelDistanceToAoEP,
        setB2BP: modelSetB2BP
      };
      return modelGeomModel;

      function modelIsBetweenPoints(top_left, bottom_right, model) {
        var x = R.path(['state', 'x'], model);
        var y = R.path(['state', 'y'], model);
        return top_left.x <= x && x <= bottom_right.x && top_left.y <= y && y <= bottom_right.y;
      }
      function modelShortestLineToP(factions, other, model) {
        var direction = pointModel.directionTo(other.state, model.state);
        return R.threadP(factions)(gameFactionsModel.getModelInfo$(model.state.info), function (info) {
          var start = pointModel.translateInDirection(info.base_radius, direction, model.state);
          return R.threadP(factions)(gameFactionsModel.getModelInfo$(other.state.info), function (other_info) {
            var end = pointModel.translateInDirection(other_info.base_radius, direction + 180, other.state);
            return { start: R.pick(['x', 'y'], start),
              end: R.pick(['x', 'y'], end)
            };
          });
        });
      }
      function modelBaseEdgeInDirectionP(factions, dir, model) {
        return R.threadP(factions)(gameFactionsModel.getModelInfo$(model.state.info), function (info) {
          return R.thread(model.state)(pointModel.translateInDirection$(info.base_radius, dir), R.pick(['x', 'y']));
        });
      }
      function modelDistanceToP(factions, other, model) {
        return R.threadP(factions)(gameFactionsModel.getModelInfo$(model.state.info), function (info) {
          return R.threadP(factions)(gameFactionsModel.getModelInfo$(other.state.info), function (other_info) {
            return pointModel.distanceTo(other.state, model.state) - info.base_radius - other_info.base_radius;
          });
        });
      }
      function modelDistanceToAoEP(factions, aoe, model) {
        return R.threadP(factions)(gameFactionsModel.getModelInfo$(model.state.info), function (info) {
          var aoe_size = aoe.state.s;
          return pointModel.distanceTo(aoe.state, model.state) - info.base_radius - aoe_size;
        });
      }
      function modelSetB2BP(factions, other, model) {
        return R.threadP(model)(R.rejectIfP(modelModel.isLocked, 'Model is locked'), function (model) {
          var direction = pointModel.directionTo(model.state, other.state);
          return R.threadP(factions)(gameFactionsModel.getModelInfo$(model.state.info), function (info) {
            return R.threadP(factions)(gameFactionsModel.getModelInfo$(other.state.info), function (other_info) {
              var distance = info.base_radius + other_info.base_radius;
              var position = pointModel.translateInDirection(distance, direction, other.state);
              return R.thread(model)(R.assocPath(['state', 'x'], position.x), R.assocPath(['state', 'y'], position.y));
            }, modelModel.checkStateP$(factions, null));
          });
        });
      }
    };
  }
})();
//# sourceMappingURL=geom.js.map
