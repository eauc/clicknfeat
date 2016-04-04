(function() {
  angular.module('clickApp.services')
    .factory('createElementMode', createElementModeModelFactory);

  createElementModeModelFactory.$inject = [
    'appState',
    'commonMode',
  ];
  function createElementModeModelFactory(appStateService,
                                         commonModeModel) {
    const CREATE_LENS = R.lensProp('create');
    return function createElementModeModel(type) {
      const createElement_actions = Object.create(commonModeModel.actions);
      createElement_actions.moveMap = moveMap;
      createElement_actions.create = create;

      const createElement_default_bindings = {
        'create': 'clickMap'
      };
      const createElement_bindings = R.extend(Object.create(commonModeModel.bindings),
                                              createElement_default_bindings);
      const createElement_buttons = [];

      const createElement_mode = {
        onEnter: onEnter,
        onLeave: onLeave,
        name: `Create${s.capitalize(type)}`,
        actions: createElement_actions,
        buttons: createElement_buttons,
        bindings: createElement_bindings
      };
      const updateCreateBase$ = R.curry(updateCreateBase);
      return createElement_mode;

      function onEnter() {
        appStateService.emit('Game.moveMap.enable');
      }
      function onLeave() {
        appStateService.emit('Game.moveMap.disable');
      }
      function moveMap(state, coord) {
        // state.queueChangeEventP('Game.create.update');
        return R.over(
          CREATE_LENS,
          updateCreateBase$(coord),
          state
        );
      }
      function create(state, event) {
        const is_flipped = R.path(['ui_state','flip_map'], state);
        const create = R.thread(state)(
          R.view(CREATE_LENS),
          updateCreateBase$(event['click#'])
        );
        appStateService.chainReduce('Game.command.execute',
                                    `create${s.capitalize(type)}`,
                                    [ create, is_flipped ]);
        return R.set(CREATE_LENS, {}, state);
      }
      function updateCreateBase(coord, create) {
        return R.over(
          R.lensProp('base'),
          R.pipe(
            R.assoc('x', coord.x),
            R.assoc('y', coord.y)
          ),
          create
        );
      }
    };
  }
})();
