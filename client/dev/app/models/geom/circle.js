'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

(function () {
  angular.module('clickApp.services').factory('circle', circleModelFactory);

  circleModelFactory.$inject = ['point', 'line'];
  function circleModelFactory(pointModel, lineModel) {
    var circleModel = {
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

    function circlePositionToLine(line, circle) {
      var delta = pointModel.differenceFrom(line.start, circle);
      var line_length = lineModel.length(line);
      var line_vector = lineModel.vector(line);
      var vect_prod = pointModel.vectorProduct(line_vector, delta);
      var scal_prod = pointModel.scalarProduct(line_vector, delta);

      return [vect_prod, scal_prod, line_length];
    }
    function circleIsLeftOfLine(line, circle) {
      var _circleModel$position = circleModel.positionToLine(line, circle);

      var _circleModel$position2 = _slicedToArray(_circleModel$position, 3);

      var vect_prod = _circleModel$position2[0];
      var scal_prod = _circleModel$position2[1];
      var line_length = _circleModel$position2[2];

      return vect_prod + circle.radius >= 0 && scal_prod + circle.radius >= 0 && scal_prod - circle.radius <= line_length;
    }
    function circleIsRightOfLine(line, circle) {
      var _circleModel$position3 = circleModel.positionToLine(line, circle);

      var _circleModel$position4 = _slicedToArray(_circleModel$position3, 3);

      var vect_prod = _circleModel$position4[0];
      var scal_prod = _circleModel$position4[1];
      var line_length = _circleModel$position4[2];

      return vect_prod - circle.radius <= 0 && scal_prod + circle.radius >= 0 && scal_prod - circle.radius <= line_length;
    }
    function circleIsInEnvelope(envelope, circle) {
      return circleModel.isRightOfLine(envelope.left, circle) && circleModel.isLeftOfLine(envelope.right, circle);
    }
    function circleIsInBox(box, circle) {
      var dx = undefined;
      var dy = undefined;
      if (circle.x >= box.low.x && circle.x <= box.high.x && circle.y >= box.low.y && circle.y <= box.high.y) return true;
      if (circle.x >= box.low.x - circle.radius && circle.x < box.low.x) {
        dx = box.low.x - circle.x;
        dy = Math.sqrt(circle.radius * circle.radius - dx * dx);
        return circle.y + dy >= box.low.y && circle.y - dy <= box.high.y;
      }
      if (circle.x <= box.high.x + circle.radius && circle.x > box.high.x) {
        dx = box.high.x - circle.x;
        dy = Math.sqrt(circle.radius * circle.radius - dx * dx);
        return circle.y + dy >= box.low.y && circle.y - dy <= box.high.y;
      }
      if (circle.y >= box.low.y - circle.radius && circle.y < box.low.y) {
        dy = box.low.y - circle.y;
        dx = Math.sqrt(circle.radius * circle.radius - dy * dy);
        return circle.x + dx >= box.low.x && circle.x - dx <= box.high.x;
      }
      if (circle.y <= box.high.y + circle.radius && circle.y > box.high.y) {
        dy = box.high.y - circle.y;
        dx = Math.sqrt(circle.radius * circle.radius - dy * dy);
        return circle.x + dx >= box.low.x && circle.x - dx <= box.high.x;
      }
      return false;
    }
    function circleIntersectLine(line, circle) {
      var _circleModel$position5 = circleModel.positionToLine(line, circle);

      var _circleModel$position6 = _slicedToArray(_circleModel$position5, 3);

      var vect_prod = _circleModel$position6[0];
      var scal_prod = _circleModel$position6[1];
      var line_length = _circleModel$position6[2];

      return Math.abs(vect_prod) < circle.radius && scal_prod + circle.radius >= 0 && scal_prod - circle.radius <= line_length;
    }
    function circlePointOnEdgeInDirection(direction, circle) {
      return {
        x: circle.x + Math.sin(Math.PI * direction / 180) * circle.radius,
        y: circle.y - Math.cos(Math.PI * direction / 180) * circle.radius
      };
    }
    function circlePointOnEdgeTangentTo(point, left, circle) {
      var distance = pointModel.distanceTo(circle, point);
      var direction = pointModel.directionTo(circle, point);
      var delta_direction = 180 * Math.acos(circle.radius / distance) / Math.PI;
      var tangent_direction = !left ? direction + 180 - delta_direction : direction - 180 + delta_direction;

      return circleModel.pointOnEdgeInDirection(tangent_direction, circle);
    }
    function circleEnvelopeDirectionsTo(target, origin) {
      var direction = pointModel.directionTo(target, origin);
      var distance = pointModel.distanceTo(target, origin);
      var delta_radius = Math.abs(origin.radius - target.radius);
      var delta_direction = 180 * (Math.asin(delta_radius / distance) * (origin.radius >= target.radius ? 1 : -1)) / Math.PI;
      return {
        right: direction - delta_direction + 90,
        left: direction + delta_direction - 90
      };
    }
    function circleEnvelopeTo(target, origin) {
      var directions = circleModel.envelopeDirectionsTo(target, origin);
      var envelop = {
        left: {
          start: circleModel.pointOnEdgeInDirection(directions.left, origin),
          end: circleModel.pointOnEdgeInDirection(directions.left, target)
        },
        right: {
          start: circleModel.pointOnEdgeInDirection(directions.right, origin),
          end: circleModel.pointOnEdgeInDirection(directions.right, target)
        }
      };
      return envelop;
    }
    function circleOutsideEnvelopeTo(target, intervenings, origin) {
      var directions = circleModel.envelopeDirectionsTo(target, origin);
      var envelope = {
        left: findLeftEnvelopeLine(directions, target, intervenings, origin),
        right: findRightEnvelopeLine(directions, target, intervenings, origin)
      };
      envelope.left.vector = lineModel.vector(envelope.left);
      envelope.right.vector = lineModel.vector(envelope.right);

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
      var vector_product = pointModel.vectorProduct(envelope.left.vector, envelope.right.vector);
      if (vector_product > 0.001) {
        var envelope_end = {
          start: envelope.left.end,
          end: envelope.right.end
        };
        envelope_end.length = lineModel.length(envelope_end);
        envelope_end.vector = lineModel.vector(envelope_end);

        var alpha = Math.acos(pointModel.scalarProduct(envelope_end.vector, envelope.left.vector));
        var beta = Math.acos(-pointModel.scalarProduct(envelope_end.vector, envelope.right.vector));
        translate_left = envelope_end.length * Math.sin(alpha) / Math.sin(alpha + beta);
        translate_right = envelope_end.length * Math.sin(beta) / Math.sin(alpha + beta);
      }
      translate_left = Math.min(800, translate_left);
      translate_right = Math.min(800, translate_right);
      outside_envelope.left.end = pointModel.translateInVector(translate_left, envelope.left.vector, outside_envelope.left.start);
      outside_envelope.right.end = pointModel.translateInVector(translate_right, envelope.right.vector, outside_envelope.right.start);
      return outside_envelope;
    }
    function findLeftEnvelopeLine(directions, target, intervenings, origin) {
      var rad_inc = (directions.right - directions.left) / 180;
      var ray = {
        start: null,
        end: null
      };
      for (var ray_rad = directions.left; ray_rad < directions.right; ray_rad += rad_inc) {
        ray.start = circleModel.pointOnEdgeInDirection(ray_rad, origin);
        ray.end = circleModel.pointOnEdgeTangentTo(ray.start, true, target);
        ray.length = lineModel.length(ray);
        ray.vector = lineModel.vector(ray);

        var intervening = R.find(function (circle) {
          return circleModel.intersectLine(ray, circle);
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
        ray.start = circleModel.pointOnEdgeInDirection(ray_rad, origin);
        ray.end = circleModel.pointOnEdgeTangentTo(ray.start, false, target);
        ray.length = lineModel.length(ray);
        ray.vector = lineModel.vector(ray);

        var intervening = R.find(function (circle) {
          return circleModel.intersectLine(ray, circle);
        }, intervenings);

        if (R.isNil(intervening)) return ray;
      }
      return ray;
    }
  }
})();
//# sourceMappingURL=circle.js.map