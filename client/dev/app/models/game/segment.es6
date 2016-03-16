(function() {
  angular.module('clickApp.services')
    .factory('gameSegment', gameSegmentModelFactory);

  gameSegmentModelFactory.$inject = [];
  function gameSegmentModelFactory() {
    return function buildGameSegmentModel(type) {
      const gameSegmentModel = {
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
        return R.path(['remote','display'], segment);
      }
      function gameSegmentToggleDisplay(state, game, segment) {
        return R.thread(segment)(
          R.over(R.lensPath(['remote','display']), R.not),
          (segment) => {
            state.queueChangeEventP(`Game.${type}.remote.change`);
            return segment;
          }
        );
      }
      function gameSegmentSetLocal(start, end, state, game, segment) {
        return R.over(R.lensProp('local'), R.pipe(
          R.assoc('start', R.clone(start)),
          R.assoc('end', R.clone(end)),
          R.assoc('display', true),
          (local) => {
            state.queueChangeEventP(`Game.${type}.local.change`);
            return local;
          }
        ), segment);
      }
      function gameSegmentSetRemote(start, end, state, game, segment) {
        return R.thread(segment)(
          R.assocPath(['local','display'], false),
          R.assocPath(['remote','start'], R.clone(start)),
          R.assocPath(['remote','end'], R.clone(end)),
          R.assocPath(['remote','display'], true),
          (segment) => {
            state.queueChangeEventP(`Game.${type}.local.change`);
            state.queueChangeEventP(`Game.${type}.remote.change`);
            return segment;
          }
        );
      }
      function gameSegmentSaveRemoteState(segment) {
        return R.clone(R.prop('remote', segment));
      }
      function gameSegmentResetRemote(remote, state, game, segment) {
        return R.thread(segment)(
          R.assoc('remote', R.clone(remote)),
          (segment) => {
            state.queueChangeEventP(`Game.${type}.remote.change`);
            return segment;
          }
        );
      }
    };
  }
})();
