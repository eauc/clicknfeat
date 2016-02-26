(function() {
  angular.module('clickApp.services')
    .factory('terrain', terrainModelFactory);

  terrainModelFactory.$inject = [
    'settings',
    'element'
  ];
  function terrainModelFactory(settingsModel,
                               elementModel) {
    const DEFAULT_MOVES = {
      Move: 10,
      MoveSmall: 1,
      Rotate: 15,
      RotateSmall: 5,
      Shift: 10,
      ShiftSmall: 1
    };
    const MOVES = R.clone(DEFAULT_MOVES);
    settingsModel.register('Misc',
                           'Terrain',
                           DEFAULT_MOVES,
                           (moves) => {
                             R.extend(MOVES, moves);
                           });
    return elementModel('terrain', MOVES);
  }
})();
