(function() {
  angular.module('clickApp.services')
    .factory('modelGeom', modelGeomModelFactory);

  modelGeomModelFactory.$inject = [
    'point',
    'gameFactions',
  ];
  function modelGeomModelFactory(pointModel,
                                 gameFactionsModel) {
    return (modelModel) => {
      const modelGeomModel = {
        isBetweenPoints: modelIsBetweenPoints,
        shortestLineToP: modelShortestLineToP,
        baseEdgeInDirectionP: modelBaseEdgeInDirectionP,
        distanceToP: modelDistanceToP,
        distanceToAoEP: modelDistanceToAoEP,
        setB2BP: modelSetB2BP
      };
      return modelGeomModel;

      function modelIsBetweenPoints(top_left, bottom_right, model) {
        const x = R.path(['state','x'], model);
        const y = R.path(['state','y'], model);
        return ( top_left.x <= x && x <= bottom_right.x &&
                 top_left.y <= y && y <= bottom_right.y
               );
      }
      function modelShortestLineToP(factions, other, model) {
        const direction = pointModel.directionTo(other.state, model.state);
        return R.threadP(factions)(
          gameFactionsModel.getModelInfoP$(model.state.info),
          (info) => {
            const start = pointModel.translateInDirection(info.base_radius,
                                                            direction,
                                                            model.state);
            return R.threadP(factions)(
              gameFactionsModel.getModelInfoP$(other.state.info),
              (other_info) => {
                const end = pointModel.translateInDirection(other_info.base_radius,
                                                              direction+180,
                                                              other.state);
                return { start: R.pick(['x','y'], start),
                         end: R.pick(['x','y'], end)
                       };
              }
            );
          }
        );
      }
      function modelBaseEdgeInDirectionP(factions, dir, model) {
        return R.threadP(factions)(
          gameFactionsModel.getModelInfoP$(model.state.info),
          (info) => R.thread(model.state)(
            pointModel.translateInDirection$(info.base_radius, dir),
            R.pick(['x','y'])
          )
        );
      }
      function modelDistanceToP(factions, other, model) {
        return R.threadP(factions)(
          gameFactionsModel.getModelInfoP$(model.state.info),
          (info) => R.threadP(factions)(
            gameFactionsModel.getModelInfoP$(other.state.info),
            (other_info) => {
              return ( pointModel.distanceTo(other.state, model.state) -
                       info.base_radius -
                       other_info.base_radius
                     );
            }
          )
        );
      }
      function modelDistanceToAoEP(factions, aoe, model) {
        return R.threadP(factions)(
          gameFactionsModel.getModelInfoP$(model.state.info),
          (info) => {
            const aoe_size = aoe.state.s;
            return ( pointModel.distanceTo(aoe.state, model.state) -
                     info.base_radius -
                     aoe_size
                   );
          }
        );
      }
      function modelSetB2BP(factions, other, model) {
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                     'Model is locked'),
          (model) => {
            const direction = pointModel.directionTo(model.state, other.state);
            return R.threadP(factions)(
              gameFactionsModel.getModelInfoP$(model.state.info),
              (info) => R.threadP(factions)(
                gameFactionsModel.getModelInfoP$(other.state.info),
                (other_info) => {
                  const distance = info.base_radius + other_info.base_radius;
                  const position = pointModel.translateInDirection(distance, direction,
                                                                     other.state);
                  return R.thread(model)(
                    R.assocPath(['state','x'], position.x),
                    R.assocPath(['state','y'], position.y)
                  );
                },
                modelModel.checkStateP$(factions, null)
              )
            );
          }
        );
      }
    };
  }
})();
