'use strict';

(function () {
  angular.module('clickApp.services').factory('point', pointModelFactory);
  // .factory('line', lineModelFactory)
  // .factory('circle', circleModelFactory);

  pointModelFactory.$inject = [];
  function pointModelFactory() {
    var pointModel = {
      moveFront: pointMoveFront,
      moveBack: pointMoveBack,
      rotateLeft: pointRotateLeft,
      rotateLeftAround: pointRotateLeftAround,
      rotateRight: pointRotateRight,
      rotateRightAround: pointRotateRightAround,
      rotateAroundTo: pointRotateAroundTo,
      shiftLeft: pointShiftLeft,
      shiftRight: pointShiftRight,
      shiftUp: pointShiftUp,
      shiftDown: pointShiftDown,
      distanceTo: pointDistanceTo,
      directionTo: pointDirectionTo,
      translateInDirection: pointTranslateInDirection,
      translateInVector: pointTranslateInVector,
      addToWithFlip: pointAddToWithFlip,
      differenceFrom: pointDifferenceFrom,
      vectorProduct: pointVectorProduct,
      scalarProduct: pointScalarProduct
    };

    R.curryService(pointModel);
    return pointModel;

    function pointMoveFront(dist, point) {
      var rad = point.r * Math.PI / 180;
      return R.pipe(R.assoc('x', point.x + dist * Math.sin(rad)), R.assoc('y', point.y - dist * Math.cos(rad)))(point);
    }
    function pointMoveBack(dist, point) {
      var rad = point.r * Math.PI / 180;
      return R.pipe(R.assoc('x', point.x - dist * Math.sin(rad)), R.assoc('y', point.y + dist * Math.cos(rad)))(point);
    }
    function pointRotateLeft(angle, point) {
      return R.assoc('r', point.r - angle, point);
    }
    function pointRotateLeftAround(angle, center, point) {
      var direction = pointModel.directionTo(point, center);
      var distance = pointModel.distanceTo(point, center);
      var new_direction = direction - angle;
      return R.pipe(R.assoc('x', center.x + distance * Math.sin(new_direction * Math.PI / 180)), R.assoc('y', center.y - distance * Math.cos(new_direction * Math.PI / 180)))(point);
    }
    function pointRotateRight(angle, point) {
      return R.assoc('r', point.r + angle, point);
    }
    function pointRotateRightAround(angle, center, point) {
      var direction = pointModel.directionTo(point, center);
      var distance = pointModel.distanceTo(point, center);
      var new_direction = direction + angle;
      return R.pipe(R.assoc('x', center.x + distance * Math.sin(new_direction * Math.PI / 180)), R.assoc('y', center.y - distance * Math.cos(new_direction * Math.PI / 180)))(point);
    }
    function pointRotateAroundTo(direction, center, point) {
      var distance = pointModel.distanceTo(point, center);
      return R.pipe(R.assoc('x', center.x + distance * Math.sin(direction * Math.PI / 180)), R.assoc('y', center.y - distance * Math.cos(direction * Math.PI / 180)))(point);
    }
    function pointShiftLeft(dist, point) {
      return R.assoc('x', point.x - dist, point);
    }
    function pointShiftRight(dist, point) {
      return R.assoc('x', point.x + dist, point);
    }
    function pointShiftUp(dist, point) {
      return R.assoc('y', point.y - dist, point);
    }
    function pointShiftDown(dist, point) {
      return R.assoc('y', point.y + dist, point);
    }
    function pointDistanceTo(other, point) {
      return Math.sqrt(Math.pow(other.x - point.x, 2) + Math.pow(other.y - point.y, 2));
    }
    function pointDirectionTo(other, point) {
      return 180 * Math.atan2(other.x - point.x, point.y - other.y) / Math.PI;
    }
    function pointTranslateInDirection(distance, direction, point) {
      direction = direction * Math.PI / 180;
      return R.pipe(R.assoc('x', point.x + distance * Math.sin(direction)), R.assoc('y', point.y - distance * Math.cos(direction)))(point);
    }
    function pointTranslateInVector(distance, vector, point) {
      return R.pipe(R.assoc('x', point.x + distance * vector.x), R.assoc('y', point.y + distance * vector.y))(point);
    }
    function pointAddToWithFlip(flip, other, point) {
      var coeff = flip ? -1 : 1;
      var phase = flip ? 180 : 0;
      return R.pipe(R.assoc('x', other.x + coeff * point.x), R.assoc('y', other.y + coeff * point.y), R.assoc('r', other.r + point.r + phase))(point);
    }
    function pointDifferenceFrom(other, point) {
      return R.pipe(R.assoc('x', point.x - other.x), R.assoc('y', point.y - other.y), R.assoc('r', point.r - other.r))(point);
    }
    function pointVectorProduct(other, point) {
      return other.y * point.x - other.x * point.y;
    }
    function pointScalarProduct(other, point) {
      return other.x * point.x + other.y * point.y;
    }
  }

  // lineModelFactory.$inject = [
  //   'point'
  // ];
  // function lineModelFactory(pointModel) {
  //   const lineModel = {
  //     length: lineLength,
  //     vector: lineVector
  //   };
  //   R.curryService(lineModel);
  //   return lineModel;

  //   function lineLength(line) {
  //     return pointModel.distanceTo(line.end, line.start);
  //   }
  //   function lineVector(line) {
  //     const length = lineModel.length(line);
  //     return {
  //       x: (line.end.x - line.start.x) / length,
  //       y: (line.end.y - line.start.y) / length
  //     };
  //   }
  // }

  // circleModelFactory.$inject = [
  //   'point',
  //   'line',
  // ];
  // function circleModelFactory(pointModel,
  //                             lineModel) {
  //   const circleModel = {
  //     positionToLine: circlePositionToLine,
  //     isLeftOfLine: circleIsLeftOfLine,
  //     isRightOfLine: circleIsRightOfLine,
  //     isInEnvelope: circleIsInEnvelope,
  //     isInBox: circleIsInBox,
  //     intersectLine: circleIntersectLine,
  //     pointOnEdgeInDirection: circlePointOnEdgeInDirection,
  //     pointOnEdgeTangentTo: circlePointOnEdgeTangentTo,
  //     envelopeDirectionsTo: circleEnvelopeDirectionsTo,
  //     envelopeTo: circleEnvelopeTo,
  //     outsideEnvelopeTo: circleOutsideEnvelopeTo
  //   };

  //   R.curryService(circleModel);
  //   return circleModel;

  //   function circlePositionToLine (line, circle) {
  //     const delta = pointModel.differenceFrom(line.start, circle);
  //     const line_length = lineModel.length(line);
  //     const line_vector = lineModel.vector(line);
  //     const vect_prod = pointModel.vectorProduct(line_vector, delta);
  //     const scal_prod = pointModel.scalarProduct(line_vector, delta);

  //     return [vect_prod, scal_prod, line_length];
  //   }
  //   function circleIsLeftOfLine(line, circle) {
  //     const [ vect_prod, scal_prod, line_length ] =
  //           circleModel.positionToLine(line, circle);

  //     return ( vect_prod + circle.radius >= 0 &&
  //              scal_prod + circle.radius >= 0 &&
  //              scal_prod - circle.radius <= line_length
  //            );
  //   }
  //   function circleIsRightOfLine(line, circle) {
  //     const [ vect_prod, scal_prod, line_length ] =
  //           circleModel.positionToLine(line, circle);

  //     return ( vect_prod - circle.radius <= 0 &&
  //              scal_prod + circle.radius >= 0 &&
  //              scal_prod - circle.radius <= line_length
  //            );
  //   }
  //   function circleIsInEnvelope(envelope, circle) {
  //     return ( circleModel.isRightOfLine(envelope.left, circle) &&
  //              circleModel.isLeftOfLine(envelope.right, circle)
  //            );
  //   }
  //   function circleIsInBox(box, circle) {
  //     const dx;
  //     const dy;
  //     if(circle.x >= box.low.x &&
  //        circle.x <= box.high.x &&
  //        circle.y >= box.low.y &&
  //        circle.y <= box.high.x) return true;
  //     if(circle.x >= box.low.x - circle.radius &&
  //        circle.x <  box.low.x) {
  //       dx = box.low.x - circle.x;
  //       dy = Math.sqrt(circle.radius * circle.radius - dx * dx);
  //       return ( circle.y + dy >= box.low.y &&
  //                circle.y - dy <= box.high.y
  //              );
  //     }
  //     if(circle.x <= box.high.x + circle.radius &&
  //        circle.x >  box.high.x) {
  //       dx = box.high.x - circle.x;
  //       dy = Math.sqrt(circle.radius * circle.radius - dx * dx);
  //       return ( circle.y + dy >= box.low.y &&
  //                circle.y - dy <= box.high.y
  //              );
  //     }
  //     if(circle.y >= box.low.y - circle.radius &&
  //        circle.y <  box.low.y) {
  //       dy = box.low.y - circle.y;
  //       dx = Math.sqrt(circle.radius * circle.radius - dy * dy);
  //       return ( circle.x + dx >= box.low.x &&
  //                circle.x - dx <= box.high.x
  //              );
  //     }
  //     if(circle.y <= box.high.y + circle.radius &&
  //        circle.y >  box.high.y) {
  //       dy = box.high.y - circle.y;
  //       dx = Math.sqrt(circle.radius * circle.radius - dy * dy);
  //       return ( circle.x + dx >= box.low.x &&
  //                circle.x - dx <= box.high.x
  //              );
  //     }
  //     return false;
  //   }
  //   function circleIntersectLine(line, circle) {
  //     const [ vect_prod, scal_prod, line_length ] =
  //           circleModel.positionToLine(line, circle);

  //     return ( Math.abs(vect_prod) < circle.radius &&
  //              scal_prod + circle.radius >= 0 &&
  //              scal_prod - circle.radius <= line_length
  //            );
  //   }
  //   function circlePointOnEdgeInDirection(direction, circle) {
  //     return {
  //       x: circle.x + Math.sin(Math.PI * direction / 180) * circle.radius,
  //       y: circle.y - Math.cos(Math.PI * direction / 180) * circle.radius
  //     };
  //   }
  //   function circlePointOnEdgeTangentTo(point, left, circle) {
  //     const distance = pointModel.distanceTo(circle, point);
  //     const direction = pointModel.directionTo(circle, point);
  //     const delta_direction = 180 * Math.acos(circle.radius / distance) / Math.PI;
  //     const tangent_direction = ( !left ?
  //                               direction + 180 - delta_direction :
  //                               direction - 180 + delta_direction
  //                             );

  //     return circleModel.pointOnEdgeInDirection(tangent_direction, circle);
  //   }
  //   function circleEnvelopeDirectionsTo(target, origin) {
  //     const direction = pointModel.directionTo(target, origin);
  //     const distance = pointModel.distanceTo(target, origin);
  //     const delta_radius = Math.abs(origin.radius - target.radius);
  //     const delta_direction = 180 * ( Math.asin(delta_radius/distance) *
  //                                   (origin.radius >= target.radius ? 1 : -1)
  //                                 ) / Math.PI;
  //     return {
  //       right: direction - delta_direction + 90,
  //       left: direction + delta_direction - 90
  //     };
  //   }
  //   function circleEnvelopeTo(target, origin) {
  //     const directions = circleModel.envelopeDirectionsTo(target, origin);
  //     const envelop = {
  //       left: {
  //         start: circleModel
  //           .pointOnEdgeInDirection(directions.left, origin),
  //         end: circleModel
  //           .pointOnEdgeInDirection(directions.left, target)
  //       },
  //       right: {
  //         start: circleModel
  //           .pointOnEdgeInDirection(directions.right, origin),
  //         end: circleModel
  //           .pointOnEdgeInDirection(directions.right, target)
  //       }
  //     };
  //     return envelop;
  //   }
  //   function circleOutsideEnvelopeTo(target,
  //                                    intervenings,
  //                                    origin) {
  //     const directions = circleModel.envelopeDirectionsTo(target, origin);
  //     const envelope = {
  //       left: findLeftEnvelopeLine(directions, target, intervenings, origin),
  //       right: findRightEnvelopeLine(directions, target, intervenings, origin)
  //     };
  //     envelope.left.vector = lineModel.vector(envelope.left);
  //     envelope.right.vector = lineModel.vector(envelope.right);

  //     const outside_envelope = {
  //       left: {
  //         start: { x: envelope.left.end.x, y: envelope.left.end.y }
  //       },
  //       right: {
  //         start: { x: envelope.right.end.x, y: envelope.right.end.y }
  //       }
  //     };
  //     const translate_left = 800;
  //     const translate_right = 800;
  //     const vector_product = pointModel
  //           .vectorProduct(envelope.left.vector, envelope.right.vector);
  //     if(vector_product > 0.001) {
  //       const envelope_end = {
  //         start: envelope.left.end,
  //         end: envelope.right.end
  //       };
  //       envelope_end.length = lineModel.length(envelope_end);
  //       envelope_end.vector = lineModel.vector(envelope_end);

  //       const alpha = Math.acos(pointModel.scalarProduct(envelope_end.vector,
  //                                                        envelope.left.vector));
  //       const beta = Math.acos(-pointModel.scalarProduct(envelope_end.vector,
  //                                                        envelope.right.vector));
  //       translate_left = envelope_end.length * Math.sin(alpha) / Math.sin(alpha+beta);
  //       translate_right = envelope_end.length * Math.sin(beta) / Math.sin(alpha+beta);
  //     }
  //     translate_left = Math.min(800, translate_left);
  //     translate_right = Math.min(800, translate_right);
  //     outside_envelope.left.end = pointModel
  //       .translateInVector(translate_left, envelope.left.vector,
  //                          outside_envelope.left.start);
  //     outside_envelope.right.end = pointModel
  //       .translateInVector(translate_right, envelope.right.vector,
  //                          outside_envelope.right.start);
  //     return outside_envelope;
  //   }
  //   function findLeftEnvelopeLine(directions, target, intervenings, origin) {
  //     const rad_inc = (directions.right - directions.left) / 180;
  //     const ray = {
  //       start: null,
  //       end: null
  //     };
  //     for(let ray_rad = directions.left ;
  //         ray_rad < directions.right ;
  //         ray_rad += rad_inc) {
  //       ray.start = circleModel.pointOnEdgeInDirection(ray_rad, origin);
  //       ray.end = circleModel.pointOnEdgeTangentTo(ray.start, true, target);
  //       ray.length = lineModel.length(ray);
  //       ray.vector = lineModel.vector(ray);

  //       const intervening = R.find((circle) => {
  //         return circleModel.intersectLine(ray, circle);
  //       }, intervenings);

  //       if(R.isNil(intervening)) return ray;
  //     }
  //     return ray;
  //   }
  //   function findRightEnvelopeLine(directions, target, intervenings, origin) {
  //     const rad_inc = (directions.right - directions.left) / 180;
  //     const ray = {
  //       start: null,
  //       end: null
  //     };
  //     for(let ray_rad = directions.right ;
  //         ray_rad > directions.left ;
  //         ray_rad -= rad_inc) {
  //       ray.start = circleModel.pointOnEdgeInDirection(ray_rad, origin);
  //       ray.end = circleModel.pointOnEdgeTangentTo(ray.start, false, target);
  //       ray.length = lineModel.length(ray);
  //       ray.vector = lineModel.vector(ray);

  //       const intervening = R.find((circle) => {
  //         return circleModel.intersectLine(ray, circle);
  //       }, intervenings);

  //       if(R.isNil(intervening)) return ray;
  //     }
  //     return ray;
  //   }
  // }
})();
//# sourceMappingURL=geom.js.map
