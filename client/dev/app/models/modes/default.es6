(function() {
  angular.module('clickApp.services')
    .factory('defaultMode', defaultModeModelFactory);

  defaultModeModelFactory.$inject = [
    'modes',
    'settings',
    'commonMode',
    // 'game',
    // 'template',
    // 'gameTemplateSelection',
    // 'gameModels',
    // 'gameModelSelection',
    'gameTerrainSelection',
  ];
  function defaultModeModelFactory(modesService,
                                   settingsModel,
                                   commonModeModel,
                                   // gameService,
                                   // templateService,
                                   // gameTemplateSelectionService,
                                   // gameModelsService,
                                   // gameModelSelectionService,
                                   gameTerrainSelectionModel) {
    const default_actions = Object.create(commonModeModel.actions);
    // default_actions.setModelSelection = setModelSelection;
    // default_actions.toggleModelSelection = toggleModelSelection;
    // default_actions.modelSelectionDetail = modelSelectionDetail;
    // default_actions.selectTemplate = selectTemplate;
    // default_actions.templateSelectionDetail = templateSelectionDetail;
    default_actions.selectTerrain = selectTerrain;
    // default_actions.enterRulerMode = enterRulerMode;
    // default_actions.enterLosMode = enterLosMode;
    // default_actions.dragStartMap = dragStartMap;
    // default_actions.dragMap = dragMap;
    // default_actions.dragEndMap = dragEndMap;

    const default_default_bindings = {
      // enterRulerMode: 'ctrl+r',
      // enterLosMode: 'ctrl+l',
      // setModelSelection: 'clickModel',
      // toggleModelSelection: 'ctrl+clickModel',
      // modelSelectionDetail: 'rightClickModel',
      // selectTemplate: 'clickTemplate',
      // templateSelectionDetail: 'rightClickTemplate',
      selectTerrain: 'clickTerrain'
    };
    const default_bindings = R.extend(Object.create(commonModeModel.bindings),
                                      default_default_bindings);
    const default_buttons = [];
    const default_mode = {
      name: 'Default',
      onEnter: onEnter,
      actions: default_actions,
      buttons: default_buttons,
      bindings: default_bindings
    };
    modesService.registerMode(default_mode);
    settingsModel.register('Bindings',
                           default_mode.name,
                           default_default_bindings,
                           (bs) => {
                             R.extend(default_mode.bindings, bs);
                           });
    return default_mode;

    // function clearTemplateSelection$(state) {
    //   return () => {
    //     return state.event('Game.update', R.lensProp('template_selection'),
    //                        gameTemplateSelectionService.clear$('local', state));
    //   };
    // }
    // function clearTerrainSelection$(state) {
    //   return () => {
    //     return state.event('Game.update', R.lensProp('terrain_selection'),
    //                        gameTerrainSelectionService.clear$('local', state));
    //   };
    // }
    // function setModelSelection(state, event) {
    //   return R.pipePromise(
    //     clearTemplateSelection$(state),
    //     clearTerrainSelection$(state),
    //     () => {
    //       const stamp = event['click#'].target.state.stamp;
    //       return state.event('Game.command.execute',
    //                          'setModelSelection', ['set', [stamp]]);
    //     }
    //   )();
    // }
    // function toggleModelSelection(state, event) {
    //   return R.pipePromise(
    //     clearTemplateSelection$(state),
    //     clearTerrainSelection$(state),
    //     () => {
    //       const stamp = event['click#'].target.state.stamp;
    //       if(gameModelSelectionService.in('local', stamp, state.game.model_selection)) {
    //         return state.event('Game.command.execute',
    //                            'setModelSelection', ['removeFrom', [stamp]]);
    //       }
    //       else {
    //         return state.event('Game.command.execute',
    //                            'setModelSelection', ['addTo', [stamp]]);
    //       }
    //     }
    //   )();
    // }
    // function modelSelectionDetail(state, event) {
    //   return R.pipePromise(
    //     clearTemplateSelection$(state),
    //     clearTerrainSelection$(state),
    //     () => {
    //       const stamp = event['click#'].target.state.stamp;
    //       state.changeEvent('Game.selectionDetail.open',
    //                         'model', event['click#'].target);
    //       return state.event('Game.command.execute',
    //                          'setModelSelection', ['set', [stamp]]);
    //     }
    //   )();
    // }
    // function selectTemplate(state, event) {
    //   return R.pipePromise(
    //     clearTerrainSelection$(state),
    //     () => {
    //       return state
    //         .event('Game.update', R.lensProp('template_selection'),
    //                gameTemplateSelectionService.set$('local',
    //                                                  [event['click#'].target.state.stamp],
    //                                                  state));
    //     }
    //   )();
    // }
    // function templateSelectionDetail(state, event) {
    //   return R.pipePromise(
    //     clearTerrainSelection$(state),
    //     () => {
    //       return state
    //         .event('Game.update', R.lensProp('template_selection'),
    //                gameTemplateSelectionService.set$('local',
    //                                                  [event['click#'].target.state.stamp],
    //                                                  state));
    //     },
    //     () => { return state.changeEvent('Game.selectionDetail.open',
    //                                      'template', event['click#'].target); }
    //   )();
    // }
    function selectTerrain(state, event) {
      return R.threadP()(
        // clearTemplateSelection$(state),
        () => {
          return state.eventP(
            'Game.update', R.lensProp('terrain_selection'),
            gameTerrainSelectionModel.set$(
              'local',
              [event['click#'].target.state.stamp],
              state
            )
          );
        }
      );
    }
    // function enterRulerMode(state) {
    //   return state.event('Modes.switchTo', 'Ruler');
    // }
    // function enterLosMode(state) {
    //   return state.event('Modes.switchTo', 'LoS');
    // }
    // function dragStartMap(state, event) {
    //   state.changeEvent('Game.dragBox.enable', event.start, event.now);
    // }
    // function dragMap(state, event) {
    //   state.changeEvent('Game.dragBox.enable', event.start, event.now);
    // }
    // function dragEndMap(state, event) {
    //   state.changeEvent('Game.dragBox.disable');
    //   const top_left = {
    //     x: Math.min(event.now.x, event.start.x),
    //     y: Math.min(event.now.y, event.start.y)
    //   };
    //   const bottom_right = {
    //     x: Math.max(event.now.x, event.start.x),
    //     y: Math.max(event.now.y, event.start.y)
    //   };
    //   return R.pipeP(
    //     gameModelsService.findStampsBetweenPoints$(top_left, bottom_right),
    //     function(stamps) {
    //       if(R.isEmpty(stamps)) {
    //         return null;
    //       }
    //       return state.event('Game.command.execute',
    //                          'setModelSelection', ['set', stamps]);
    //     }
    //   )(state.game.models);
    // }
    function onEnter(state) {
      if(R.isNil(state.game.terrain_selection)) {
        return null;
      }
      return R.thread()(
        () => gameTerrainSelectionModel
          .checkModeP(state, state.game.terrain_selection),
        // () => gameTemplateSelectionService
        //   .checkModeP(state, state.game.template_selection),
        // R.condErrorP([
        //   [ R.T, () => gameTerrainSelectionModel
        //     .checkModeP(state, state.game.terrain_selection) ]
        // ]),
        // R.condErrorP([
        //   [ R.T, () => gameModelSelectionService
        //     .checkModeP(state, state.game.model_selection) ]
        // ]),
        R.condErrorP([
          [ R.T, R.always(null) ]
        ])
      );
    }
  }
})();
