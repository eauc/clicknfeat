'use strict';

self.commonModeServiceFactory = function commonModeServiceFactory(modesService,
                                                                  gameService) {
  var common_actions = {
    commandUndoLast: function commandUndoLast(scope) {
      gameService.undoLastCommand(scope, scope.game);
    },
    commandReplayNext: function commandReplayNext(scope) {
      gameService.replayNextCommand(scope, scope.game);
    },
    viewScrollLeft: function viewZoomLeft(scope) {
      scope.gameEvent('viewScrollLeft');
    },
    viewScrollRight: function viewZoomRight(scope) {
      scope.gameEvent('viewScrollRight');
    },
    viewScrollUp: function viewZoomUp(scope) {
      scope.gameEvent('viewScrollUp');
    },
    viewScrollDown: function viewZoomDown(scope) {
      scope.gameEvent('viewScrollDown');
    },
    viewZoomIn: function viewZoomIn(scope) {
      scope.gameEvent('viewZoomIn');
    },
    viewZoomOut: function viewZoomOut(scope) {
      scope.gameEvent('viewZoomOut');
    },
    viewZoomReset: function viewZoomReset(scope) {
      scope.gameEvent('viewZoomReset');
    },
    flipMap: function flipMap(scope) {
      scope.gameEvent('flipMap');
    },
    toggleMenu: function toggleMenu(scope) {
      scope.gameEvent('toggleMenu');
    },
  };
  var common_bindings = {
    commandUndoLast: 'ctrl+z',
    commandReplayNext: 'ctrl+y',
    viewScrollLeft: 'alt+left',
    viewScrollRight: 'alt+right',
    viewScrollUp: 'alt+up',
    viewScrollDown: 'alt+down',
    viewZoomIn: 'alt++',
    viewZoomOut: 'alt+-',
    viewZoomReset: 'alt+z',
    flipMap: 'ctrl+shift+f',
    toggleMenu: 'ctrl+m',
  };
  var common_mode = {
    name: 'Common',
    actions: common_actions,
    buttons: [],
    bindings: common_bindings,
  };
  return common_mode;
};
