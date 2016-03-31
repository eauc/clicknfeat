'use strict';

(function () {
  angular.module('clickApp.services').factory('gameBoard', gameBoardModelFactory);

  gameBoardModelFactory.$inject = ['http'];
  function gameBoardModelFactory(httpService) {
    var gameBoardModel = {
      initP: gameBoardInitP,
      name: gameBoardName,
      forName: gameBoardForName
    };
    R.curryService(gameBoardModel);
    return gameBoardModel;

    function gameBoardInitP() {
      return httpService.getP('/data/boards.json').catch(function (error) {
        R.spyError('Error getting boards.json')(error);
        return [];
      });
    }
    function gameBoardName(board) {
      return R.prop('name', board);
    }
    function gameBoardForName(name, boards) {
      return R.find(R.propEq('name', name), boards);
    }
  }
})();
//# sourceMappingURL=board.js.map
