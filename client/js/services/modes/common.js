self.commonModeServiceFactory = function commonModeServiceFactory(modesService) {
  var common_actions = {
    zoomIn: function zoomIn(scope) {
      scope.$broadcast('zoomIn');
    },
    zoomOut: function zoomOut(scope) {
      scope.$broadcast('zoomOut');
    },
    zoomReset: function zoomReset(scope) {
      scope.$broadcast('zoomReset');
    },
    flipMap: function flipMap(scope) {
      scope.$broadcast('flipMap');
    },
    toggleMenu: function toggleMenu(scope) {
      scope.$broadcast('toggleMenu');
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
