(function() {
  angular.module('clickApp.services')
    .factory('defaultMode', defaultModeModelFactory);

  defaultModeModelFactory.$inject = [
    'appAction',
    'modes',
    'settings',
    'commonMode',
    'gameModels',
    'gameModelSelection',
    'gameTemplateSelection',
    'gameTerrainSelection',
  ];
  function defaultModeModelFactory(appActionService,
                                   modesModel,
                                   settingsModel,
                                   commonModeModel,
                                   gameModelsModel,
                                   gameModelSelectionModel,
                                   gameTemplateSelectionModel,
                                   gameTerrainSelectionModel) {
    const DRAG_BOX_LENS = R.lensPath(['view','drag_box']);
    const MODEL_SELECTION_LENS = R.lensPath(['game','model_selection']);
    const TEMPLATE_SELECTION_LENS = R.lensPath(['game','template_selection']);
    const TERRAIN_SELECTION_LENS = R.lensPath(['game','terrain_selection']);

    const default_actions = Object.create(commonModeModel.actions);
    default_actions.setModelSelection = setModelSelection;
    default_actions.toggleModelSelection = toggleModelSelection;
    default_actions.modelSelectionDetail = modelSelectionDetail;
    default_actions.selectTemplate = selectTemplate;
    default_actions.templateSelectionDetail = templateSelectionDetail;
    default_actions.selectTerrain = selectTerrain;
    // default_actions.enterRulerMode = enterRulerMode;
    // default_actions.enterLosMode = enterLosMode;
    default_actions.dragStartMap = dragMap;
    default_actions.dragMap = dragMap;
    default_actions.dragEndMap = dragEndMap;

    const default_default_bindings = {
      enterRulerMode: 'ctrl+r',
      enterLosMode: 'ctrl+l',
      setModelSelection: 'clickModel',
      toggleModelSelection: 'ctrl+clickModel',
      modelSelectionDetail: 'rightClickModel',
      selectTemplate: 'clickTemplate',
      templateSelectionDetail: 'rightClickTemplate',
      selectTerrain: 'clickTerrain'
    };
    const default_bindings = R.extend(Object.create(commonModeModel.bindings),
                                      default_default_bindings);
    const default_buttons = [];
    const default_mode = {
      name: 'Default',
      actions: default_actions,
      buttons: default_buttons,
      bindings: default_bindings
    };
    modesModel.registerMode(default_mode);
    settingsModel.register('Bindings',
                           default_mode.name,
                           default_default_bindings,
                           (bs) => {
                             R.extend(default_mode.bindings, bs);
                           });
    return default_mode;

    function setModelSelection(state, event) {
      const stamp = event['click#'].target.state.stamp;
      appActionService
        .defer('Game.command.execute',
               'setModelSelection',
               [ 'set', [stamp] ]);
      return R.thread(state)(
        clearTemplateSelection,
        clearTerrainSelection
      );
    }
    function toggleModelSelection(state, event) {
      const stamp = event['click#'].target.state.stamp;
      const is_in_local = gameModelSelectionModel
              .in('local', stamp, R.view(MODEL_SELECTION_LENS, state));
      if(is_in_local) {
        appActionService
          .defer('Game.command.execute',
                 'setModelSelection',
                 ['removeFrom', [stamp]]);
      }
      else {
        appActionService
          .defer('Game.command.execute',
                 'setModelSelection',
                 ['addTo', [stamp]]);
      }
      return R.thread(state)(
        clearTemplateSelection,
        clearTerrainSelection
      );
    }
    function modelSelectionDetail(state, event) {
      return R.thread(state)(
        R.assocPath(['view','detail'], {
          type: 'model',
          element: event['click#'].target
        }),
        (state) => setModelSelection(state, event)
      );
    }
    function selectTemplate(state, event) {
      return R.thread(state)(
        clearTerrainSelection,
        R.over(
          TEMPLATE_SELECTION_LENS,
          gameTemplateSelectionModel.set$(
            'local',
            [event['click#'].target.state.stamp]
          )
        )
      );
    }
    function templateSelectionDetail(state, event) {
      return R.thread(state)(
        (state) => selectTemplate(state, event),
        R.assocPath(['view','detail'], {
          type: 'template',
          element: event['click#'].target
        })
      );
    }
    function selectTerrain(state, event) {
      return R.thread(state)(
        clearTemplateSelection,
        R.over(
          TERRAIN_SELECTION_LENS,
          gameTerrainSelectionModel.set$(
            'local',
            [event['click#'].target.state.stamp]
          )
        )
      );
    }
    // function enterRulerMode(_state_) {
    //   return appStateService.chainReduce('Modes.switchTo', 'Ruler');
    // }
    // function enterLosMode(_state_) {
    //   return appStateService.chainReduce('Modes.switchTo', 'Los');
    // }
    function dragMap(state, event) {
      return R.set(
        DRAG_BOX_LENS,
        convertDragEventToBox(event),
        state
      );
    }
    function dragEndMap(state, event) {
      const box = convertDragEventToBox(event);
      R.thread(state.game)(
        R.prop('models'),
        (models) => gameModelsModel
          .findStampsBetweenPoints(box.top_left, box.bottom_right, models),
        (stamps) => {
          if(R.isEmpty(stamps)) return;
          appActionService
            .defer('Game.command.execute',
                   'setModelSelection',
                   ['set', stamps]);
        }
      );
      return R.set(DRAG_BOX_LENS, {}, state);
    }
    function clearTemplateSelection(state) {
      return R.over(
        TEMPLATE_SELECTION_LENS,
        R.unless(
          gameTemplateSelectionModel.isEmpty$('local'),
          gameTemplateSelectionModel.clear$('local')
        ),
        state
      );
    }
    function clearTerrainSelection(state) {
      return R.over(
        TERRAIN_SELECTION_LENS,
        R.unless(
          gameTerrainSelectionModel.isEmpty$('local'),
          gameTerrainSelectionModel.clear$('local')
        ),
        state
      );
    }
    function convertDragEventToBox(event) {
      return {
        top_left: { x: Math.min(event.start.x, event.now.x),
                    y: Math.min(event.start.y, event.now.y)
                  },
        bottom_right: { x: Math.max(event.start.x, event.now.x),
                        y: Math.max(event.start.y, event.now.y)
                      }
      };
    }
  }
})();
