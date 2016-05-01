'use strict';

(function () {
  angular.module('clickApp.services').factory('gameSegment', gameSegmentModelFactory);

  gameSegmentModelFactory.$inject = [];
  function gameSegmentModelFactory() {
    var REMOTE_DISPLAY_LENS = R.lensPath(['remote', 'display']);
    return function buildGameSegmentModel() {
      var gameSegmentModel = {
        create: gameSegmentCreate,
        isDisplayed: gameSegmentIsDisplayed,
        toggleDisplay: gameSegmentToggleDisplay,
        setLocal: gameSegmentSetLocal,
        setRemote: gameSegmentSetRemote,
        saveRemoteState: gameSegmentSaveRemoteState,
        resetRemote: gameSegmentResetRemote
      };

      R.curryService(gameSegmentModel);
      return gameSegmentModel;

      function gameSegmentCreate() {
        return {
          local: {
            display: false,
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
          },
          remote: {
            display: false,
            start: { x: 0, y: 0 },
            end: { x: 0, y: 0 }
          }
        };
      }
      function gameSegmentIsDisplayed(segment) {
        return R.view(REMOTE_DISPLAY_LENS, segment);
      }
      function gameSegmentToggleDisplay(segment) {
        return R.over(REMOTE_DISPLAY_LENS, R.not, segment);
      }
      function gameSegmentSetLocal(start, end, segment) {
        return R.over(R.lensProp('local'), R.pipe(R.assoc('start', R.clone(start)), R.assoc('end', R.clone(end)), R.assoc('display', true)), segment);
      }
      function gameSegmentSetRemote(start, end, segment) {
        return R.thread(segment)(R.assocPath(['local', 'display'], false), R.assocPath(['remote', 'start'], R.clone(start)), R.assocPath(['remote', 'end'], R.clone(end)), R.assocPath(['remote', 'display'], true));
      }
      function gameSegmentSaveRemoteState(segment) {
        return R.clone(R.prop('remote', segment));
      }
      function gameSegmentResetRemote(remote, segment) {
        return R.assoc('remote', R.clone(remote), segment);
      }
    };
  }
})();
//# sourceMappingURL=segment.js.map
