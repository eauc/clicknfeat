'use strict';

self.gameBoardServiceFactory = function gameBoardServiceFactory(httpService) {
  var gameBoardService = {
    init: function gameBoardInit() {
      return httpService.get('/data/boards.json')
        .catch(function(reason) {
          console.log('error getting boards.json', reason);
        });
    },
    name: function gameBoardName(board) {
      return R.prop('name', board);
    },
    forName: function gameBoardForName(name, boards) {
      return R.find(R.propEq('name', name), boards);
    },
  };
  return gameBoardService;
};
