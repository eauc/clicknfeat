(function() {
  angular.module('clickApp.services')
    .factory('commonMode', commonModeModelFactory);

  commonModeModelFactory.$inject = [
    'settings',
    'appState',
  ];
  function commonModeModelFactory(settingsModel,
                                  appStateService) {
    const DEFAULT_SETTINGS = {
      DragEpsilon: 3,
      ScrollStep: 30,
      ZoomFactor: 2
    };
    const SETTINGS = R.clone(DEFAULT_SETTINGS);
    const common_actions = {
      modeBackToDefault: modeBackToDefault,
      commandUndoLast: commandUndoLast,
      commandReplayNext: commandReplayNext,
      viewScrollLeft: viewScrollLeft,
      viewScrollRight: viewScrollRight,
      viewScrollUp: viewScrollUp,
      viewScrollDown: viewScrollDown,
      viewZoomIn: viewZoomIn,
      viewZoomOut: viewZoomOut,
      viewZoomReset: viewZoomReset,
      flipMap: flipMap,
      toggleMenu: toggleMenu
    };
    const common_bindings = {
      modeBackToDefault: 'esc',
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
      toggleMenu: 'ctrl+shift+m'
    };
    const common_mode = {
      name: 'Common',
      actions: common_actions,
      buttons: [],
      bindings: R.clone(common_bindings),
      settings: () => SETTINGS
    };
    settingsModel.register('Misc',
                           common_mode.name,
                           DEFAULT_SETTINGS,
                           (settings) => {
                             R.extend(SETTINGS, settings);
                           });
    settingsModel.register('Bindings',
                           common_mode.name,
                           common_bindings,
                           (bs) => {
                             R.extend(common_mode.bindings, bs);
                           });
    return common_mode;

    function modeBackToDefault() {
      self.window.requestAnimationFrame(() => {
        appStateService.reduce('Modes.switchTo', 'Default');
      });
    }
    function commandUndoLast() {
      self.window.requestAnimationFrame(() => {
        appStateService.reduce('Game.command.undoLast');
      });
    }
    function commandReplayNext() {
      self.window.requestAnimationFrame(() => {
        appStateService.reduce('Game.command.replayNext');
      });
    }
    function viewScrollLeft() {
      appStateService.emit('Game.view.scrollLeft');
    }
    function viewScrollRight() {
      appStateService.emit('Game.view.scrollRight');
    }
    function viewScrollUp() {
      appStateService.emit('Game.view.scrollUp');
    }
    function viewScrollDown() {
      appStateService.emit('Game.view.scrollDown');
    }
    function viewZoomIn() {
      appStateService.emit('Game.view.zoomIn');
    }
    function viewZoomOut() {
      appStateService.emit('Game.view.zoomOut');
    }
    function viewZoomReset() {
      appStateService.emit('Game.view.zoomReset');
    }
    function flipMap() {
      appStateService.emit('Game.view.flipMap');
    }
    function toggleMenu() {
      appStateService.emit('Game.toggleMenu');
    }
  }
})();
