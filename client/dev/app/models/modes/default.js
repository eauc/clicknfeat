'use strict';

(function () {
  angular.module('clickApp.services').factory('defaultMode', defaultModeModelFactory);

  defaultModeModelFactory.$inject = ['appState', 'modes', 'settings', 'commonMode',
  // 'gameModels',
  // 'gameModelSelection',
  'gameTemplateSelection', 'gameTerrainSelection'];
  var TERRAIN_SELECTION_LENS = R.lensPath(['game', 'terrain_selection']);
  var TEMPLATE_SELECTION_LENS = R.lensPath(['game', 'template_selection']);
  function defaultModeModelFactory(appStateService, modesModel, settingsModel, commonModeModel,
  // gameModelsModel,
  // gameModelSelectionModel,
  gameTemplateSelectionModel, gameTerrainSelectionModel) {
    var default_actions = Object.create(commonModeModel.actions);
    // default_actions.setModelSelection = setModelSelection;
    // default_actions.toggleModelSelection = toggleModelSelection;
    // default_actions.modelSelectionDetail = modelSelectionDetail;
    default_actions.selectTemplate = selectTemplate;
    default_actions.templateSelectionDetail = templateSelectionDetail;
    default_actions.selectTerrain = selectTerrain;
    // default_actions.enterRulerMode = enterRulerMode;
    // default_actions.enterLosMode = enterLosMode;
    // default_actions.dragStartMap = dragStartMap;
    // default_actions.dragMap = dragMap;
    // default_actions.dragEndMap = dragEndMap;

    var default_default_bindings = {
      enterRulerMode: 'ctrl+r',
      enterLosMode: 'ctrl+l',
      setModelSelection: 'clickModel',
      toggleModelSelection: 'ctrl+clickModel',
      modelSelectionDetail: 'rightClickModel',
      selectTemplate: 'clickTemplate',
      templateSelectionDetail: 'rightClickTemplate',
      selectTerrain: 'clickTerrain'
    };
    var default_bindings = R.extend(Object.create(commonModeModel.bindings), default_default_bindings);
    var default_buttons = [];
    var default_mode = {
      name: 'Default',
      actions: default_actions,
      buttons: default_buttons,
      bindings: default_bindings
    };
    modesModel.registerMode(default_mode);
    settingsModel.register('Bindings', default_mode.name, default_default_bindings, function (bs) {
      R.extend(default_mode.bindings, bs);
    });
    return default_mode;

    // function setModelSelection(state, event) {
    //   return R.threadP()(
    //     clearTemplateSelection$(state),
    //     clearTerrainSelection$(state),
    //     () => event['click#'].target.state.stamp,
    //     (stamp) => state.eventP('Game.command.execute',
    //                             'setModelSelection',
    //                             ['set', [stamp]])
    //   );
    // }
    // function toggleModelSelection(state, event) {
    //   return R.threadP()(
    //     clearTemplateSelection$(state),
    //     clearTerrainSelection$(state),
    //     () => event['click#'].target.state.stamp,
    //     (stamp) => {
    //       if(gameModelSelectionModel.in('local', stamp,
    //                                     state.game.model_selection)) {
    //         return state.eventP('Game.command.execute',
    //                             'setModelSelection',
    //                             ['removeFrom', [stamp]]);
    //       }
    //       else {
    //         return state.eventP('Game.command.execute',
    //                             'setModelSelection',
    //                             ['addTo', [stamp]]);
    //       }
    //     }
    //   );
    // }
    // function modelSelectionDetail(state, event) {
    //   return R.threadP()(
    //     clearTemplateSelection$(state),
    //     clearTerrainSelection$(state),
    //     () => event['click#'].target.state.stamp,
    //     (stamp) => {
    //       state.queueChangeEventP('Game.selectionDetail.open',
    //                               'model', event['click#'].target);
    //       return state.eventP('Game.command.execute',
    //                           'setModelSelection', ['set', [stamp]]);
    //     }
    //   );
    // }
    function selectTemplate(state, event) {
      return R.thread(state)(clearTerrainSelection, R.over(TEMPLATE_SELECTION_LENS, gameTemplateSelectionModel.set$('local', [event['click#'].target.state.stamp])));
    }
    function templateSelectionDetail(state, event) {
      appStateService.emit('Game.selectionDetail.open', 'template', event['click#'].target);
      return selectTemplate(state, event);
    }
    function selectTerrain(state, event) {
      return R.thread(state)(clearTemplateSelection, R.over(TERRAIN_SELECTION_LENS, gameTerrainSelectionModel.set$('local', [event['click#'].target.state.stamp])));
    }
    // function enterRulerMode(state) {
    //   return state.eventP('Modes.switchTo', 'Ruler');
    // }
    // function enterLosMode(state) {
    //   return state.eventP('Modes.switchTo', 'Los');
    // }
    // function dragStartMap(state, event) {
    //   state.queueChangeEventP('Game.dragBox.enable', event.start, event.now);
    // }
    // function dragMap(state, event) {
    //   state.queueChangeEventP('Game.dragBox.enable', event.start, event.now);
    // }
    // function dragEndMap(state, event) {
    //   state.queueChangeEventP('Game.dragBox.disable');
    //   const top_left = {
    //     x: Math.min(event.now.x, event.start.x),
    //     y: Math.min(event.now.y, event.start.y)
    //   };
    //   const bottom_right = {
    //     x: Math.max(event.now.x, event.start.x),
    //     y: Math.max(event.now.y, event.start.y)
    //   };
    //   return R.threadP(state.game)(
    //     R.prop('models'),
    //     (models) => gameModelsModel
    //       .findStampsBetweenPointsP(top_left, bottom_right, models)
    //       .catch(R.always([])),
    //     (stamps) => {
    //       if(R.isEmpty(stamps)) return null;
    //       return state.eventP('Game.command.execute',
    //                           'setModelSelection',
    //                           ['set', stamps]);
    //     }
    //   );
    // }
    function clearTemplateSelection(state) {
      return R.over(TEMPLATE_SELECTION_LENS, R.unless(gameTemplateSelectionModel.isEmpty$('local'), gameTemplateSelectionModel.clear$('local')), state);
    }
    function clearTerrainSelection(state) {
      return R.over(TERRAIN_SELECTION_LENS, R.unless(gameTerrainSelectionModel.isEmpty$('local'), gameTerrainSelectionModel.clear$('local')), state);
    }
  }
})();
//# sourceMappingURL=default.js.map
