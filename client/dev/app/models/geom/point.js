'use strict';

(function () {
  angular.module('clickApp.services').factory('point', pointModelFactory);

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
})();
//# sourceMappingURL=point.js.map
