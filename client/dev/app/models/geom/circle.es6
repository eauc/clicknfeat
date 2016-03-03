(function() {
  angular.module('clickApp.services')
    .factory('circle', circleModelFactory);

  circleModelFactory.$inject = [
    'point',
    'line',
  ];
  function circleModelFactory(pointModel,
                              lineModel) {
    const circleModel = {
      positionToLine: circlePositionToLine,
      isLeftOfLine: circleIsLeftOfLine,
      isRightOfLine: circleIsRightOfLine,
      isInEnvelope: circleIsInEnvelope,
      isInBox: circleIsInBox,
      intersectLine: circleIntersectLine,
      pointOnEdgeInDirection: circlePointOnEdgeInDirection,
      pointOnEdgeTangentTo: circlePointOnEdgeTangentTo,
      envelopeDirectionsTo: circleEnvelopeDirectionsTo,
      envelopeTo: circleEnvelopeTo,
      outsideEnvelopeTo: circleOutsideEnvelopeTo
    };

    R.curryService(circleModel);
    return circleModel;

    function circlePositionToLine (line, circle) {
      const delta = pointModel.differenceFrom(line.start, circle);
      const line_length = lineModel.length(line);
      const line_vector = lineModel.vector(line);
      const vect_prod = pointModel.vectorProduct(line_vector, delta);
      const scal_prod = pointModel.scalarProduct(line_vector, delta);

      return [vect_prod, scal_prod, line_length];
    }
    function circleIsLeftOfLine(line, circle) {
      const [ vect_prod, scal_prod, line_length ] =
            circleModel.positionToLine(line, circle);

      return ( vect_prod + circle.radius >= 0 &&
               scal_prod + circle.radius >= 0 &&
               scal_prod - circle.radius <= line_length
             );
    }
    function circleIsRightOfLine(line, circle) {
      const [ vect_prod, scal_prod, line_length ] =
            circleModel.positionToLine(line, circle);

      return ( vect_prod - circle.radius <= 0 &&
               scal_prod + circle.radius >= 0 &&
               scal_prod - circle.radius <= line_length
             );
    }
    function circleIsInEnvelope(envelope, circle) {
      return ( circleModel.isRightOfLine(envelope.left, circle) &&
               circleModel.isLeftOfLine(envelope.right, circle)
             );
    }
    function circleIsInBox(box, circle) {
      let dx;
      let dy;
      if(circle.x >= box.low.x &&
         circle.x <= box.high.x &&
         circle.y >= box.low.y &&
         circle.y <= box.high.x) return true;
      if(circle.x >= box.low.x - circle.radius &&
         circle.x <  box.low.x) {
        dx = box.low.x - circle.x;
        dy = Math.sqrt(circle.radius * circle.radius - dx * dx);
        return ( circle.y + dy >= box.low.y &&
                 circle.y - dy <= box.high.y
               );
      }
      if(circle.x <= box.high.x + circle.radius &&
         circle.x >  box.high.x) {
        dx = box.high.x - circle.x;
        dy = Math.sqrt(circle.radius * circle.radius - dx * dx);
        return ( circle.y + dy >= box.low.y &&
                 circle.y - dy <= box.high.y
               );
      }
      if(circle.y >= box.low.y - circle.radius &&
         circle.y <  box.low.y) {
        dy = box.low.y - circle.y;
        dx = Math.sqrt(circle.radius * circle.radius - dy * dy);
        return ( circle.x + dx >= box.low.x &&
                 circle.x - dx <= box.high.x
               );
      }
      if(circle.y <= box.high.y + circle.radius &&
         circle.y >  box.high.y) {
        dy = box.high.y - circle.y;
        dx = Math.sqrt(circle.radius * circle.radius - dy * dy);
        return ( circle.x + dx >= box.low.x &&
                 circle.x - dx <= box.high.x
               );
      }
      return false;
    }
    function circleIntersectLine(line, circle) {
      const [ vect_prod, scal_prod, line_length ] =
            circleModel.positionToLine(line, circle);

      return ( Math.abs(vect_prod) < circle.radius &&
               scal_prod + circle.radius >= 0 &&
               scal_prod - circle.radius <= line_length
             );
    }
    function circlePointOnEdgeInDirection(direction, circle) {
      return {
        x: circle.x + Math.sin(Math.PI * direction / 180) * circle.radius,
        y: circle.y - Math.cos(Math.PI * direction / 180) * circle.radius
      };
    }
    function circlePointOnEdgeTangentTo(point, left, circle) {
      const distance = pointModel.distanceTo(circle, point);
      const direction = pointModel.directionTo(circle, point);
      const delta_direction = 180 * Math.acos(circle.radius / distance) / Math.PI;
      const tangent_direction = ( !left ?
                                direction + 180 - delta_direction :
                                direction - 180 + delta_direction
                              );

      return circleModel.pointOnEdgeInDirection(tangent_direction, circle);
    }
    function circleEnvelopeDirectionsTo(target, origin) {
      const direction = pointModel.directionTo(target, origin);
      const distance = pointModel.distanceTo(target, origin);
      const delta_radius = Math.abs(origin.radius - target.radius);
      const delta_direction = 180 * ( Math.asin(delta_radius/distance) *
                                    (origin.radius >= target.radius ? 1 : -1)
                                  ) / Math.PI;
      return {
        right: direction - delta_direction + 90,
        left: direction + delta_direction - 90
      };
    }
    function circleEnvelopeTo(target, origin) {
      const directions = circleModel.envelopeDirectionsTo(target, origin);
      const envelop = {
        left: {
          start: circleModel
            .pointOnEdgeInDirection(directions.left, origin),
          end: circleModel
            .pointOnEdgeInDirection(directions.left, target)
        },
        right: {
          start: circleModel
            .pointOnEdgeInDirection(directions.right, origin),
          end: circleModel
            .pointOnEdgeInDirection(directions.right, target)
        }
      };
      return envelop;
    }
    function circleOutsideEnvelopeTo(target,
                                     intervenings,
                                     origin) {
      const directions = circleModel.envelopeDirectionsTo(target, origin);
      const envelope = {
        left: findLeftEnvelopeLine(directions, target, intervenings, origin),
        right: findRightEnvelopeLine(directions, target, intervenings, origin)
      };
      envelope.left.vector = lineModel.vector(envelope.left);
      envelope.right.vector = lineModel.vector(envelope.right);

      const outside_envelope = {
        left: {
          start: { x: envelope.left.end.x, y: envelope.left.end.y }
        },
        right: {
          start: { x: envelope.right.end.x, y: envelope.right.end.y }
        }
      };
      let translate_left = 800;
      let translate_right = 800;
      const vector_product = pointModel
            .vectorProduct(envelope.left.vector, envelope.right.vector);
      if(vector_product > 0.001) {
        const envelope_end = {
          start: envelope.left.end,
          end: envelope.right.end
        };
        envelope_end.length = lineModel.length(envelope_end);
        envelope_end.vector = lineModel.vector(envelope_end);

        const alpha = Math.acos(pointModel.scalarProduct(envelope_end.vector,
                                                         envelope.left.vector));
        const beta = Math.acos(-pointModel.scalarProduct(envelope_end.vector,
                                                         envelope.right.vector));
        translate_left = envelope_end.length * Math.sin(alpha) / Math.sin(alpha+beta);
        translate_right = envelope_end.length * Math.sin(beta) / Math.sin(alpha+beta);
      }
      translate_left = Math.min(800, translate_left);
      translate_right = Math.min(800, translate_right);
      outside_envelope.left.end = pointModel
        .translateInVector(translate_left, envelope.left.vector,
                           outside_envelope.left.start);
      outside_envelope.right.end = pointModel
        .translateInVector(translate_right, envelope.right.vector,
                           outside_envelope.right.start);
      return outside_envelope;
    }
    function findLeftEnvelopeLine(directions, target, intervenings, origin) {
      const rad_inc = (directions.right - directions.left) / 180;
      const ray = {
        start: null,
        end: null
      };
      for(let ray_rad = directions.left ;
          ray_rad < directions.right ;
          ray_rad += rad_inc) {
        ray.start = circleModel.pointOnEdgeInDirection(ray_rad, origin);
        ray.end = circleModel.pointOnEdgeTangentTo(ray.start, true, target);
        ray.length = lineModel.length(ray);
        ray.vector = lineModel.vector(ray);

        const intervening = R.find((circle) => {
          return circleModel.intersectLine(ray, circle);
        }, intervenings);

        if(R.isNil(intervening)) return ray;
      }
      return ray;
    }
    function findRightEnvelopeLine(directions, target, intervenings, origin) {
      const rad_inc = (directions.right - directions.left) / 180;
      const ray = {
        start: null,
        end: null
      };
      for(let ray_rad = directions.right ;
          ray_rad > directions.left ;
          ray_rad -= rad_inc) {
        ray.start = circleModel.pointOnEdgeInDirection(ray_rad, origin);
        ray.end = circleModel.pointOnEdgeTangentTo(ray.start, false, target);
        ray.length = lineModel.length(ray);
        ray.vector = lineModel.vector(ray);

        const intervening = R.find((circle) => {
          return circleModel.intersectLine(ray, circle);
        }, intervenings);

        if(R.isNil(intervening)) return ray;
      }
      return ray;
    }
  }
})();
