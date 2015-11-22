'use strict';

angular.module('clickApp.services')
  .factory('commonMode', [
    'modes',
    'settings',
    'game',
    'gameTemplateSelection',
    function commonModeServiceFactory(modesService,
                                      settingsService,
                                      gameService,
                                      gameTemplateSelectionService) {
      var common_actions = {
        modeBackToDefault: function modeBackToDefault(scope) {
          return modesService.switchToMode('Default', scope, scope.modes);
        },
        commandUndoLast: function commandUndoLast(scope) {
          return gameService.undoLastCommand(scope, scope.game);
        },
        commandReplayNext: function commandReplayNext(scope) {
          return gameService.replayNextCommand(scope, scope.game);
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
        roll1D6: function roll1D6(scope) {
          return gameService.executeCommand('rollDice',
                                            6, 1,
                                            scope, scope.game);
        },
        roll2D6: function roll2D6(scope) {
          return gameService.executeCommand('rollDice',
                                            6, 2,
                                            scope, scope.game);
        },
        roll3D6: function roll3D6(scope) {
          return gameService.executeCommand('rollDice',
                                            6, 3,
                                            scope, scope.game);
        },
        roll4D6: function roll4D6(scope) {
          return gameService.executeCommand('rollDice',
                                            6, 4,
                                            scope, scope.game);
        },
        roll5D6: function roll5D6(scope) {
          return gameService.executeCommand('rollDice',
                                            6, 5,
                                            scope, scope.game);
        },
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
        toggleMenu: 'ctrl+m',
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
        bindings: R.clone(common_bindings),
      };
      settingsService.register('Bindings',
                               common_mode.name,
                               common_bindings,
                               function updateCommonBindings(bs) {
                                 R.extend(common_mode.bindings, bs);
                               });
      return common_mode;
    }
  ]);
