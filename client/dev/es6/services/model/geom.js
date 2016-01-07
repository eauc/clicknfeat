angular.module('clickApp.services')
  .factory('modelGeom', [
    'point',
    'gameFactions',
    function modelGeomServiceFactory(pointService,
                                     gameFactionsService) {
      return function(modelService) {
        var modelGeomService = {
          isBetweenPoints: function modelIsBetweenPoints(top_left, bottom_right, model) {
            var x = R.path(['state','x'], model);
            var y = R.path(['state','y'], model);
            return ( top_left.x <= x && x <= bottom_right.x &&
                     top_left.y <= y && y <= bottom_right.y
                   );
          },
          shortestLineTo: function modelShortestLineTo(factions, other, model) {
            var direction = pointService.directionTo(other.state, model.state);
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                var start = pointService.translateInDirection(info.base_radius,
                                                              direction,
                                                              model.state);
                return R.pipeP(
                  gameFactionsService.getModelInfo$(other.state.info),
                  (other_info) => {
                    var end = pointService.translateInDirection(other_info.base_radius,
                                                                direction+180,
                                                                other.state);
                    return { start: R.pick(['x','y'], start),
                             end: R.pick(['x','y'], end)
                           };
                  }
                )(factions);
              }
            )(factions);
          },
          baseEdgeInDirection: function modelBaseEdgeInDirection(factions, dir, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                return R.pipe(
                  pointService.translateInDirection$(info.base_radius, dir),
                  R.pick(['x','y'])
                )(model.state);
              }
            )(factions);
          },
          distanceTo: function modelDistanceTo(factions, other, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                return R.pipeP(
                  gameFactionsService.getModelInfo$(other.state.info),
                  (other_info) => {
                    return ( pointService.distanceTo(other.state, model.state) -
                             info.base_radius -
                             other_info.base_radius
                           );
                  }
                )(factions);
              }
            )(factions);
          },
          distanceToAoE: function modelDistanceToAoE(factions, aoe, model) {
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                var aoe_size = aoe.state.s;
                return ( pointService.distanceTo(aoe.state, model.state) -
                         info.base_radius -
                         aoe_size
                       );
              }
            )(factions);
          },
          setB2B: function modelSetB2B(factions, other, model) {
            if(modelService.isLocked(model)) {
              return self.Promise.reject('Model is locked');
            }
            var direction = pointService.directionTo(model.state, other.state); 
            return R.pipeP(
              gameFactionsService.getModelInfo$(model.state.info),
              (info) => {
                return R.pipeP(
                  gameFactionsService.getModelInfo$(other.state.info),
                  (other_info) => {
                    var distance = info.base_radius + other_info.base_radius;
                    var position = pointService.translateInDirection(distance, direction,
                                                                     other.state);
                    model = R.pipe(
                      R.assocPath(['state','x'], position.x),
                      R.assocPath(['state','y'], position.y)
                    )(model);
                    return modelService.checkState(factions, null, model);
                  }
                )(factions);
              }
            )(factions);
          }
        };
        return modelGeomService;
      };
    }
  ]);
