'use strict';

self.pointServiceFactory = function pointServiceFactory() {
  var pointService = {
    moveFront: function pointMoveFront(dist, point) {
      var rad = point.r * Math.PI / 180;
      return R.pipe(
        R.assoc('x', point.x + dist * Math.sin(rad)),
        R.assoc('y', point.y - dist * Math.cos(rad))
      )(point);
    },
    moveBack: function pointMoveBack(dist, point) {
      var rad = point.r * Math.PI / 180;
      return R.pipe(
        R.assoc('x', point.x - dist * Math.sin(rad)),
        R.assoc('y', point.y + dist * Math.cos(rad))
      )(point);
    },
    rotateLeft: function pointRotateLeft(angle, point) {
      return R.assoc('r', point.r - angle, point);
    },
    rotateRight: function pointRotateRight(angle, point) {
      return R.assoc('r', point.r + angle, point);
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
      return Math.sqrt( Math.pow(other.x - point.x, 2) +
                        Math.pow(other.y - point.y, 2)
                      );
    },
  };
  R.curryService(pointService);
  return pointService;
};
