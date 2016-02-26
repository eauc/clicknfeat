(function() {
  angular.module('clickApp.services')
    .factory('createElementMode', createElementModeModelFactory);

  createElementModeModelFactory.$inject = [
    'commonMode',
  ];
  function createElementModeModelFactory(commonModeModel) {
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

      return createElement_mode;

      function onEnter(state) {
        state.queueChangeEventP(`Game.${type}.create.enable`);
        state.queueChangeEventP('Game.moveMap.enable');
      }
      function onLeave(state) {
        state.create = R.assoc(`${type}s`, null, state.create);
        state.queueChangeEventP('Game.moveMap.disable');
        state.queueChangeEventP(`Game.${type}.create.disable`);
      }
      function moveMap(state, coord) {
        updateCreateBase(coord, state);
        state.queueChangeEventP('Game.create.update');
      }
      function create(state, event) {
        let is_flipped = R.path(['ui_state','flip_map'], state);
        updateCreateBase(event['click#'], state);
        return state.eventP('Game.command.execute',
                            `create${s.capitalize(type)}`,
                            [ state.create, is_flipped ]);
      }
      function updateCreateBase(coord, state) {
        state.create = R.over(
          R.lensProp('base'),
          R.pipe(
            R.assoc('x', coord.x),
            R.assoc('y', coord.y)
          ),
          state.create
        );
      }
    };
  }
})();
