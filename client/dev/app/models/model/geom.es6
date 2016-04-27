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
        shortestLineTo: modelShortestLineTo,
        baseEdgeInDirection: modelBaseEdgeInDirection,
        distanceTo: modelDistanceTo,
        distanceToAoE: modelDistanceToAoE,
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
      function modelShortestLineTo(factions, other, model) {
        const info = gameFactionsModel.getModelInfo(model.state.info, factions);
        const other_info = gameFactionsModel.getModelInfo(other.state.info, factions);

        const direction = pointModel.directionTo(other.state, model.state);
        const start = pointModel.translateInDirection(info.base_radius,
                                                      direction,
                                                      model.state);
        const end = pointModel.translateInDirection(other_info.base_radius,
                                                    direction+180,
                                                    other.state);
        return { start: R.pick(['x','y'], start),
                 end: R.pick(['x','y'], end)
               };
      }
      function modelBaseEdgeInDirection(factions, dir, model) {
        const info = gameFactionsModel.getModelInfo(model.state.info, factions);
        return R.thread(model.state)(
          pointModel.translateInDirection$(info.base_radius, dir),
          R.pick(['x','y'])
        );
      }
      function modelDistanceTo(factions, other, model) {
        const info = gameFactionsModel.getModelInfo(model.state.info, factions);
        const other_info = gameFactionsModel.getModelInfo(other.state.info, factions);
        return ( pointModel.distanceTo(other.state, model.state) -
                 info.base_radius -
                 other_info.base_radius
               );
      }
      function modelDistanceToAoE(factions, aoe, model) {
        const info = gameFactionsModel.getModelInfo(model.state.info, factions);
        const aoe_size = aoe.state.s;
        return ( pointModel.distanceTo(aoe.state, model.state) -
                 info.base_radius -
                 aoe_size
               );
      }
      function modelSetB2BP(factions, other, model) {
        const info = gameFactionsModel.getModelInfo(model.state.info, factions);
        const other_info = gameFactionsModel.getModelInfo(other.state.info, factions);
        return R.threadP(model)(
          R.rejectIfP(modelModel.isLocked,
                      'Model is locked'),
          (model) => {
            const direction = pointModel.directionTo(model.state, other.state);
            const distance = info.base_radius + other_info.base_radius;
            const position = pointModel.translateInDirection(distance, direction,
                                                             other.state);
            return R.thread(model)(
              R.assocPath(['state','x'], position.x),
              R.assocPath(['state','y'], position.y),
              modelModel.checkState$(factions, null)
            );
          }
        );
      }
    };
  }
})();
