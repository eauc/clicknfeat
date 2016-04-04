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
      render: terrainModelRender
    });
    R.curryService(terrainModel);
    return terrainModel;

    function terrainModelRender(infos, state) {
      var info = gameTerrainInfoModel.getInfo(state.info, infos);
      return {
        stamp: state.stamp,
        img_link: info.img.link,
        width: info.img.width,
        height: info.img.height,
        x: state.x - info.img.width / 2,
        y: state.y - info.img.height / 2,
        transform: ['translate(', state.x - info.img.width / 2, ',', state.y - info.img.height / 2, ') rotate(', state.r, ',', info.img.width / 2, ',', info.img.height / 2, ')'].join('')
      };
    }
  }
})();
//# sourceMappingURL=terrain.js.map
