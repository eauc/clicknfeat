'use strict';

self.commonModeServiceFactory = function commonModeServiceFactory(modesService) {
  var common_actions = {
    zoomIn: function zoomIn(scope) {
      scope.gameEvent('zoomIn');
    },
    zoomOut: function zoomOut(scope) {
      scope.gameEvent('zoomOut');
    },
    zoomReset: function zoomReset(scope) {
      scope.gameEvent('zoomReset');
    },
    flipMap: function flipMap(scope) {
      scope.gameEvent('flipMap');
    },
    toggleMenu: function toggleMenu(scope) {
      scope.gameEvent('toggleMenu');
    },
  };
  var common_bindings = {
    zoomIn: 'alt++',
    zoomOut: 'alt+-',
    zoomReset: 'alt+z',
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
