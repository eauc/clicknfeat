'use strict';

(function () {
  angular.module('clickApp.services').factory('segmentMode', segmentModeModelFactory);

  segmentModeModelFactory.$inject = ['appState', 'modes', 'settings', 'commonMode', 'gameModels', 'gameModelSelection'];
  function segmentModeModelFactory(appStateService, modesModel, settingsModel, commonModeModel, gameModelsModel, gameModelSelectionModel) {
    return function buildSegmentModeModel(type, gameSegmentModel, default_bindings) {
      var TYPE_LENS = R.lensPath(['game', type]);
      var segment_actions = Object.create(commonModeModel.actions);
      segment_actions['exit' + s.capitalize(type) + 'Mode'] = commonModeModel.actions.modeBackToDefault;
      segment_actions.dragStartMap = segmentDragStartMap;
      segment_actions.dragMap = segmentDragMap;
      segment_actions.dragEndMap = segmentDragEndMap;
      segment_actions.dragStartTemplate = segment_actions.dragStartMap;
      segment_actions.dragTemplate = segment_actions.dragMap;
      segment_actions.dragEndTemplate = segment_actions.dragEndMap;
      segment_actions.dragStartModel = segment_actions.dragStartMap;
      segment_actions.dragModel = segment_actions.dragMap;
      segment_actions.dragEndModel = segment_actions.dragEndMap;

      var segment_bindings = R.extend(Object.create(commonModeModel.bindings), default_bindings);
      var segment_buttons = [];
      var segment_mode = {
        onEnter: segmentOnEnter,
        onLeave: segmentOnLeave,
        name: s.capitalize(type),
        actions: segment_actions,
        buttons: segment_buttons,
        bindings: segment_bindings
      };
      modesModel.registerMode(segment_mode);
      settingsModel.register('Bindings', segment_mode.name, default_bindings, function (bs) {
        R.extend(segment_mode.bindings, bs);
      });
      return segment_mode;

      function segmentDragStartMap(state, drag) {
        return R.over(TYPE_LENS, gameSegmentModel.setLocal$(drag.start, drag.now), state);
      }
      function segmentDragMap(state, drag) {
        return R.over(TYPE_LENS, gameSegmentModel.setLocal$(drag.start, drag.now), state);
      }
      function segmentDragEndMap(state, drag) {
        appStateService.chainReduce('Game.command.execute', 'set' + s.capitalize(type), ['setRemote', [drag.start, drag.now, state]]);
      }
      function segmentOnEnter(state) {
        R.thread(state)(R.path(['game', 'model_selection']), gameModelSelectionModel.get$('local'), function (stamps) {
          if (R.length(stamps) !== 1) return null;

          return gameModelsModel.findStamp(stamps[0], state.game.models);
        }, function (model) {
          if (R.isNil(model)) return;

          appStateService.chainReduce('Game.command.execute', 'set' + s.capitalize(type), ['setOriginResetTarget', [model, state]]);
        });
      }
      function segmentOnLeave() {
        appStateService.emit('Game.' + type + '.remote.change');
      }
    };
  }
})();
//# sourceMappingURL=segment.js.map
