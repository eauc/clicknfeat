angular.module('clickApp.services')
  .factory('commonMode', [
    'modes',
    'settings',
    'game',
    function commonModeServiceFactory(modesService,
                                      settingsService) {
      var common_actions = {
        modeBackToDefault: (state) => {
          return state.event('Modes.switchTo', 'Default');
        },
        commandUndoLast: (state) => {
          return state.event('Game.command.undoLast');
        },
        commandReplayNext: (state) => {
          return state.event('Game.command.replayNext');
        },
        viewScrollLeft: (state) => {
          state.changeEvent('Game.view.scrollLeft');
        },
        viewScrollRight: (state) => {
          state.changeEvent('Game.view.scrollRight');
        },
        viewScrollUp: (state) => {
          state.changeEvent('Game.view.scrollUp');
        },
        viewScrollDown: (state) => {
          state.changeEvent('Game.view.scrollDown');
        },
        viewZoomIn: (state) => {
          state.changeEvent('Game.view.zoomIn');
        },
        viewZoomOut: (state) => {
          state.changeEvent('Game.view.zoomOut');
        },
        viewZoomReset: (state) => {
          state.changeEvent('Game.view.zoomReset');
        },
        flipMap: (state) => {
          state.changeEvent('Game.view.flipMap');
        },
        toggleMenu: (state) => {
          state.changeEvent('Game.toggleMenu');
        },
        roll1D6: (state) => {
          return state.event('Game.command.execute',
                             'rollDice', [6, 1]);
        },
        roll2D6: (state) => {
          return state.event('Game.command.execute',
                             'rollDice', [6, 2]);
        },
        roll3D6: (state) => {
          return state.event('Game.command.execute',
                             'rollDice', [6, 3]);
        },
        roll4D6: (state) => {
          return state.event('Game.command.execute',
                             'rollDice', [6, 4]);
        },
        roll5D6: (state) => {
          return state.event('Game.command.execute',
                             'rollDice', [6, 5]);
        }
      };
      var common_bindings = {
        commandUndoLast: 'ctrl+z',
        commandReplayNext: 'ctrl+y',
        modeBackToDefault: 'esc',
        viewScrollLeft: 'alt+left',
        viewScrollRight: 'alt+right',
        viewScrollUp: 'alt+up',
        viewScrollDown: 'alt+down',
        viewZoomIn: 'alt++',
        viewZoomOut: 'alt+-',
        viewZoomReset: 'alt+z',
        flipMap: 'ctrl+shift+f',
        toggleMenu: 'ctrl+shift+m'
        // roll1D6: 'd+1',
        // roll2D6: 'd+2',
        // roll3D6: 'd+3',
        // roll4D6: 'd+4',
        // roll5D6: 'd+5',
      };
      var common_mode = {
        name: 'Common',
        actions: common_actions,
        buttons: [],
        bindings: R.clone(common_bindings)
      };
      settingsService.register('Bindings',
                               common_mode.name,
                               common_bindings,
                               (bs) => {
                                 R.extend(common_mode.bindings, bs);
                               });
      return common_mode;
    }
  ]);
