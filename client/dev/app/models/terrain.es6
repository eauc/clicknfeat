(function() {
  angular.module('clickApp.services')
    .factory('terrain', terrainModelFactory);

  terrainModelFactory.$inject = [
    'settings',
    'element',
    'gameTerrainInfo',
  ];
  function terrainModelFactory(settingsModel,
                               elementModel,
                               gameTerrainInfoModel) {
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

    const base = elementModel('terrain', MOVES);
    const terrainModel = Object.create(base);
    R.deepExtend(terrainModel, {
      create: terrainCreate,
      render: terrainModelRender
    });
    R.curryService(terrainModel);
    return terrainModel;

    function terrainCreate(terrains, terr) {
      const info = gameTerrainInfoModel
              .getInfo(terr.info, terrains);
      if(R.isNil(info)) return null;

      return R.thread(terr)(
        (terr) => base.create(terr),
        R.assoc('info', info)
      );
    }
    function terrainModelRender(terr) {
      const info = terr.info;
      return {
        stamp: terr.state.stamp,
        img_link: info.img.link,
        width: info.img.width,
        height: info.img.height,
        x: terr.state.x - info.img.width / 2,
        y: terr.state.y - info.img.height / 2,
        transform: [
          'translate(',
          terr.state.x - info.img.width / 2,
          ',',
          terr.state.y - info.img.height / 2,
          ') rotate(',
          terr.state.r,
          ',',
          info.img.width / 2,
          ',',
          info.img.height / 2,
          ')'
        ].join('')
      };
    }
  }
})();
