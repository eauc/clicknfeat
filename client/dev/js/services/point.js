'use strict';

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
    addToWithFlip: function pointAddToWithFlip(flip, other, point) {
      var coeff = flip ? -1 : 1;
      var phase = flip ? 180 : 0;
      return R.pipe(R.assoc('x', other.x + coeff * point.x), R.assoc('y', other.y + coeff * point.y), R.assoc('r', other.r + point.r + phase))(point);
    },
    differenceFrom: function pointDifferenceFrom(other, point) {
      return R.pipe(R.assoc('x', point.x - other.x), R.assoc('y', point.y - other.y), R.assoc('r', point.r - other.r))(point);
    }
  };
  R.curryService(pointService);
  return pointService;
}]);
//# sourceMappingURL=point.js.map