'use strict';

(function () {
  angular.module('clickApp.services').factory('terrain', terrainModelFactory);

  terrainModelFactory.$inject = ['settings', 'element', 'gameTerrainInfo'];
  function terrainModelFactory(settingsModel, elementModel, gameTerrainInfoModel) {
    var DEFAULT_MOVES = {
      Move: 10,
      MoveSmall: 1,
      Rotate: 15,
      RotateSmall: 5,
      Shift: 10,
      ShiftSmall: 1
    };
    var MOVES = R.clone(DEFAULT_MOVES);
    settingsModel.register('Misc', 'Terrain', DEFAULT_MOVES, function (moves) {
      R.extend(MOVES, moves);
    });

    var base = elementModel('terrain', MOVES);
    var terrainModel = Object.create(base);
    R.deepExtend(terrainModel, {
      create: terrainCreate,
      render: terrainModelRender
    });
    R.curryService(terrainModel);
    return terrainModel;

    function terrainCreate(terrains, terr) {
      var info = gameTerrainInfoModel.getInfo(terr.info, terrains);
      if (R.isNil(info)) return null;

      return R.thread(terr)(function (terr) {
        return base.create(terr);
      }, R.assoc('info', info));
    }
    function terrainModelRender(terr) {
      var info = terr.info;
      return {
        stamp: terr.state.stamp,
        img_link: info.img.link,
        width: info.img.width,
        height: info.img.height,
        x: terr.state.x - info.img.width / 2,
        y: terr.state.y - info.img.height / 2,
        transform: ['translate(', terr.state.x - info.img.width / 2, ',', terr.state.y - info.img.height / 2, ') rotate(', terr.state.r, ',', info.img.width / 2, ',', info.img.height / 2, ')'].join('')
      };
    }
  }
})();
//# sourceMappingURL=terrain.js.map
