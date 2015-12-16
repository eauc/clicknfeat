'use strict';

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

angular.module('clickApp.services').factory('point', [function pointServiceFactory() {
  var pointService = {
    moveFront: function pointMoveFront(dist, point) {
      var rad = point.r * Math.PI / 180;
      return R.pipe(R.assoc('x', point.x + dist * Math.sin(rad)), R.assoc('y', point.y - dist * Math.cos(rad)))(point);
    },
    moveBack: function pointMoveBack(dist, point) {
      var rad = point.r * Math.PI / 180;
      return R.pipe(R.assoc('x', point.x - dist * Math.sin(rad)), R.assoc('y', point.y + dist * Math.cos(rad)))(point);
    },
    rotateLeft: function pointRotateLeft(angle, point) {
      return R.assoc('r', point.r - angle, point);
    },
    rotateLeftAround: function pointRotateLeftAround(angle, center, point) {
      var direction = pointService.directionTo(point, center);
      var distance = pointService.distanceTo(point, center);
      var new_direction = direction - angle;
      return R.pipe(R.assoc('x', center.x + distance * Math.sin(new_direction * Math.PI / 180)), R.assoc('y', center.y - distance * Math.cos(new_direction * Math.PI / 180)))(point);
    },
    rotateRight: function pointRotateRight(angle, point) {
      return R.assoc('r', point.r + angle, point);
    },
    rotateRightAround: function pointRotateLeftAround(angle, center, point) {
      var direction = pointService.directionTo(point, center);
      var distance = pointService.distanceTo(point, center);
      var new_direction = direction + angle;
      return R.pipe(R.assoc('x', center.x + distance * Math.sin(new_direction * Math.PI / 180)), R.assoc('y', center.y - distance * Math.cos(new_direction * Math.PI / 180)))(point);
    },
    rotateAroundTo: function pointRotateAroundTo(direction, center, point) {
      var distance = pointService.distanceTo(point, center);
      return R.pipe(R.assoc('x', center.x + distance * Math.sin(direction * Math.PI / 180)), R.assoc('y', center.y - distance * Math.cos(direction * Math.PI / 180)))(point);
    },
    shiftLeft: function pointShiftLeft(dist, point) {
      return R.assoc('x', point.x - dist, point);
    },
    shiftRight: function pointShiftRight(dist, point) {
      return R.assoc('x', point.x + dist, point);
    },
    shiftUp: function pointShiftUp(dist, point) {
      return R.assoc('y', point.y - dist, point);
    },
    shiftDown: function pointShiftDown(dist, point) {
      return R.assoc('y', point.y + dist, point);
    },
    distanceTo: function pointDistanceTo(other, point) {
      return Math.sqrt(Math.pow(other.x - point.x, 2) + Math.pow(other.y - point.y, 2));
    },
    directionTo: function pointDirectionTo(other, point) {
      return 180 * Math.atan2(other.x - point.x, point.y - other.y) / Math.PI;
    },
    translateInDirection: function pointTranslateInDirection(distance, direction, point) {
      direction = direction * Math.PI / 180;
      return R.pipe(R.assoc('x', point.x + distance * Math.sin(direction)), R.assoc('y', point.y - distance * Math.cos(direction)))(point);
    },
    translateInVector: function pointTranslateInVector(distance, vector, point) {
      return R.pipe(R.assoc('x', point.x + distance * vector.x), R.assoc('y', point.y + distance * vector.y))(point);
    },
    addToWithFlip: function pointAddToWithFlip(flip, other, point) {
      var coeff = flip ? -1 : 1;
      var phase = flip ? 180 : 0;
      return R.pipe(R.assoc('x', other.x + coeff * point.x), R.assoc('y', other.y + coeff * point.y), R.assoc('r', other.r + point.r + phase))(point);
    },
    differenceFrom: function pointDifferenceFrom(other, point) {
      return R.pipe(R.assoc('x', point.x - other.x), R.assoc('y', point.y - other.y), R.assoc('r', point.r - other.r))(point);
    },
    vectorProduct: function pointVectorProduct(other, point) {
      return other.y * point.x - other.x * point.y;
    },
    scalarProduct: function pointScalarProduct(other, point) {
      return other.x * point.x + other.y * point.y;
    }
  };
  R.curryService(pointService);
  return pointService;
}]).factory('line', ['point', function lineServiceFactory(pointService) {
  var lineService = {
    length: function lineLength(line) {
      return pointService.distanceTo(line.end, line.start);
    },
    vector: function lineVector(line) {
      var length = lineService.length(line);
      return {
        x: (line.end.x - line.start.x) / length,
        y: (line.end.y - line.start.y) / length
      };
    }
  };
  R.curryService(lineService);
  return lineService;
}]).factory('circle', ['point', 'line', function circleServiceFactory(pointService, lineService) {
  var circleService = {
    positionToLine: function circlePositionToLine(line, circle) {
      var delta = pointService.differenceFrom(line.start, circle);
      var line_length = lineService.length(line);
      var line_vector = lineService.vector(line);
      var vect_prod = pointService.vectorProduct(line_vector, delta);
      var scal_prod = pointService.scalarProduct(line_vector, delta);

      return [vect_prod, scal_prod, line_length];
    },
    isLeftOfLine: function circleIsLeftOfLine(line, circle) {
      var _circleService$positi = circleService.positionToLine(line, circle);

      var _circleService$positi2 = _slicedToArray(_circleService$positi, 3);

      var vect_prod = _circleService$positi2[0];
      var scal_prod = _circleService$positi2[1];
      var line_length = _circleService$positi2[2];

      return vect_prod + circle.radius >= 0 && scal_prod + circle.radius >= 0 && scal_prod - circle.radius <= line_length;
    },
    isRightOfLine: function circleIsRightOfLine(line, circle) {
      var _circleService$positi3 = circleService.positionToLine(line, circle);

      var _circleService$positi4 = _slicedToArray(_circleService$positi3, 3);

      var vect_prod = _circleService$positi4[0];
      var scal_prod = _circleService$positi4[1];
      var line_length = _circleService$positi4[2];

      return vect_prod - circle.radius <= 0 && scal_prod + circle.radius >= 0 && scal_prod - circle.radius <= line_length;
    },
    isInEnvelope: function circleIsInEnvelope(envelope, circle) {
      return circleService.isRightOfLine(envelope.left, circle) && circleService.isLeftOfLine(envelope.right, circle);
    },
    intersectLine: function circleIntersectLine(line, circle) {
      var _circleService$positi5 = circleService.positionToLine(line, circle);

      var _circleService$positi6 = _slicedToArray(_circleService$positi5, 3);

      var vect_prod = _circleService$positi6[0];
      var scal_prod = _circleService$positi6[1];
      var line_length = _circleService$positi6[2];

      return Math.abs(vect_prod) < circle.radius && scal_prod + circle.radius >= 0 && scal_prod - circle.radius <= line_length;
    },
    pointOnEdgeInDirection: function circlePointOnEdgeInDirection(direction, circle) {
      return {
        x: circle.x + Math.sin(Math.PI * direction / 180) * circle.radius,
        y: circle.y - Math.cos(Math.PI * direction / 180) * circle.radius
      };
    },
    pointOnEdgeTangentTo: function circlePointOnEdgeTangentTo(point, left, circle) {
      var distance = pointService.distanceTo(circle, point);
      var direction = pointService.directionTo(circle, point);
      var delta_direction = 180 * Math.acos(circle.radius / distance) / Math.PI;
      var tangent_direction = !left ? direction + 180 - delta_direction : direction - 180 + delta_direction;

      return circleService.pointOnEdgeInDirection(tangent_direction, circle);
    },
    envelopeDirectionsTo: function circleEnvelopeDirectionsTo(target, origin) {
      var direction = pointService.directionTo(target, origin);
      var distance = pointService.distanceTo(target, origin);
      var delta_radius = Math.abs(origin.radius - target.radius);
      var delta_direction = 180 * (Math.asin(delta_radius / distance) * (origin.radius >= target.radius ? 1 : -1)) / Math.PI;
      return {
        right: direction - delta_direction + 90,
        left: direction + delta_direction - 90
      };
    },
    envelopeTo: function circleEnvelopeTo(target, origin) {
      var directions = circleService.envelopeDirectionsTo(target, origin);
      var envelop = {
        left: {
          start: circleService.pointOnEdgeInDirection(directions.left, origin),
          end: circleService.pointOnEdgeInDirection(directions.left, target)
        },
        right: {
          start: circleService.pointOnEdgeInDirection(directions.right, origin),
          end: circleService.pointOnEdgeInDirection(directions.right, target)
        }
      };
      return envelop;
    },
    outsideEnvelopeTo: function circleOutsideEnvelopeTo(target, intervenings, origin) {
      var directions = circleService.envelopeDirectionsTo(target, origin);
      var envelope = {
        left: findLeftEnvelopeLine(directions, target, intervenings, origin),
        right: findRightEnvelopeLine(directions, target, intervenings, origin)
      };
      envelope.left.vector = lineService.vector(envelope.left);
      envelope.right.vector = lineService.vector(envelope.right);

      var outside_envelope = {
        left: {
          start: { x: envelope.left.end.x, y: envelope.left.end.y }
        },
        right: {
          start: { x: envelope.right.end.x, y: envelope.right.end.y }
        }
      };
      var translate_left = 800;
      var translate_right = 800;
      var vector_product = pointService.vectorProduct(envelope.left.vector, envelope.right.vector);
      if (vector_product > 0.001) {
        var envelope_end = {
          start: envelope.left.end,
          end: envelope.right.end
        };
        envelope_end.length = lineService.length(envelope_end);
        envelope_end.vector = lineService.vector(envelope_end);

        var alpha = Math.acos(pointService.scalarProduct(envelope_end.vector, envelope.left.vector));
        var beta = Math.acos(-pointService.scalarProduct(envelope_end.vector, envelope.right.vector));
        translate_left = envelope_end.length * Math.sin(alpha) / Math.sin(alpha + beta);
        translate_right = envelope_end.length * Math.sin(beta) / Math.sin(alpha + beta);
      }
      translate_left = Math.min(800, translate_left);
      translate_right = Math.min(800, translate_right);
      outside_envelope.left.end = pointService.translateInVector(translate_left, envelope.left.vector, outside_envelope.left.start);
      outside_envelope.right.end = pointService.translateInVector(translate_right, envelope.right.vector, outside_envelope.right.start);
      return outside_envelope;
    }
  };
  function findLeftEnvelopeLine(directions, target, intervenings, origin) {
    var rad_inc = (directions.right - directions.left) / 180;
    var ray = {
      start: null,
      end: null
    };
    for (var ray_rad = directions.left; ray_rad < directions.right; ray_rad += rad_inc) {
      ray.start = circleService.pointOnEdgeInDirection(ray_rad, origin);
      ray.end = circleService.pointOnEdgeTangentTo(ray.start, true, target);
      ray.length = lineService.length(ray);
      ray.vector = lineService.vector(ray);

      var intervening = R.find(function (circle) {
        return circleService.intersectLine(ray, circle);
      }, intervenings);

      if (R.isNil(intervening)) return ray;
    }
    return ray;
  }
  function findRightEnvelopeLine(directions, target, intervenings, origin) {
    var rad_inc = (directions.right - directions.left) / 180;
    var ray = {
      start: null,
      end: null
    };
    for (var ray_rad = directions.right; ray_rad > directions.left; ray_rad -= rad_inc) {
      ray.start = circleService.pointOnEdgeInDirection(ray_rad, origin);
      ray.end = circleService.pointOnEdgeTangentTo(ray.start, false, target);
      ray.length = lineService.length(ray);
      ray.vector = lineService.vector(ray);

      var intervening = R.find(function (circle) {
        return circleService.intersectLine(ray, circle);
      }, intervenings);

      if (R.isNil(intervening)) return ray;
    }
    return ray;
  }
  R.curryService(circleService);
  return circleService;
}]);
//# sourceMappingURL=geom.js.map
