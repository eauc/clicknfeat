(function() {
  angular.module('clickApp.services')
    .factory('gameBoard', gameBoardModelFactory);

  gameBoardModelFactory.$inject = [
    'http',
  ];
  function gameBoardModelFactory(httpService) {
    const gameBoardModel = {
      initP: gameBoardInitP,
      name: gameBoardName,
      forName: gameBoardForName
    };
    R.curryService(gameBoardModel);
    return gameBoardModel;

    function gameBoardInitP() {
      return R.thread('/data/boards.json')(
        httpService.getP,
        R.condErrorP([
          [ R.T, R.pipe(R.spyError('Error getting boards.json'),
                        R.always([])) ]
        ])
      );
    }
    function gameBoardName(board) {
      return R.prop('name', board);
    }
    function gameBoardForName(name, boards) {
      return R.find(R.propEq('name', name), boards);
    }
  }
})();
