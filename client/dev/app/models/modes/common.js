'use strict';

(function () {
  angular.module('clickApp.services').factory('commonMode', commonModeModelFactory);

  commonModeModelFactory.$inject = ['settings', 'appState'];
  function commonModeModelFactory(settingsModel, appStateService) {
    var DEFAULT_SETTINGS = {
      DragEpsilon: 3,
      ScrollStep: 30,
      ZoomFactor: 2
    };
    var SETTINGS = R.clone(DEFAULT_SETTINGS);
    var common_actions = {
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
    var common_bindings = {
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
    var common_mode = {
      name: 'Common',
      actions: common_actions,
      buttons: [],
      bindings: R.clone(common_bindings),
      settings: function settings() {
        return SETTINGS;
      }
    };
    settingsModel.register('Misc', common_mode.name, DEFAULT_SETTINGS, function (settings) {
      R.extend(SETTINGS, settings);
    });
    settingsModel.register('Bindings', common_mode.name, common_bindings, function (bs) {
      R.extend(common_mode.bindings, bs);
    });
    return common_mode;

    function modeBackToDefault() {
      self.window.requestAnimationFrame(function () {
        appStateService.reduce('Modes.switchTo', 'Default');
      });
    }
    function commandUndoLast() {
      self.window.requestAnimationFrame(function () {
        appStateService.reduce('Game.command.undoLast');
      });
    }
    function commandReplayNext() {
      self.window.requestAnimationFrame(function () {
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
//# sourceMappingURL=common.js.map
