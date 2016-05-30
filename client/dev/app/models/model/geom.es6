(function() {
  angular.module('clickApp.services')
    .factory('modelGeom', modelGeomModelFactory);

  modelGeomModelFactory.$inject = [
    'point',
  ];
  function modelGeomModelFactory(pointModel) {
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
      function modelShortestLineTo(other, model) {
        const info = model.info;
        const other_info = other.info;

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
      function modelBaseEdgeInDirection(dir, model) {
        const info = model.info;
        return R.thread(model.state)(
          pointModel.translateInDirection$(info.base_radius, dir),
          R.pick(['x','y'])
        );
      }
      function modelDistanceTo(other, model) {
        const info = model.info;
        const other_info = other.info;
        return ( pointModel.distanceTo(other.state, model.state) -
                 info.base_radius -
                 other_info.base_radius
               );
      }
      function modelDistanceToAoE(aoe, model) {
        const info = model.info;
        const aoe_size = aoe.state.s;
        return ( pointModel.distanceTo(aoe.state, model.state) -
                 info.base_radius -
                 aoe_size
               );
      }
      function modelSetB2BP(other, model) {
        const info = model.info;
        const other_info = other.info;
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
              modelModel.checkState$(null)
            );
          }
        );
      }
    };
  }
})();
